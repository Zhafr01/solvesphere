import React, { useState } from 'react';
import { ArrowLeft, Database, RefreshCw, Download, CheckCircle, AlertCircle, Server } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SystemMaintenance() {
    const [isClearingCache, setIsClearingCache] = useState(false);
    const [isDownloadingLogs, setIsDownloadingLogs] = useState(false);

    const handleClearCache = () => {
        if (window.confirm('Are you sure you want to clear the system cache? This might temporarily affect performance.')) {
            setIsClearingCache(true);
            setTimeout(() => {
                setIsClearingCache(false);
                alert('System cache cleared successfully!');
            }, 2000);
        }
    };

    const handleDownloadLogs = () => {
        setIsDownloadingLogs(true);
        setTimeout(() => {
            setIsDownloadingLogs(false);
            alert('Logs downloaded successfully!');
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/super-admin/settings" className="flex items-center gap-2 p-2 px-3 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                    <span className="font-medium">Back</span>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">System Maintenance</h1>
                    <p className="text-slate-500 text-sm">Monitor system health and perform maintenance tasks.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Server className="h-5 w-5 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-slate-800">System Status</h3>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                        <CheckCircle className="h-4 w-4" />
                        Operational
                    </div>
                    <p className="text-sm text-slate-500 mt-2">Uptime: 99.9%</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Database className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-slate-800">Database</h3>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 font-medium">
                        <CheckCircle className="h-4 w-4" />
                        Connected
                    </div>
                    <p className="text-sm text-slate-500 mt-2">Size: 45.2 MB</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <RefreshCw className="h-5 w-5 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-slate-800">Last Backup</h3>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                        2 hours ago
                    </div>
                    <p className="text-sm text-slate-500 mt-2">Next backup: 22:00</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">Maintenance Actions</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-full">
                                <RefreshCw className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-slate-800">Clear System Cache</h3>
                                <p className="text-sm text-slate-500">Remove temporary files and cached data.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClearCache}
                            disabled={isClearingCache}
                            className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isClearingCache ? 'Clearing...' : 'Clear Cache'}
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-100 rounded-full">
                                <Download className="h-5 w-5 text-slate-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-slate-800">Download System Logs</h3>
                                <p className="text-sm text-slate-500">Export system activity logs for analysis.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDownloadLogs}
                            disabled={isDownloadingLogs}
                            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isDownloadingLogs ? 'Downloading...' : 'Download Logs'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
