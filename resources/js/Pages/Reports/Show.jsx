import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Show({ auth, report }) {
    const { data, setData, put, processing } = useForm({
        status: report.status,
        admin_note: report.admin_note || '',
    });

    const updateStatus = (e) => {
        e.preventDefault();
        put(route('reports.update', report.id));
    };

    const isAuthor = auth.user.id === report.user_id;
    const isRecent = (new Date() - new Date(report.created_at)) / 60000 < 15;
    const isAdmin = auth.user.role === 'admin' || auth.user.role === 'super_admin' || auth.user.role === 'partner_admin'; // Assuming admin roles

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">{report.title}</h2>}
        >
            <Head title={report.title} />

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                            {report.title}
                        </h2>
                        {isAuthor && isRecent && (
                            <div className="flex space-x-2">
                                <Link href={route('reports.edit', report.id)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    Edit Report
                                </Link>
                                <Link href={route('reports.destroy', report.id)} method="delete" as="button" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                    Delete Report
                                </Link>
                            </div>
                        )}
                    </div>
                    <div className="flex items-start mt-4">
                        <div className="flex-1">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                By <span className="text-blue-500 hover:underline">{report.user?.name || 'Unknown User'}</span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(report.created_at).toLocaleDateString()}
                            </div>
                            <div className="mt-4 text-gray-800 dark:text-gray-200">
                                <p className="text-lg font-semibold">Category: {report.category}</p>
                            </div>
                            <div className="mt-4 text-gray-800 dark:text-gray-200">
                                <p>{report.content}</p>
                            </div>

                            {report.attachment && (
                                <div className="mt-4">
                                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">Attachment:</p>
                                    <a href={`/storage/${report.attachment}`} target="_blank" className="text-blue-500 hover:underline">View Attachment</a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${report.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                                report.status === 'in_progress' ? 'bg-blue-200 text-blue-800' :
                                    'bg-green-200 text-green-800'}`}>
                            {report.status.replace('_', ' ')}
                        </span>
                    </div>

                    {report.admin_note && (
                        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Admin Note:</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{report.admin_note}</p>
                        </div>
                    )}

                    {isAdmin && (
                        <form onSubmit={updateStatus} className="mt-6 border-t pt-4 dark:border-gray-700">
                            <div className="flex items-center space-x-4">
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                    <select
                                        id="status"
                                        name="status"
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="admin_note" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Admin Note</label>
                                    <textarea
                                        id="admin_note"
                                        name="admin_note"
                                        rows="1"
                                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md"
                                        value={data.admin_note}
                                        onChange={(e) => setData('admin_note', e.target.value)}
                                    ></textarea>
                                </div>
                                <div className="pt-5">
                                    <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" disabled={processing}>
                                        Update
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
