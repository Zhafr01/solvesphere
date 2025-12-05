import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { usePartner } from '../../context/PartnerContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import CustomSelect from '../../components/ui/CustomSelect';

export default function CreateTopic() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { currentPartner } = usePartner() || {};
    const [loading, setLoading] = useState(false);
    const [partners, setPartners] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'General',
        partner_id: currentPartner?.id || user?.partner_id || ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const { data } = await api.get('/landing-page');
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
        console.log("Submitting topic...", formData);
        setLoading(true);
        setError('');

        try {
            await api.post('/forum-topics', formData);
            alert('Topic created successfully!');
            navigate('/forum');
        } catch (err) {
            console.error("Submission error:", err);
            const msg = err.response?.data?.message || 'Failed to create topic';
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
                    <CardTitle className="text-gray-900 dark:text-white">Start a New Discussion</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Topic Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                                placeholder="What is this discussion about?"
                            />
                        </div>

                        {!currentPartner && (
                            <div>
                                <CustomSelect
                                    label="Partner (Optional)"
                                    value={formData.partner_id}
                                    onChange={(val) => setFormData({ ...formData, partner_id: val })}
                                    options={[
                                        { value: "", label: "-- General Discussion --" },
                                        ...partners.map(p => ({ value: p.id, label: p.name }))
                                    ]}
                                    placeholder="Select Partner"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select a partner if this topic is specific to one.</p>
                            </div>
                        )}

                        <div>
                            <CustomSelect
                                label="Category"
                                value={formData.category}
                                onChange={(val) => setFormData({ ...formData, category: val })}
                                options={[
                                    { value: "General", label: "General" },
                                    { value: "Support", label: "Support" },
                                    { value: "Feedback", label: "Feedback" },
                                    { value: "Announcements", label: "Announcements" },
                                ]}
                                placeholder="Select Category"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                rows="8"
                                className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                                placeholder="Write your post here..."
                            ></textarea>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/forum')}
                                className="btn-secondary mr-3"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                            >
                                {loading ? 'Posting...' : 'Post Topic'}
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
