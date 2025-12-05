import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, ThumbsUp, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from '../../components/Pagination';

export default function NewsIndex() {
    const [news, setNews] = useState([]);
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
            fetchNews(page);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [slug, user, searchQuery, page]);

    const fetchNews = async (pageNumber = 1) => {
        try {
            const params = {};
            if (slug) {
                params.partner_slug = slug;
            } else if (user?.partner_id) {
                // If no slug but user has partner, maybe filter by it? 
                // But usually /news is global unless scoped by backend.
                // The backend PartnerScope handles user->partner_id automatically.
                // So we don't strictly need to send partner_id unless we want to be explicit.
            }
            if (searchQuery) params.search = searchQuery;
            params.page = pageNumber;

            const { data } = await api.get('/news', { params });
            setNews(data.data);
            setMeta(data);
        } catch (error) {
            console.error("Failed to fetch news", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this news?")) return;
        try {
            await api.delete(`/news/${id}`);
            setNews(news.filter(n => n.id !== id));
        } catch (error) {
            console.error("Failed to delete news", error);
        }
    };

    const handleLike = async (id) => {
        try {
            const { data } = await api.post(`/news/${id}/like`);
            setNews(news.map(n => n.id === id ? { ...n, likes_count: data.likes_count, is_liked_by_auth_user: data.liked } : n));
        } catch (error) {
            console.error("Failed to like news", error);
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

    if (loading) return <div>Loading news...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg p-6 transition-colors duration-300"
        >
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">News</h1>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <motion.div
                        className="relative flex-1 md:flex-none"
                        initial={{ width: 200 }}
                        whileFocus={{ width: 300 }}
                        transition={{ duration: 0.3 }}
                    >
                        <input
                            type="text"
                            placeholder="Search news..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 transition-all shadow-sm"
                        />
                        <div className="absolute left-3 top-2.5 text-gray-400">
                            <Search className="h-5 w-5" />
                        </div>
                    </motion.div>
                    {['super_admin', 'partner_admin'].includes(user?.role) && (
                        <Link to="/news/create" className="btn-primary flex items-center gap-2 whitespace-nowrap">
                            <Plus className="h-4 w-4" />
                            Post News
                        </Link>
                    )}
                </div>
            </div>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={page}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                >
                    {news.length > 0 ? (
                        news.map((newsItem) => (
                            <div
                                key={newsItem.id}
                                className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all relative flex flex-col md:flex-row bg-white dark:bg-slate-800"
                            >
                                {newsItem.image && (
                                    <div className="md:w-1/3 h-48 md:h-auto">
                                        <img
                                            src={newsItem.image.startsWith('http') ? newsItem.image : `http://localhost:8000/storage/${newsItem.image}`}
                                            alt={newsItem.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{newsItem.title}</h2>
                                            {['super_admin', 'partner_admin'].includes(user?.role) && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDelete(newsItem.id);
                                                    }}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-gray-600 dark:text-slate-300 text-sm mb-4 line-clamp-3">{newsItem.content}</p>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-slate-700">
                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
                                            <span>{new Date(newsItem.created_at).toLocaleDateString()}</span>
                                            <span>By {newsItem.user?.name || 'Unknown'}</span>
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleLike(newsItem.id)}
                                            className={`flex items-center gap-1 text-sm ${newsItem.is_liked_by_auth_user ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
                                        >
                                            <motion.div
                                                initial={false}
                                                animate={newsItem.is_liked_by_auth_user ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <ThumbsUp className={`h-4 w-4 ${newsItem.is_liked_by_auth_user ? 'fill-current' : ''}`} />
                                            </motion.div>
                                            {newsItem.likes_count || 0} Likes
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 dark:text-slate-400 py-8">No news found.</div>
                    )}
                </motion.div>
            </AnimatePresence>

            <Pagination links={meta.links} onPageChange={setPage} />
        </motion.div>
    );
}
