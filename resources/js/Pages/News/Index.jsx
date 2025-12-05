import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, news, filters }) {
    const partner_id = filters?.partner_id || '';

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">News</h2>}
        >
            <Head title="News" />

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    {(auth.user.role === 'partner_admin' || auth.user.role === 'super_admin') && (
                        <Link href={route('news.create', { partner_id })} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 inline-block">
                            Create News
                        </Link>
                    )}
                    <div className="space-y-4">
                        {news.data.length > 0 ? (
                            news.data.map((item) => (
                                <div key={item.id} className="p-4 border dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                            <Link href={route('news.show', item.id)} className="text-blue-500 hover:underline">{item.title}</Link>
                                        </h3>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {item.content.replace(/<[^>]+>/g, '')}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400">No news found.</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-4">
                {/* Pagination Links - Simplified */}
                {news.links && news.links.map((link, index) => (
                    <Link
                        key={index}
                        href={link.url || '#'}
                        className={`px-4 py-2 border rounded ${link.active ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </AuthenticatedLayout>
    );
}
