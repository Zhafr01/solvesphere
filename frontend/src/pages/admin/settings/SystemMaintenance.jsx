import React, { useState } from 'react';
import api from '../../../lib/api';
import { ArrowLeft, Database, RefreshCw, Download, CheckCircle, AlertCircle, Server } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SystemMaintenance() {
    const [isClearingCache, setIsClearingCache] = useState(false);
    const [isDownloadingLogs, setIsDownloadingLogs] = useState(false);
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);

    React.useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoadingSettings(true);
        try {
            const response = await api.get('/settings?group=system');
            if (response.data && response.data.maintenance_mode) {
                setIsMaintenanceMode(response.data.maintenance_mode === '1' || response.data.maintenance_mode === true);
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        } finally {
            setIsLoadingSettings(false);
        }
    };

    const handleClearCache = async () => {
        if (window.confirm('Are you sure you want to clear the system cache? This might temporarily affect performance.')) {
            setIsClearingCache(true);
            try {
                const response = await api.post('/settings/clear-cache');
                alert(response.data.message || 'System cache cleared successfully!');
            } catch (error) {
                console.error("Failed to clear cache:", error);
                alert('Failed to clear system cache. Please check console for details.');
            } finally {
                setIsClearingCache(false);
            }
        }
    };

    const handleDownloadLogs = async () => {
        setIsDownloadingLogs(true);
        try {
            const response = await api.get('/settings/download-logs', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'laravel.log');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Failed to download logs:", error);
            alert('Failed to download system logs.');
        } finally {
            setIsDownloadingLogs(false);
        }
    };

    const handleMaintenanceToggle = async () => {
        const newValue = !isMaintenanceMode;
        if (window.confirm(`Are you sure you want to ${newValue ? 'enable' : 'disable'} maintenance mode? ${newValue ? 'Only Super Admins will be able to log in.' : ''}`)) {
            try {
                await api.post('/settings', { maintenance_mode: newValue, group: 'system' });
                setIsMaintenanceMode(newValue);
                alert(`Maintenance mode ${newValue ? 'enabled' : 'disabled'} successfully.`);
            } catch (error) {
                console.error("Failed to toggle maintenance mode:", error);
                alert('Failed to update maintenance mode settings.');
            }
        }
    };

    if (isLoadingSettings) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-slate-500 dark:text-slate-400">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">System Maintenance</h1>
                <Link to="/super-admin/settings" className="flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Settings
                </Link>
            </div>

            {/* Maintenance Mode Toggle Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg ${isMaintenanceMode ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Maintenance Mode</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                                When enabled, only Super Admin users can access the system. All other users will be blocked from logging in or performing actions.
                            </p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isMaintenanceMode}
                            onChange={handleMaintenanceToggle}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                            <Server className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">System Status</h3>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                        <CheckCircle className="h-4 w-4" />
                        Operational
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Uptime: 99.9%</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                            <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">Database</h3>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                        <CheckCircle className="h-4 w-4" />
                        Connected
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Size: 45.2 MB</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                            <RefreshCw className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">Last Backup</h3>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        2 hours ago
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Next backup: 22:00</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Maintenance Actions</h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/40 rounded-full">
                                <RefreshCw className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-slate-800 dark:text-white">Clear System Cache</h3>
                                <p className="text-slate-500 dark:text-slate-400">Remove temporary files and cached data.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClearCache}
                            disabled={isClearingCache}
                            className="px-6 py-2.5 font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-xl transition-all disabled:opacity-50"
                        >
                            {isClearingCache ? 'Clearing...' : 'Clear Cache'}
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full">
                                <Download className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-slate-800 dark:text-white">Download System Logs</h3>
                                <p className="text-slate-500 dark:text-slate-400">Export system activity logs for analysis.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDownloadLogs}
                            disabled={isDownloadingLogs}
                            className="px-6 py-2.5 font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-all disabled:opacity-50"
                        >
                            {isDownloadingLogs ? 'Downloading...' : 'Download Logs'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
