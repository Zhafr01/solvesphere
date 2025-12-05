import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ auth, partner_id }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        content: '',
        partner_id: partner_id || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('news.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Create News</h2>}
        >
            <Head title="Create News" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <form onSubmit={submit}>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                />
                                {errors.title && <div className="text-red-500 text-xs italic mt-1">{errors.title}</div>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="content" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Content</label>
                                <textarea
                                    name="content"
                                    id="content"
                                    rows="10"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    required
                                ></textarea>
                                {errors.content && <div className="text-red-500 text-xs italic mt-1">{errors.content}</div>}
                            </div>

                            <div className="flex items-center justify-between">
                                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" disabled={processing}>
                                    Create News
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
