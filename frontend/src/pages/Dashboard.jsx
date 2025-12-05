import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Link, useParams } from 'react-router-dom';
import { FileText, MessageSquare, Newspaper, Activity, ArrowRight, AlertTriangle, Users, User, ArrowUpRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const { user } = useAuth();
    const { slug } = useParams();
    const [stats, setStats] = useState({
        total_users: 0,
        total_reports: 0,
        total_topics: 0,
        total_partners: 0,
        pending_partners: 0,
        total_news: 0
    });
    const [news, setNews] = useState([]);
    const [topics, setTopics] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const params = slug ? { partner_slug: slug } : {};

                const { data } = await api.get('/dashboard', { params });
                setStats(data.stats);
                setNews(data.news);
                setTopics(data.forumTopics);
                setReports(data.reports);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [slug, user]);

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

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Welcome Section */}
            <motion.div variants={item} className="glass-panel p-8 rounded-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{user?.name}</span>!
                    </h1>
                    <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
                        Here's what's happening in your community today. You have full access to manage reports, participate in forums, and stay updated with the latest news.
                    </p>
                </div>
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-violet-500/10 dark:bg-violet-500/20 rounded-full blur-3xl"></div>
            </motion.div>

            {/* Stats Grid */}
            <div className="flex flex-wrap justify-center gap-6">
                {user?.role === 'super_admin' ? (
                    <>
                        <Card shine className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-800/30 min-w-[300px] flex-1">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-xl">
                                    <Activity className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-blue-900/70 dark:text-slate-400">Total Partners</p>
                                    <h3 className="text-2xl font-bold text-blue-950 dark:text-white">{stats.total_partners || 0}</h3>
                                </div>
                            </div>
                        </Card>

                        <Card shine className="bg-gradient-to-br from-orange-500/20 to-red-500/20 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200/50 dark:border-orange-800/30 min-w-[300px] flex-1">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-orange-500/10 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 rounded-xl">
                                    <Activity className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-orange-900/70 dark:text-slate-400">Pending Requests</p>
                                    <h3 className="text-2xl font-bold text-orange-950 dark:text-white">{stats.pending_partners || 0}</h3>
                                </div>
                            </div>
                        </Card>

                        <Card shine className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200/50 dark:border-emerald-800/30 min-w-[300px] flex-1">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl">
                                    <User className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-emerald-900/70 dark:text-slate-400">Total Users</p>
                                    <h3 className="text-2xl font-bold text-emerald-950 dark:text-white">{stats.total_users || 0}</h3>
                                </div>
                            </div>
                        </Card>
                    </>
                ) : user?.role === 'partner_admin' ? (
                    <>
                        <Card shine className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-800/30 min-w-[300px] flex-1">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-xl">
                                    <User className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-blue-900/70 dark:text-slate-400">My Users</p>
                                    <h3 className="text-2xl font-bold text-blue-950 dark:text-white">{stats.total_users || 0}</h3>
                                </div>
                            </div>
                        </Card>

                        <Card shine className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-200/50 dark:border-violet-800/30 min-w-[300px] flex-1">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-violet-500/10 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400 rounded-xl">
                                    <MessageSquare className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-violet-900/70 dark:text-slate-400">My Topics</p>
                                    <h3 className="text-2xl font-bold text-violet-950 dark:text-white">{stats.total_topics || 0}</h3>
                                </div>
                            </div>
                        </Card>

                        <Card shine className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200/50 dark:border-emerald-800/30 min-w-[300px] flex-1">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-emerald-900/70 dark:text-slate-400">My Reports</p>
                                    <h3 className="text-2xl font-bold text-emerald-950 dark:text-white">{stats.total_reports || 0}</h3>
                                </div>
                            </div>
                        </Card>
                    </>
                ) : (
                    <>
                        <Card shine className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-800/30 min-w-[300px] flex-1">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-xl">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-blue-900/70 dark:text-slate-400">Total Reports</p>
                                    <h3 className="text-2xl font-bold text-blue-950 dark:text-white">{stats.total_reports || 0}</h3>
                                </div>
                            </div>
                        </Card>

                        <Card shine className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-200/50 dark:border-violet-800/30 min-w-[300px] flex-1">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-violet-500/10 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400 rounded-xl">
                                    <MessageSquare className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-violet-900/70 dark:text-slate-400">Forum Topics</p>
                                    <h3 className="text-2xl font-bold text-violet-950 dark:text-white">{stats.total_topics || 0}</h3>
                                </div>
                            </div>
                        </Card>

                        <Card shine className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200/50 dark:border-emerald-800/30 min-w-[300px] flex-1">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl">
                                    <Newspaper className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-emerald-900/70 dark:text-slate-400">News Articles</p>
                                    <h3 className="text-2xl font-bold text-emerald-950 dark:text-white">{stats.total_news || 0}</h3>
                                </div>
                            </div>
                        </Card>
                    </>
                )}
            </div>

            {/* Partner Rating Section */}
            {slug && user?.role === 'general_user' && (
                <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Rate this Partner</h3>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => {
                                    api.post(`/partners/${slug}/rate`, { rating: star })
                                        .then(() => alert('Rating submitted!'))
                                        .catch(e => console.error(e));
                                }}
                                className="text-yellow-400 hover:scale-110 transition-transform"
                            >
                                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
            )}


            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* News Widget */}
                <Card className="h-full">
                    <CardHeader className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Newspaper className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            <CardTitle className="text-slate-900 dark:text-white">Latest News</CardTitle>
                        </div>
                        <Link to="/news" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1">
                            View All <ArrowRight className="h-4 w-4" />
                        </Link>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {news.length > 0 ? (
                            news.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                                >
                                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.content}</p>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{item.author?.name || 'Admin'}</span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                                <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No news available at the moment.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Forum Widget */}
                <Card className="h-full">
                    <CardHeader className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                            <CardTitle className="text-slate-900 dark:text-white">Recent Discussions</CardTitle>
                        </div>
                        <Link to="/forum" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1">
                            View All <ArrowRight className="h-4 w-4" />
                        </Link>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {topics.length > 0 ? (
                            topics.map((topic, index) => (
                                <motion.div
                                    key={topic.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                                >
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1">{topic.title}</h3>
                                        <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                                            {topic.category || 'General'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{topic.content}</p>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-300">
                                                {topic.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <span>{topic.user?.name || 'User'}</span>
                                        </div>
                                        <span>•</span>
                                        <span>{new Date(topic.created_at).toLocaleDateString()}</span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No discussions yet. Start one!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </motion.div >
    );
}
