import React, { useState } from 'react';
import { Save, ArrowLeft, Shield, Key, Clock, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SecuritySettings() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        minPasswordLength: 8,
        sessionTimeout: 60,
        twoFactorAuth: false,
        requireSpecialChar: true
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
            alert('Security settings saved successfully!');
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
                    <h1 className="text-2xl font-bold text-slate-800">Security Settings</h1>
                    <p className="text-slate-500 text-sm">Manage password policies and session security.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Key className="h-4 w-4 text-slate-400" />
                                Minimum Password Length
                            </label>
                            <input
                                type="number"
                                name="minPasswordLength"
                                value={formData.minPasswordLength}
                                onChange={handleChange}
                                min="6"
                                max="32"
                                className="w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-400" />
                                Session Timeout (minutes)
                            </label>
                            <input
                                type="number"
                                name="sessionTimeout"
                                value={formData.sessionTimeout}
                                onChange={handleChange}
                                min="5"
                                max="1440"
                                className="w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-slate-700">Two-Factor Authentication</h3>
                                    <p className="text-sm text-slate-500">Require 2FA for all admin accounts.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="twoFactorAuth"
                                        checked={formData.twoFactorAuth}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-slate-700">Require Special Characters</h3>
                                    <p className="text-sm text-slate-500">Passwords must contain at least one special character.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="requireSpecialChar"
                                        checked={formData.requireSpecialChar}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
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
