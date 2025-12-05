import React, { useState } from 'react';
import { Save, ArrowLeft, Globe, Mail, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SiteSettings() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        siteName: 'SolveSphere',
        siteDescription: 'A platform for community problem solving.',
        contactEmail: 'admin@solvesphere.com',
        maintenanceMode: false
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
            alert('Settings saved successfully!');
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
                    <h1 className="text-2xl font-bold text-slate-800">Site Information</h1>
                    <p className="text-slate-500 text-sm">Configure global site settings.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Globe className="h-4 w-4 text-slate-400" />
                                Site Name
                            </label>
                            <input
                                type="text"
                                name="siteName"
                                value={formData.siteName}
                                onChange={handleChange}
                                className="w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Enter site name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Mail className="h-4 w-4 text-slate-400" />
                                Contact Email
                            </label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                className="w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="admin@example.com"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-slate-700">Site Description</label>
                            <textarea
                                name="siteDescription"
                                value={formData.siteDescription}
                                onChange={handleChange}
                                rows="3"
                                className="w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Enter site description..."
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center justify-between p-4 rounded-lg border border-amber-200 bg-amber-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 rounded-full">
                                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-amber-900">Maintenance Mode</h3>
                                        <p className="text-sm text-amber-700">Enable this to prevent users from accessing the site.</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="maintenanceMode"
                                        checked={formData.maintenanceMode}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                                </label>
                            </div>
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
