import React, { useState } from 'react';
import api from '../../../lib/api';
import { Save, ArrowLeft, Globe, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SiteSettings() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        siteName: 'SolveSphere',
        siteDescription: 'A platform for community problem solving.',
        contactEmail: 'admin@solvesphere.com'
    });

    React.useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings?group=general');
            const data = response.data;
            if (data && Object.keys(data).length > 0) {
                setFormData(prev => ({
                    ...prev,
                    siteName: data.siteName || 'SolveSphere',
                    siteDescription: data.siteDescription || 'A platform for community problem solving.',
                    contactEmail: data.contactEmail || 'admin@solvesphere.com'
                }));
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/settings', { ...formData, group: 'general' });
            alert('Site settings saved successfully!');
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert('Failed to save site settings.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    to="/super-admin/settings"
                    className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                    title="Go Back"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Site Information</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Configure global site settings.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Globe className="h-4 w-4 text-slate-400" />
                                Site Name
                            </label>
                            <input
                                type="text"
                                name="siteName"
                                value={formData.siteName}
                                onChange={handleChange}
                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="Enter site name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Mail className="h-4 w-4 text-slate-400" />
                                Contact Email
                            </label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="admin@example.com"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Site Description</label>
                            <textarea
                                name="siteDescription"
                                value={formData.siteDescription}
                                onChange={handleChange}
                                rows="3"
                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                                placeholder="Enter site description..."
                            />
                        </div>


                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-700">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                        >
                            <Save className="h-4 w-4" />
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
