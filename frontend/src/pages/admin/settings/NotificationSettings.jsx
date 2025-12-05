import React, { useState } from 'react';
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            alert('Notification settings saved successfully!');
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/super-admin/settings" className="flex items-center gap-2 p-2 px-3 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                    <span className="font-medium">Back</span>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Notification Settings</h1>
                    <p className="text-slate-500 text-sm">Configure how and when you receive alerts.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-slate-600" />
                                <div>
                                    <h3 className="font-medium text-slate-700">Email Notifications</h3>
                                    <p className="text-sm text-slate-500">Receive important updates via email.</p>
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
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50">
                            <div className="flex items-center gap-3">
                                <Smartphone className="h-5 w-5 text-slate-600" />
                                <div>
                                    <h3 className="font-medium text-slate-700">Push Notifications</h3>
                                    <p className="text-sm text-slate-500">Receive real-time alerts on your device.</p>
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
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <h3 className="font-medium text-slate-800 mb-4">Alert Preferences</h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="newPartnerAlert"
                                        checked={formData.newPartnerAlert}
                                        onChange={handleChange}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-slate-700">New Partner Applications</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="newReportAlert"
                                        checked={formData.newReportAlert}
                                        onChange={handleChange}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-slate-700">New Reports Submitted</span>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email Digest Frequency</label>
                            <select
                                name="digestFrequency"
                                value={formData.digestFrequency}
                                onChange={handleChange}
                                className="w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="daily">Daily Summary</option>
                                <option value="weekly">Weekly Summary</option>
                                <option value="never">Never</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
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
