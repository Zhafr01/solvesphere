import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Save, ArrowLeft, Bell, Mail, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationSettings() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        emailNotifications: true,
        pushNotifications: false,
        digestFrequency: 'daily',
        newPartnerAlert: true,
        newReportAlert: true
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings?group=notification');
            const data = response.data;
            if (data && Object.keys(data).length > 0) {
                setFormData({
                    emailNotifications: data.emailNotifications === '1' || data.emailNotifications === true,
                    pushNotifications: data.pushNotifications === '1' || data.pushNotifications === true,
                    digestFrequency: data.digestFrequency || 'daily',
                    newPartnerAlert: data.newPartnerAlert === '1' || data.newPartnerAlert === true,
                    newReportAlert: data.newReportAlert === '1' || data.newReportAlert === true
                });
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
            await api.post('/settings', { ...formData, group: 'notification' });
            alert('Notification settings saved successfully!');
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert('Failed to save notification settings.');
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
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Notification Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Configure how and when you receive alerts.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="space-y-8">
                        {/* Email Notifications */}
                        <div className="flex items-center justify-between p-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-600">
                                    <Mail className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-slate-800 dark:text-white">Email Notifications</h3>
                                    <p className="text-slate-500 dark:text-slate-400">Receive important updates via email.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="emailNotifications"
                                    checked={formData.emailNotifications}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        {/* Push Notifications */}
                        <div className="flex items-center justify-between p-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-600">
                                    <Smartphone className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-slate-800 dark:text-white">Push Notifications</h3>
                                    <p className="text-slate-500 dark:text-slate-400">Receive real-time alerts on your device.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="pushNotifications"
                                    checked={formData.pushNotifications}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        <div className="pt-8 border-t border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Alert Preferences</h3>
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="newPartnerAlert"
                                        checked={formData.newPartnerAlert}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-800"
                                    />
                                    <span className="text-base text-slate-700 dark:text-slate-200">New Partner Applications</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="newReportAlert"
                                        checked={formData.newReportAlert}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-800"
                                    />
                                    <span className="text-base text-slate-700 dark:text-slate-200">New Reports Submitted</span>
                                </label>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 dark:border-slate-700">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Digest Frequency</label>
                            <div className="relative">
                                <select
                                    name="digestFrequency"
                                    value={formData.digestFrequency}
                                    onChange={handleChange}
                                    className="w-full appearance-none rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                                >
                                    <option value="daily">Daily Summary</option>
                                    <option value="weekly">Weekly Summary</option>
                                    <option value="never">Never</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Choose how often you want to receive summary emails.</p>
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
