import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from '../../components/Pagination';

export default function ForumIndex() {
    const [topics, setTopics] = useState([]);
    const [meta, setMeta] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const { user } = useAuth();
    const { slug } = useParams();

    useEffect(() => {
        setPage(1);
    }, [searchQuery]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchTopics(page);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [slug, user, searchQuery, page]);

    const fetchTopics = async (pageNumber = 1) => {
        try {
            const params = {};
            if (slug) {
                params.partner_slug = slug;
            } else if (user?.partner_id) {
                params.partner_id = user.partner_id;
            }
            if (searchQuery) params.search = searchQuery;
            params.page = pageNumber;

            const { data } = await api.get('/forum-topics', { params });
            setTopics(data.data);
            setMeta(data);
        } catch (error) {
            console.error("Failed to fetch topics", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this topic?')) return;
        try {
            await api.delete(`/forum-topics/${id}`);
            fetchTopics();
        } catch (error) {
            console.error("Failed to delete topic", error);
            alert("Failed to delete topic");
        }
    };

    if (loading) return <div>Loading forum topics...</div>;

    return (
        <div className="bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg p-6 transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Forum</h1>
                <div className="flex items-center gap-4">
                    <motion.div
                        className="relative"
                        initial={{ width: 200 }}
                        whileFocus={{ width: 300 }}
                        transition={{ duration: 0.3 }}
                    >
                        <input
                            type="text"
                            placeholder="Search topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 transition-all shadow-sm"
                        />
                        <div className="absolute left-3 top-2.5 text-gray-400">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                        </div>
                    </motion.div>
                    <Link to="/forum/create" className="btn-primary flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        New Topic
                    </Link>
                </div>
            </div>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={page}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                >
                    {topics.length > 0 ? (
                        topics.map((topic) => (
                            <div
                                key={topic.id}
                                className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Link to={`/forum/${topic.id}`} className="text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                            {topic.title}
                                        </Link>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                                            Posted by {topic.user?.name || 'Unknown'} on {new Date(topic.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                            {topic.category}
                                        </span>
                                        {(user?.roles?.some(r => r.name === 'partner_admin' || r.name === 'super_admin') || user?.id === topic.user_id) && (
                                            <button
                                                onClick={() => handleDelete(topic.id)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                                    {topic.comments_count} replies
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 dark:text-slate-400">
                            No topics found.
                        </p>
                    )}
                </motion.div>
            </AnimatePresence>

            <Pagination links={meta.links} onPageChange={setPage} />
        </div>
    );
}
