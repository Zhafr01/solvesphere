import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, news }) {
    const canEdit = auth.user.role === 'super_admin' || (auth.user.role === 'partner_admin' && auth.user.partner_id === news.partner_id);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">{news.title}</h2>}
        >
            <Head title={news.title} />

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{news.title}</h1>
                        {canEdit && (
                            <div className="flex space-x-2">
                                <Link href={route('news.edit', news.id)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    Edit
                                </Link>
                                <Link href={route('news.destroy', news.id)} method="delete" as="button" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                    Delete
                                </Link>
                            </div>
                        )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Published on {new Date(news.created_at).toLocaleDateString()}
                    </div>
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: news.content }}></div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
