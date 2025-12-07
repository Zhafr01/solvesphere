import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Search, Filter, MoreVertical, Shield, ShieldOff, Ban, CheckCircle, ArrowUpCircle } from 'lucide-react'; // Added ArrowUpCircle for promote
import Pagination from '../../components/Pagination';

export default function UsersIndex() {
    const { user: currentUser } = useAuth(); // Rename to avoid conflict with map variable
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [meta, setMeta] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUsers(1); // Reset to page 1 on search/filter change
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, roleFilter]);

    // Separate effect for page changes to avoid double fetching with debounce
    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    const fetchUsers = async (page = 1) => {
        setLoading(true);
        try {
            const endpoint = currentUser.role === 'super_admin' ? '/super-admin/users' : '/partner-admin/users';
            const { data } = await api.get(endpoint, {
                params: {
                    page,
                    search: searchTerm,
                    role: roleFilter !== 'all' ? roleFilter : undefined
                }
            });
            setUsers(data.data);
            setMeta(data); // Pagination meta is in the root of the response for Laravel paginate()
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;
        try {
            const prefix = currentUser.role === 'super_admin' ? '/super-admin' : '/partner-admin';
            await api.post(`${prefix}/users/${id}/${action}`);
            fetchUsers(currentPage); // Refresh current page
        } catch (error) {
            console.error(`Failed to ${action} user`, error);
            alert(`Failed to ${action} user`);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    if (loading && users.length === 0) return <div className="flex justify-center items-center h-64">Loading users...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="pl-3 pr-8 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">All Roles</option>
                        <option value="general_user">General User</option>
                        <option value="partner_admin">Partner Admin</option>
                        <option value="super_admin">Super Admin</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Partner</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedUser(user)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                                                    {user.profile_picture ? (
                                                        <img src={user.profile_picture} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                                                    ) : (
                                                        user.name.charAt(0)
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</div>
                                                    <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 capitalize">
                                                {user.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                            {user.partner ? user.partner.name : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${user.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    user.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                {user.status !== 'active' && (
                                                    <button
                                                        onClick={() => handleAction(user.id, 'activate')}
                                                        className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 p-1 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                                                        title="Activate"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {/* Promotion Logic */}
                                                {user.status === 'active' && (
                                                    (currentUser?.role === 'super_admin' && user.role !== 'super_admin') ||
                                                    (currentUser?.role === 'partner_admin' && user.role === 'general_user')
                                                ) && (
                                                        <button
                                                            onClick={() => handleAction(user.id, 'promote')}
                                                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 p-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"
                                                            title="Promote"
                                                        >
                                                            <ArrowUpCircle className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                {user.status !== 'suspended' && (
                                                    <button
                                                        onClick={() => handleAction(user.id, 'suspend')}
                                                        className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300 p-1 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded"
                                                        title="Suspend"
                                                    >
                                                        <ShieldOff className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {user.status !== 'banned' && (
                                                    <button
                                                        onClick={() => handleAction(user.id, 'ban')}
                                                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                                        title="Ban"
                                                    >
                                                        <Ban className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <Pagination
                        currentPage={currentPage}
                        lastPage={meta.last_page}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300" onClick={() => setSelectedUser(null)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transition-all transform border border-slate-200 dark:border-slate-700/50" onClick={e => e.stopPropagation()}>
                        <div className="relative">
                            {/* Decorative background header */}
                            <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="px-6 pb-6">
                                <div className="flex flex-col items-center -mt-12 mb-6">
                                    <div className="h-24 w-24 rounded-full bg-white dark:bg-slate-800 p-1 shadow-lg mb-3">
                                        <div className="h-full w-full rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-3xl overflow-hidden">
                                            {selectedUser.profile_picture ? (
                                                <img src={selectedUser.profile_picture} alt={selectedUser.name} className="h-full w-full object-cover" />
                                            ) : (
                                                selectedUser.name.charAt(0)
                                            )}
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{selectedUser.name}</h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">{selectedUser.email}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-2">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Role</label>
                                        <div className="flex">
                                            <span className="px-3 py-1 inline-flex text-sm font-medium rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 capitalize border border-indigo-100 dark:border-indigo-800">
                                                {selectedUser.role.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</label>
                                        <div className="flex">
                                            <span className={`px-3 py-1 inline-flex text-sm font-medium rounded-full border capitalize
                                                ${selectedUser.status === 'active'
                                                    ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                                    : selectedUser.status === 'suspended'
                                                        ? 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
                                                        : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                                                }`}>
                                                {selectedUser.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Partner Organization</label>
                                        <p className="text-base text-slate-900 dark:text-white font-medium truncate">
                                            {selectedUser.partner ? selectedUser.partner.name : <span className="text-slate-400 italic">None</span>}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Joined On</label>
                                        <p className="text-base text-slate-900 dark:text-white font-medium">
                                            {new Date(selectedUser.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-700/30 px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
                            {selectedUser.status === 'active' && (
                                (currentUser?.role === 'super_admin' && selectedUser.role !== 'super_admin') ||
                                (currentUser?.role === 'partner_admin' && selectedUser.role === 'general_user')
                            ) ? (
                                <button
                                    type="button"
                                    className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    onClick={() => {
                                        if (confirm('Are you sure you want to promote this user?')) {
                                            handleAction(selectedUser.id, 'promote');
                                            setSelectedUser(null);
                                        }
                                    }}
                                >
                                    <ArrowUpCircle className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                                    <span>Promote to {currentUser?.role === 'super_admin' ? 'Super Admin' : 'Partner Admin'}</span>
                                </button>
                            ) : <div></div>}

                            <button
                                type="button"
                                className="px-5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                                onClick={() => setSelectedUser(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
