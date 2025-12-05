import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

export default function ReportDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adminNote, setAdminNote] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const { data } = await api.get(`/reports/${id}`);
                setReport(data);
                setAdminNote(data.admin_note || '');
            } catch (error) {
                console.error("Failed to fetch report", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id]);

    const handleSaveNote = async () => {
        setSaving(true);
        try {
            // We need to send status as well because validation requires it if we are admin
            await api.put(`/reports/${id}`, {
                admin_note: adminNote,
                status: report.status
            });
            setReport(prev => ({ ...prev, admin_note: adminNote }));
            alert("Note saved successfully");
        } catch (error) {
            console.error("Failed to save note", error);
            alert("Failed to save note");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading report...</div>;
    if (!report) return <div>Report not found.</div>;

    return (
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg p-6 transition-colors duration-300">
            <button onClick={() => navigate('/reports')} className="mb-4 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Reports
            </button>

            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{report.title}</h1>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-slate-400">
                        <span>{new Date(report.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{report.category}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                        ${report.urgency === 'Critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                            report.urgency === 'High' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                                report.urgency === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                    'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'}`}>
                        {report.urgency}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                        ${report.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                            report.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                                'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300'}`}>
                        {report.status}
                    </span>
                </div>
            </div>

            <div className="prose max-w-none mb-6 dark:prose-invert">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Description</h3>
                <p className="text-gray-700 dark:text-slate-300 whitespace-pre-wrap">{report.description || report.content}</p>
            </div>

            {/* Admin Note Section */}
            {['super_admin', 'partner_admin'].includes(user?.role) && (
                <div className="mt-8 border-t border-gray-200 dark:border-slate-700 pt-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Admin Note</h3>
                    <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                        <textarea
                            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400"
                            rows="4"
                            placeholder="Add a note or comment for this report..."
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                        />
                        <div className="mt-3 flex justify-end">
                            <button
                                onClick={handleSaveNote}
                                disabled={saving}
                                className="btn-primary text-sm"
                            >
                                {saving ? 'Saving...' : 'Save Note'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Display Admin Note for non-admins if it exists */}
            {!['super_admin', 'partner_admin'].includes(user?.role) && report.admin_note && (
                <div className="mt-8 border-t border-gray-200 dark:border-slate-700 pt-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Admin Note</h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-blue-900 dark:text-blue-100 text-sm whitespace-pre-wrap border border-blue-100 dark:border-blue-800">
                        {report.admin_note}
                    </div>
                </div>
            )}
        </div>
    );
}
