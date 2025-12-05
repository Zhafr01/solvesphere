import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, conversations }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Messages</h2>}
        >
            <Head title="Messages" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-lg font-semibold mb-4">Conversations</h3>
                            {conversations.length > 0 ? (
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {conversations.map((user) => (
                                        <li key={user.id} className="py-4 flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className="mr-4">
                                                    <img
                                                        src={user.profile_picture ? (user.profile_picture.startsWith('http') || user.profile_picture.startsWith('data:') ? user.profile_picture : `/storage/${user.profile_picture}`) : `https://i.pravatar.cc/50?u=${user.id}`}
                                                        alt={user.name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {user.partner ? `${user.partner.name} Admin` : 'Super Admin'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Link
                                                href={route('chat.show', user.id)}
                                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                            >
                                                Chat
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">No conversations found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
