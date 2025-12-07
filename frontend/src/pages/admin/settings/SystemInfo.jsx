import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Server, Cpu, Database, Network, Users, Building } from 'lucide-react';

export default function SystemInfo() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchSystemInfo = async () => {
            try {
                const response = await api.get('/settings/system-info');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch system info", error);
            }
        };

        fetchSystemInfo();
        const interval = setInterval(fetchSystemInfo, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">System Monitoring</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time server performance indicators.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Server className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Web Server</h3>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">{stats?.server || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                            <Database className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Database</h3>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">{stats?.db_connection || 'Checking...'}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                            <Cpu className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">PHP Version</h3>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">{stats?.php_version || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
                            <Network className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">OS</h3>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">{stats?.os || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-900/50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Users</h3>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">{stats?.user_count || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-pink-50 dark:bg-pink-900/10 rounded-2xl border border-pink-100 dark:border-pink-900/50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl text-pink-600 dark:text-pink-400">
                            <Building className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Partners</h3>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">{stats?.partner_count || 0}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
