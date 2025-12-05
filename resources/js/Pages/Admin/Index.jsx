import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Index({ auth, users, partners, reports, news }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Admin Dashboard</h2>}
        >
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold">Total Users</h3>
                                    <p className="text-3xl font-bold">{users}</p>
                                </div>
                                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold">Total Partners</h3>
                                    <p className="text-3xl font-bold">{partners}</p>
                                </div>
                                <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold">Reports</h3>
                                    <p className="text-3xl font-bold">{reports}</p>
                                </div>
                                <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold">News</h3>
                                    <p className="text-3xl font-bold">{news}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
