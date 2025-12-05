import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, partner, news, topics }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">{partner.name}</h2>}
        >
            <Head title={partner.name} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Partner Header */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-8">
                        <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center">
                            {partner.logo ? (
                                <img src={partner.logo.startsWith('http') ? partner.logo : `/storage/${partner.logo.replace('public/', '')}`} alt={partner.name} className="h-20 w-20 rounded-full object-cover mr-6" />
                            ) : (
                                <div className="h-20 w-20 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-2xl mr-6">
                                    {partner.name.substring(0, 2)}
                                </div>
                            )}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{partner.name}</h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">{partner.description || 'Welcome to our community!'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Partner News */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Latest News</h3>
                                <ul className="space-y-4">
                                    {news.length > 0 ? (
                                        news.map((item) => (
                                            <li key={item.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-2 last:pb-0">
                                                <Link href={route('news.show', item.id)} className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium block">
                                                    {item.title}
                                                </Link>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-gray-500 dark:text-gray-400">No news yet.</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Partner Forum */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Community Discussions</h3>
                                <ul className="space-y-4">
                                    {topics.length > 0 ? (
                                        topics.map((topic) => (
                                            <li key={topic.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-2 last:pb-0">
                                                <Link href={route('forum-topics.show', topic.id)} className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium block">
                                                    {topic.title}
                                                </Link>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">by {topic.user.name}</span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(topic.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-gray-500 dark:text-gray-400">No discussions yet.</li>
                                    )}
                                </ul>
                                <div className="mt-4 text-right">
                                    <Link
                                        href={route('forum-topics.index', { partner_id: partner.id })}
                                        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        View All &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
