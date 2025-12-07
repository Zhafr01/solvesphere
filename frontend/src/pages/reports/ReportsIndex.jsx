import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '../../components/ui/CustomSelect';
import Pagination from '../../components/Pagination';
import PageLoader from '../../components/ui/PageLoader';

export default function ReportsIndex() {
    const [reports, setReports] = useState([]);
    const [meta, setMeta] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [urgencyFilter, setUrgencyFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [expandedReportId, setExpandedReportId] = useState(null);
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

    const toggleExpand = (id) => {
        setExpandedReportId(expandedReportId === id ? null : id);
    };

    if (loading) return <PageLoader message="Loading reports..." />;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg p-6 transition-colors duration-300 max-w-7xl mx-auto"
        >
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reports</h1>
                </div>

                {/* Search Bar - Full Width */}
                <div className="w-full relative">
                    <input
                        type="text"
                        placeholder="Search reports..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 transition-all shadow-sm"
                    />
                    <div className="absolute left-3 top-3.5 text-gray-400">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                    </div>
                </div>

                {/* Filters and Action Button Row */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-wrap gap-4 w-full md:w-auto">
                        <div className="w-full md:w-40">
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

                        <div className="w-full md:w-40">
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

                        <div className="w-full md:w-44">
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

                    {(!['super_admin', 'partner_admin'].includes(user?.role) || (user?.role === 'super_admin' && slug)) && (
                        <Link to={slug ? `/partners/${slug}/reports/create` : "/reports/create"} className="btn-primary flex items-center gap-2 whitespace-nowrap">
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Partner</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Urgency</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {reports.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                            reports.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase())).map((report) => (
                                <>
                                    <tr key={report.id} className={`transition-colors ${expandedReportId === report.id ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{report.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                                            {report.partner ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                    {report.partner.name}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300">
                                                    Global
                                                </span>
                                            )}
                                        </td>
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
                                            {((user?.role === 'super_admin' && !slug) || user?.role === 'partner_admin') ? (
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    to={slug ? `/partners/${slug}/reports/${report.id}` : `/reports/${report.id}`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                                                >
                                                    View
                                                </Link>
                                                {(user?.id === report.user_id || (user?.role === 'super_admin' && !slug) || (user?.role === 'partner_admin' && user?.partner_id === report.partner_id)) && (
                                                    <button
                                                        onClick={() => handleDelete(report.id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                                        title="Delete Report"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>

                                </>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-slate-400">No reports found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination links={meta.links} onPageChange={setPage} />
        </motion.div>
    );
}
