import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Save, ArrowLeft, Shield, Key, Clock, Lock, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SecuritySettings() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        minPasswordLength: 8,
        sessionTimeout: 60,
        twoFactorAuth: false,
        requireSpecialChar: true
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings?group=security');
            const data = response.data;
            if (data && Object.keys(data).length > 0) {
                setFormData({
                    minPasswordLength: parseInt(data.minPasswordLength) || 8,
                    sessionTimeout: parseInt(data.sessionTimeout) || 60,
                    twoFactorAuth: data.twoFactorAuth === '1' || data.twoFactorAuth === true,
                    requireSpecialChar: data.requireSpecialChar === '1' || data.requireSpecialChar === true
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
            await api.post('/settings', { ...formData, group: 'security' });
            alert('Security settings saved successfully!');
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert('Failed to save security settings.');
        } finally {
            setIsLoading(false);
        }
    };

    const updateNumber = (name, delta, min, max) => {
        setFormData(prev => {
            const newValue = Math.min(Math.max(prev[name] + delta, min), max);
            return { ...prev, [name]: newValue };
        });
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
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Security Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage password policies and session security.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Key className="h-4 w-4 text-slate-400" />
                                Minimum Password Length
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => updateNumber('minPasswordLength', -1, 6, 32)}
                                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 transition-colors"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <div className="flex-1 relative">
                                    <input
                                        type="number"
                                        name="minPasswordLength"
                                        value={formData.minPasswordLength}
                                        readOnly
                                        className="w-full text-center rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-4 py-3 text-slate-900 dark:text-white font-medium focus:ring-0 focus:border-slate-200 dark:focus:border-slate-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => updateNumber('minPasswordLength', 1, 6, 32)}
                                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-400" />
                                Session Timeout (minutes)
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => updateNumber('sessionTimeout', -5, 5, 1440)}
                                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 transition-colors"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <div className="flex-1 relative">
                                    <input
                                        type="number"
                                        name="sessionTimeout"
                                        value={formData.sessionTimeout}
                                        readOnly
                                        className="w-full text-center rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-4 py-3 text-slate-900 dark:text-white font-medium focus:ring-0 focus:border-slate-200 dark:focus:border-slate-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => updateNumber('sessionTimeout', 5, 5, 1440)}
                                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-full">
                                        <Lock className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-slate-800 dark:text-white">Two-Factor Authentication</h3>
                                        <p className="text-slate-500 dark:text-slate-400">Require 2FA for all admin accounts.</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="twoFactorAuth"
                                        checked={formData.twoFactorAuth}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-full">
                                        <Shield className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-slate-800 dark:text-white">Require Special Characters</h3>
                                        <p className="text-slate-500 dark:text-slate-400">Passwords must contain at least one special character.</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="requireSpecialChar"
                                        checked={formData.requireSpecialChar}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
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
