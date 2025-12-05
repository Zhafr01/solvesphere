import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '../../components/ui/CustomSelect';
import Pagination from '../../components/Pagination';

export default function ReportsIndex() {
    const [reports, setReports] = useState([]);
    const [meta, setMeta] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [urgencyFilter, setUrgencyFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const { user } = useAuth();
    const { slug } = useParams();

    useEffect(() => {
        setPage(1);
    }, [searchQuery, statusFilter, urgencyFilter, categoryFilter]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchReports(page);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [slug, user, searchQuery, statusFilter, urgencyFilter, categoryFilter, page]);

    const fetchReports = async (pageNumber = 1) => {
        try {
            const params = {};
            if (slug) {
                params.partner_slug = slug;
            } else if (user?.partner_id) {
                params.partner_id = user.partner_id;
            }
            if (searchQuery) params.search = searchQuery;
            if (statusFilter) params.status = statusFilter;
            if (urgencyFilter) params.urgency = urgencyFilter;
            if (categoryFilter) params.category = categoryFilter;
            params.page = pageNumber;

            const { data } = await api.get('/reports', { params });
            console.log('Reports data:', data.data);
            setReports(data.data);
            setMeta(data);
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
        }
    };

    // ... (rest of the file)



    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.put(`/reports/${id}`, { status: newStatus });
            setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r));
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this report?")) return;
        try {
            await api.delete(`/reports/${id}`);
            setReports(reports.filter(r => r.id !== id));
        } catch (error) {
            console.error("Failed to delete report", error);
        }
    };


    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) return <div>Loading reports...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg p-6 transition-colors duration-300"
        >
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reports</h1>
                <div className="flex flex-wrap items-center gap-4">
                    <motion.div
                        className="relative"
                        initial={{ width: 200 }}
                        whileFocus={{ width: 300 }}
                        transition={{ duration: 0.3 }}
                    >
                        <input
                            type="text"
                            placeholder="Search reports..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 transition-all shadow-sm"
                        />
                        <div className="absolute left-3 top-2.5 text-gray-400">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                        </div>
                    </motion.div>

                    {/* Filters */}
                    {/* Filters */}
                    <div className="flex flex-wrap gap-4">
                        <div className="w-40">
                            <CustomSelect
                                value={statusFilter}
                                onChange={setStatusFilter}
                                options={[
                                    { value: "", label: "All Status" },
                                    { value: "pending", label: "Pending" },
                                    { value: "in_progress", label: "In Progress" },
                                    { value: "resolved", label: "Resolved" },
                                ]}
                                placeholder="Status"
                            />
                        </div>

                        <div className="w-40">
                            <CustomSelect
                                value={urgencyFilter}
                                onChange={setUrgencyFilter}
                                options={[
                                    { value: "", label: "All Urgency" },
                                    { value: "Low", label: "Low" },
                                    { value: "Medium", label: "Medium" },
                                    { value: "High", label: "High" },
                                    { value: "Critical", label: "Critical" },
                                ]}
                                placeholder="Urgency"
                            />
                        </div>

                        <div className="w-44">
                            <CustomSelect
                                value={categoryFilter}
                                onChange={setCategoryFilter}
                                options={[
                                    { value: "", label: "All Categories" },
                                    { value: "General", label: "General" },
                                    { value: "Infrastructure", label: "Infrastructure" },
                                    { value: "Academic", label: "Academic" },
                                    { value: "Administrative", label: "Administrative" },
                                ]}
                                placeholder="Category"
                            />
                        </div>
                    </div>

                    {!['super_admin', 'partner_admin'].includes(user?.role) && (
                        <Link to="/reports/create" className="btn-primary flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            New Report
                        </Link>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Urgency</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <AnimatePresence mode='wait'>
                        <motion.tbody
                            key={page}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700"
                        >
                            {reports.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                                reports.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase())).map((report) => (
                                    <tr
                                        key={report.id}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{report.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{report.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${report.urgency === 'Critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                                                    report.urgency === 'High' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                                                        report.urgency === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                                            'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'}`}>
                                                {report.urgency}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {['super_admin', 'partner_admin'].includes(user?.role) ? (
                                                <select
                                                    value={report.status}
                                                    onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                                    className={`text-xs font-semibold rounded-full px-2 py-1 border-none focus:ring-0 cursor-pointer
                                                    ${report.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                                            report.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                                                                'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300'}`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="resolved">Resolved</option>
                                                </select>
                                            ) : (
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${report.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                                        report.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                                                            'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300'}`}>
                                                    {report.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-2">
                                            <Link to={`/reports/${report.id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">View</Link>
                                            {user?.id === report.user_id && (
                                                <button onClick={() => handleDelete(report.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-slate-400">No reports found.</td>
                                </tr>
                            )}
                        </motion.tbody>
                    </AnimatePresence>
                </table>
            </div>

            <Pagination links={meta.links} onPageChange={setPage} />
        </motion.div>
    );
}
