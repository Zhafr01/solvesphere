import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Index({ auth, reports, filters }) {
    const { data, setData, get } = useForm({
        search: filters.search || '',
        status: filters.status || '',
        category: filters.category || '',
        urgency: filters.urgency || '',
        partner_id: filters.partner_id || '',
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
        get(route('reports.index'), {
            preserveState: true,
            preserveScroll: true,
            data: { ...data, [name]: value }
        });
    };

    const submit = (e) => {
        e.preventDefault();
        get(route('reports.index'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Reports</h2>}
        >
            <Head title="Reports" />

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="mb-4">
                        <form onSubmit={submit}>
                            <div className="flex flex-wrap items-center gap-4">
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Search reports..."
                                    className="shadow appearance-none border rounded py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                />
                                <select
                                    name="status"
                                    className="shadow appearance-none border rounded py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                                    value={data.status}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                </select>
                                <select
                                    name="category"
                                    className="shadow appearance-none border rounded py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                                    value={data.category}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Categories</option>
                                    <option value="Bug">Bug</option>
                                    <option value="Feature Request">Feature Request</option>
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Abuse Report">Abuse Report</option>
                                </select>
                                <select
                                    name="urgency"
                                    className="shadow appearance-none border rounded py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                                    value={data.urgency}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Urgencies</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Filter</button>
                            </div>
                        </form>
                    </div>

                    {!['admin', 'super_admin', 'partner_admin'].includes(auth.user.role) && (
                        <Link href={route('reports.create', { partner_id: data.partner_id })} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 inline-block">
                            Create Report
                        </Link>
                    )}

                    <div className="space-y-4">
                        {reports.data.length > 0 ? (
                            reports.data.map((report) => (
                                <div key={report.id} className="p-4 border dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800">
                                    <div className="flex items-start">
                                        <div className="flex-1">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                By <span className="text-blue-500 hover:underline">{report.user?.name || 'Unknown User'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                    <Link href={route('reports.show', report.id)} className="text-blue-500 hover:underline">{report.title}</Link>
                                                </h3>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(report.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="mt-2 text-gray-800 dark:text-gray-200">
                                                <span className="text-sm font-semibold">Category:</span> {report.category}
                                            </div>
                                            <div className="mt-2 text-gray-800 dark:text-gray-200">
                                                <span className="text-sm font-semibold">Urgency:</span>
                                                <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${report.urgency === 'Low' ? 'bg-gray-200 text-gray-800' :
                                                        report.urgency === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                                                            report.urgency === 'High' ? 'bg-orange-200 text-orange-800' :
                                                                'bg-red-200 text-red-800'}`}>
                                                    {report.urgency}
                                                </span>
                                            </div>
                                            <div className="mt-2">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${report.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                                                        report.status === 'in_progress' ? 'bg-blue-200 text-blue-800' :
                                                            'bg-green-200 text-green-800'}`}>
                                                    {report.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400">No reports found.</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-4">
                {/* Pagination Links - Simplified */}
                {reports.links && reports.links.map((link, index) => (
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
