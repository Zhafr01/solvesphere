import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { usePartner } from '../../context/PartnerContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import CustomSelect from '../../components/ui/CustomSelect';

export default function CreateReport() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { currentPartner } = usePartner() || {};
    const [loading, setLoading] = useState(false);
    const [partners, setPartners] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Bug',
        urgency: 'Medium',
        partner_id: currentPartner?.id || user?.partner_id || ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch partners for the dropdown
        const fetchPartners = async () => {
            try {
                // Assuming we have an endpoint to get all partners or we can use the public one
                // For now, let's try to get them from a public endpoint or hardcode if needed for testing
                // Ideally, we should have an endpoint like /api/partners-list
                // Let's assume the user selects which partner this report is for
                // If we are on a partner site, it should auto-select
                const { data } = await api.get('/landing-page'); // Using landing page data which usually has partners
                setPartners(data.partners || []);
            } catch (err) {
                console.error("Failed to fetch partners", err);
            }
        };
        fetchPartners();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting report...", formData);
        setLoading(true);
        setError('');

        try {
            await api.post('/reports', formData);
            alert('Report submitted successfully!');
            navigate('/reports');
        } catch (err) {
            console.error("Submission error:", err);
            const msg = err.response?.data?.message || 'Failed to create report';
            setError(msg);
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="bg-white dark:bg-slate-800 transition-colors duration-300">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Submit a New Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                                placeholder="Brief summary of the issue"
                            />
                        </div>

                        <div>
                            <CustomSelect
                                label="Partner (Optional)"
                                value={formData.partner_id}
                                onChange={(val) => setFormData({ ...formData, partner_id: val })}
                                options={[
                                    { value: "", label: "-- Select Partner --" },
                                    ...partners.map(p => ({ value: p.id, label: p.name }))
                                ]}
                                placeholder="Select Partner"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Leave blank for general platform issues.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <CustomSelect
                                    label="Category"
                                    value={formData.category}
                                    onChange={(val) => setFormData({ ...formData, category: val })}
                                    options={[
                                        { value: "Bug", label: "Bug" },
                                        { value: "Feature Request", label: "Feature Request" },
                                        { value: "Account", label: "Account Issue" },
                                        { value: "Other", label: "Other" },
                                    ]}
                                    placeholder="Select Category"
                                />
                            </div>
                            <div>
                                <CustomSelect
                                    label="Urgency"
                                    value={formData.urgency}
                                    onChange={(val) => setFormData({ ...formData, urgency: val })}
                                    options={[
                                        { value: "Low", label: "Low" },
                                        { value: "Medium", label: "Medium" },
                                        { value: "High", label: "High" },
                                        { value: "Critical", label: "Critical" },
                                    ]}
                                    placeholder="Select Urgency"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="5"
                                className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                                placeholder="Detailed description of the problem..."
                            ></textarea>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/reports')}
                                className="btn-secondary mr-3"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                            >
                                {loading ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
