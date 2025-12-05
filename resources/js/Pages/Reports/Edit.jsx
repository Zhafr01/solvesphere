import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ auth, report }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT', // Spoof PUT for file upload support in Inertia/Laravel
        title: report.title,
        category: report.category,
        urgency: report.urgency,
        content: report.content,
        attachment: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('reports.update', report.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Report</h2>}
        >
            <Head title="Edit Report" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <form onSubmit={submit} encType="multipart/form-data">
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                />
                                {errors.title && <div className="text-red-500 text-xs italic mt-1">{errors.title}</div>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="category" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Category</label>
                                <select
                                    name="category"
                                    id="category"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                >
                                    <option value="Bug">Bug</option>
                                    <option value="Feature Request">Feature Request</option>
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Abuse Report">Abuse Report</option>
                                </select>
                                {errors.category && <div className="text-red-500 text-xs italic mt-1">{errors.category}</div>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="urgency" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Urgency</label>
                                <select
                                    name="urgency"
                                    id="urgency"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                                    value={data.urgency}
                                    onChange={(e) => setData('urgency', e.target.value)}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                                {errors.urgency && <div className="text-red-500 text-xs italic mt-1">{errors.urgency}</div>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="content" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Content</label>
                                <textarea
                                    name="content"
                                    id="content"
                                    rows="5"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                ></textarea>
                                {errors.content && <div className="text-red-500 text-xs italic mt-1">{errors.content}</div>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="attachment" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Attachment (Optional)</label>
                                <input
                                    type="file"
                                    name="attachment"
                                    id="attachment"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                                    onChange={(e) => setData('attachment', e.target.files[0])}
                                />
                                {report.attachment && (
                                    <div className="mt-2">
                                        <a href={`/storage/${report.attachment}`} target="_blank" className="text-blue-500 hover:underline text-sm">View Current Attachment</a>
                                    </div>
                                )}
                                {errors.attachment && <div className="text-red-500 text-xs italic mt-1">{errors.attachment}</div>}
                            </div>

                            <div className="flex items-center justify-between">
                                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" disabled={processing}>
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
