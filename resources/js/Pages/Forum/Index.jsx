import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Index({ auth, topics, filters }) {
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        category: filters.category || '',
        status: filters.status || '',
        partner_id: filters.partner_id || '',
    });

    const handleFilterChange = (e) => {
        setData(e.target.name, e.target.value);
    };

    // Auto-submit on select change
    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
        get(route('forum-topics.index'), {
            preserveState: true,
            preserveScroll: true,
            data: { ...data, [name]: value } // Ensure updated data is sent
        });
    };

    const submit = (e) => {
        e.preventDefault();
        get(route('forum-topics.index'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Forum</h2>}
        >
            <Head title="Forum" />

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="mb-4">
                        <form onSubmit={submit}>
                            <div className="flex items-center space-x-4">
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Search topics..."
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                />
                                <select
                                    name="category"
                                    className="shadow appearance-none border rounded py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                                    value={data.category}
                                    onChange={handleSelectChange}
                                >
                                    <option value="">All Categories</option>
                                    <option value="General">General</option>
                                    <option value="Technical">Technical</option>
                                    <option value="Feedback">Feedback</option>
                                </select>
                                <select
                                    name="status"
                                    className="shadow appearance-none border rounded py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                                    value={data.status}
                                    onChange={handleSelectChange}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="unsolved">Unsolved</option>
                                    <option value="solved">Solved</option>
                                </select>
                                <button type="submit" className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Filter</button>
                            </div>
                        </form>
                    </div>
                    <Link href={route('forum-topics.create', { partner_id: data.partner_id })} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 inline-block">
                        Create Topic
                    </Link>
                    <div className="space-y-4">
                        {topics.data.length > 0 ? (
                            topics.data.map((topic) => (
                                <div key={topic.id} className="p-4 border dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800">
                                    <div className="flex items-start">
                                        <img
                                            src={topic.user?.profile_picture ? (topic.user.profile_picture.startsWith('http') || topic.user.profile_picture.startsWith('data:') ? topic.user.profile_picture : `/storage/${topic.user.profile_picture}`) : `https://i.pravatar.cc/50?u=${topic.user_id}`}
                                            alt={topic.user?.name || 'Unknown User'}
                                            className="h-10 w-10 rounded-full mr-4 object-cover"
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                    <Link href={route('forum-topics.show', topic.id)} className="text-blue-500 hover:underline">{topic.title}</Link>
                                                </h3>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(topic.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                By <span className="text-blue-500 hover:underline">{topic.user?.name || 'Unknown User'}</span>
                                                {topic.user?.role === 'admin' && (
                                                    <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-4 text-sm text-gray-500 text-center">
                                            <div>{topic.comments_count}</div>
                                            <div>replies</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400">No topics found.</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-4">
                {/* Pagination Links - Simplified */}
                {topics.links && topics.links.map((link, index) => (
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
