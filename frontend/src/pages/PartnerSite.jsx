import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';

export default function PartnerSite() {
    const { slug } = useParams();
    const [partner, setPartner] = useState(null);
    const [news, setNews] = useState([]);
    const [topics, setTopics] = useState([]);
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPartnerData = async () => {
            try {
                const { data } = await api.get(`/partners/${slug}`);
                setPartner(data.partner);
                setNews(data.news);
                setTopics(data.topics);
                setReports(data.reports);
                setStats(data.stats);
            } catch (err) {
                console.error("Partner fetch error:", err);
                setError(err.response?.data?.message || 'Partner not found or inactive');
            } finally {
                setLoading(false);
            }
        };

        fetchPartnerData();
    }, [slug]);

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-lg mb-8">
                <div className="px-4 py-5 sm:px-6 flex items-center">
                    {partner.logo && (
                        <img src={partner.logo} alt={partner.name} className="h-16 w-16 rounded-full mr-4" />
                    )}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{partner.name}</h1>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-slate-400">{partner.description}</p>
                        {partner.website && (
                            <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 text-sm">
                                Visit Website
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Users</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_users || 0}</h3>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total News</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_news || 0}</h3>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Topics</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_topics || 0}</h3>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Reports</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_reports || 0}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* News Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Latest News</h2>
                    <div className="space-y-4">
                        {news.length > 0 ? (
                            news.map((item) => (
                                <div key={item.id} className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
                                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{item.title}</h3>
                                    <p className="text-gray-600 dark:text-slate-300 mb-2">{item.content.substring(0, 100)}...</p>
                                    <span className="text-sm text-gray-500 dark:text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-slate-400">No news available.</p>
                        )}
                    </div>
                </div>

                {/* Forum Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Forum Topics</h2>
                    <div className="space-y-4">
                        {topics.length > 0 ? (
                            topics.map((topic) => (
                                <div key={topic.id} className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
                                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{topic.title}</h3>
                                    <p className="text-gray-600 dark:text-slate-300 mb-2">{topic.content.substring(0, 100)}...</p>
                                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-slate-400">
                                        <span>By {topic.user?.name || 'Unknown'}</span>
                                        <span className={`px-2 py-1 rounded-full text-xs ${topic.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}>
                                            {topic.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-slate-400">No topics yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Reports Section */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Recent Reports</h2>
                <div className="grid grid-cols-1 gap-4">
                    {reports.length > 0 ? (
                        reports.map((report) => (
                            <div key={report.id} className="bg-white dark:bg-slate-800 shadow rounded-lg p-6 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.title}</h3>
                                    <p className="text-gray-600 dark:text-slate-300 text-sm">{report.category}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${report.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                    report.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                        'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300'
                                    }`}>
                                    {report.status}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 dark:text-slate-400">No reports found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
