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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">System Monitoring</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time server performance & error logs.</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live Refresh (30s)
                </div>
            </div>

            {/* ERROR LOG TERMINAL */}
            <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-800">
                <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="ml-2 text-xs text-slate-400 font-mono">storage/logs/laravel.log (Tail -50)</span>
                    </div>
                </div>
                <div className="p-4 font-mono text-xs text-slate-300 h-64 overflow-y-auto custom-scrollbar bg-slate-950">
                    {stats?.logs && stats.logs.length > 0 ? (
                        stats.logs.map((line, index) => (
                            <div key={index} className="whitespace-pre-wrap hover:bg-white/5 px-1 py-0.5 rounded">
                                <span className="text-slate-500 mr-2">{index + 1}</span>
                                {line}
                            </div>
                        ))
                    ) : (
                        <div className="text-slate-500 italic p-4 text-center">No logs found or log file is empty.</div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* SERVER INFO */}
                <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Server className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Web Server</h3>
                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[150px]" title={stats?.server}>{stats?.server || 'Loading...'}</p>
                            <span className="text-xs text-slate-400">PHP {stats?.php_version}</span>
                        </div>
                    </div>
                </div>

                {/* DATABASE INFO */}
                <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                            <Database className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Database</h3>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">{stats?.db_size || '0 MB'}</p>
                            <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                                ● Connected: {stats?.db_connection}
                            </span>
                        </div>
                    </div>
                </div>

                {/* MEMORY USAGE */}
                <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                            <Cpu className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Memory Usage</h3>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">{stats?.memory_usage || '0 MB'}</p>
                            <span className="text-xs text-slate-400">Script execution mem</span>
                        </div>
                    </div>
                </div>

                {/* DISK USAGE */}
                <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
                            <Database className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Disk Free</h3>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">{stats?.disk_free_space || '0 GB'}</p>
                            <span className="text-xs text-slate-400">Total: {stats?.disk_total_space}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* OS INFO */}
                <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300">
                        <Network className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">System OS</h3>
                        <p className="font-bold text-slate-800 dark:text-white">{stats?.os || 'Unknown'}</p>
                    </div>
                </div>

                {/* USER COUNT */}
                <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Users</h3>
                        <p className="font-bold text-slate-800 dark:text-white text-xl">{stats?.user_count || 0}</p>
                    </div>
                </div>

                {/* PARTNER COUNT */}
                <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl text-pink-600 dark:text-pink-400">
                        <Building className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Partners</h3>
                        <p className="font-bold text-slate-800 dark:text-white text-xl">{stats?.partner_count || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
