import React from 'react';
import { Link } from 'react-router-dom';
import { Settings as SettingsIcon, Shield, Bell, Globe, Database } from 'lucide-react';

export default function Settings() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">System Settings</h1>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        <SettingsIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        General Configuration
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage global application settings.</p>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
                            <div className="flex items-center gap-3 mb-2">
                                <Globe className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                <h3 className="font-medium text-slate-700 dark:text-slate-200">Site Information</h3>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Configure site name, description, and contact details.</p>
                            <Link to="/super-admin/settings/site" className="inline-block mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">Edit Details</Link>
                        </div>

                        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
                            <div className="flex items-center gap-3 mb-2">
                                <Shield className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                <h3 className="font-medium text-slate-700 dark:text-slate-200">Security</h3>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Manage password policies and session timeouts.</p>
                            <Link to="/super-admin/settings/security" className="inline-block mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">Configure</Link>
                        </div>

                        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
                            <div className="flex items-center gap-3 mb-2">
                                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                <h3 className="font-medium text-slate-700 dark:text-slate-200">Notifications</h3>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Setup email templates and notification triggers.</p>
                            <Link to="/super-admin/settings/notifications" className="inline-block mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">Manage</Link>
                        </div>

                        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
                            <div className="flex items-center gap-3 mb-2">
                                <Database className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                <h3 className="font-medium text-slate-700 dark:text-slate-200">System Maintenance</h3>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">View logs, clear cache, and system health.</p>
                            <Link to="/super-admin/settings/maintenance" className="inline-block mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">View Status</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
