import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { usePartner } from '../../context/PartnerContext';
import { ArrowLeft, Calendar, Tag, Trash2 } from 'lucide-react';
import PageLoader from '../../components/ui/PageLoader';

export default function ReportDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { currentPartner } = usePartner() || {};
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adminNote, setAdminNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', content: '', category: '', urgency: '' });

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const { data } = await api.get(`/reports/${id}`);
                setReport(data);
                setAdminNote(data.admin_note || '');
                setEditForm({
                    title: data.title,
                    content: data.description || data.content,
                    category: data.category,
                    urgency: data.urgency
                });
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

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this report?")) return;
        try {
            await api.delete(`/reports/${id}`);
            alert("Report deleted successfully");
            if (currentPartner) {
                navigate(`/partners/${currentPartner.slug}/reports`);
            } else {
                navigate('/reports');
            }
        } catch (error) {
            console.error("Failed to delete report", error);
            alert("Failed to delete report");
        }
    };

    const handleUpdate = async () => {
        setSaving(true);
        try {
            const { data } = await api.put(`/reports/${id}`, {
                ...editForm,
                status: report.status // maintain status
            });
            setReport(data.report || data); // API might return wrapped or direct
            setIsEditing(false);
            alert("Report updated successfully");
        } catch (error) {
            console.error("Failed to update report", error);
            alert("Failed to update report");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <PageLoader message="Loading report..." />;
    if (!report) return <div>Report not found.</div>;

    return (
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg p-6 transition-colors duration-300">


            <div className="flex justify-between items-start mb-6">
                <div className="w-full">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        className="text-2xl font-bold text-gray-800 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 min-w-[200px]"
                                    />
                                ) : (
                                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{report.title}</h1>
                                )}

                                {isEditing ? (
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border 
                                        ${report.status === 'resolved' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' :
                                                report.status === 'in_progress' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                                                    'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700'}`}>
                                            {report.status.replace('_', ' ')}
                                        </span>
                                        <div className="relative">
                                            <select
                                                value={editForm.urgency || 'Low'}
                                                onChange={(e) => setEditForm({ ...editForm, urgency: e.target.value })}
                                                className="appearance-none pl-3 pr-8 py-1 text-xs font-semibold rounded-full border border-gray-300 dark:border-slate-600 focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 cursor-pointer shadow-sm transition-all outline-none hover:bg-gray-50 dark:hover:bg-slate-700"
                                            >
                                                <option value="Low">Low Priority</option>
                                                <option value="Medium">Medium Priority</option>
                                                <option value="High">High Priority</option>
                                                <option value="Critical">Critical Priority</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-slate-400">
                                                <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                                                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border 
                                        ${report.status === 'resolved' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' :
                                                report.status === 'in_progress' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                                                    'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700'}`}>
                                            {report.status.replace('_', ' ')}
                                        </span>
                                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border
                                        ${report.urgency === 'Critical' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' :
                                                report.urgency === 'High' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800' :
                                                    report.urgency === 'Medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' :
                                                        'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'}`}>
                                            {report.urgency} Priority
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {user?.id === report.user_id && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="shrink-0 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg text-sm font-medium transition-colors"
                            >
                                Edit Report
                            </button>
                        )}
                        {(user?.id === report.user_id || (user?.role === 'super_admin' && !currentPartner) || (user?.role === 'partner_admin' && user?.partner_id === report.partner_id)) && !isEditing && (
                            <button
                                onClick={handleDelete}
                                className="shrink-0 px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>



            <hr className="my-6 border-gray-200 dark:border-slate-700" />
            <div className="prose max-w-none mb-6 dark:prose-invert">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Description</h3>
                {isEditing ? (
                    <>
                        <textarea
                            value={editForm.content}
                            onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                            rows="6"
                            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={saving}
                                className="px-4 py-2 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="text-gray-700 dark:text-slate-300 whitespace-pre-wrap">{report.description || report.content}</p>
                )}
            </div>

            <div className="flex items-center gap-6 pt-6 border-t border-gray-100 dark:border-slate-700/50 text-sm text-gray-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(report.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span>{report.category}</span>
                </div>
            </div>

            {/* Admin Note Section */}
            {((user?.role === 'super_admin' && !currentPartner) || user?.role === 'partner_admin') && (
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

            {/* Display Admin Note for non-admins (or restricted admins) if it exists */}
            {(!['super_admin', 'partner_admin'].includes(user?.role) || (user?.role === 'super_admin' && currentPartner)) && report.admin_note && (
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
