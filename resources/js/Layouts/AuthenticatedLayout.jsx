import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

    const { props } = usePage();
    const partner = props.partner || (user?.partner || null);

    console.log('User:', user);
    console.log('Partner:', partner);
    console.log('User Profile Picture:', user?.profile_picture);
    if (partner) console.log('Partner Logo:', partner.logo);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar Overlay */}
            <div
                className={`fixed z-20 inset-0 bg-black opacity-50 transition-opacity lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
                onClick={() => setSidebarOpen(false)}
            ></div>

            {/* Sidebar */}
            <div className={`fixed z-30 inset-y-0 left-0 w-80 transition duration-300 transform bg-white dark:bg-gray-800 overflow-y-auto lg:inset-0 border-r border-gray-200 dark:border-gray-700 
                ${sidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'}
                ${desktopSidebarOpen ? 'lg:translate-x-0 lg:static' : 'lg:-translate-x-full lg:absolute'}
            `}>
                <div className="flex items-center justify-center mt-8 px-4">
                    {partner ? (
                        <div className="flex items-center justify-center space-x-3">
                            {partner.logo ? (
                                <img src={partner.logo.startsWith('http') ? partner.logo : `/storage/${partner.logo.replace('public/', '')}`} alt={partner.name} className="h-10 w-10 rounded-full object-cover border-2 border-white/20" />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs border-2 border-white/20">
                                    {partner.name.substring(0, 2)}
                                </div>
                            )}
                            <span className="text-gray-400 font-bold text-lg">X</span>
                            <Link href={route('dashboard')}>
                                <img src="/assets/logo.png" alt="SolveSphere" className="block h-14 w-auto" />
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <Link href={route('dashboard')}>
                                <img src="/assets/logo.png" alt="Logo Web" className="block h-20 w-auto" />
                            </Link>
                        </div>
                    )}
                </div>

                <nav className="mt-10 space-y-1 px-2">
                    <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                        Dashboard
                    </NavLink>
                    <NavLink href={route('reports.index')} active={route().current('reports.index')}>
                        Reports
                    </NavLink>
                    <NavLink href={route('forum-topics.index')} active={route().current('forum-topics.index')}>
                        Forum
                    </NavLink>
                    <NavLink href={route('news.index')} active={route().current('news.index')}>
                        News
                    </NavLink>
                    {(user.role !== 'general_user' || user.partner_id) && (
                        <NavLink href={route('chat.index')} active={route().current('chat.*')}>
                            Messages
                        </NavLink>
                    )}

                    {/* Role Based Links */}
                    {user.role === 'super_admin' && (
                        <NavLink href={route('super-admin.partners.index')} active={route().current('super-admin.partners.*')}>
                            Manage Partners
                        </NavLink>
                    )}

                    {user.role === 'partner_admin' && (
                        <>
                            <NavLink href={route('partner-admin.partner-admins.index')} active={route().current('partner-admin.partner-admins.*')}>
                                Manage Admins
                            </NavLink>
                            <NavLink href={route('partner-admin.users.index')} active={route().current('partner-admin.users.*')}>
                                Manage Users
                            </NavLink>
                            <NavLink href={route('partner-admin.subscription.index')} active={route().current('partner-admin.subscription.*')}>
                                Subscription
                            </NavLink>
                        </>
                    )}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center py-4 px-6 bg-white dark:bg-gray-800 border-b-4 border-indigo-600">
                    <div className="flex items-center">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 dark:text-gray-300 focus:outline-none lg:hidden">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6H20M4 12H20M4 18H11"></path></svg>
                        </button>
                        <button onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)} className="hidden lg:block text-gray-500 dark:text-gray-300 focus:outline-none ml-4">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6H20M4 12H20M4 18H11"></path></svg>
                        </button>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none">
                            {theme === 'dark' ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                            )}
                        </button>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowingNavigationDropdown(showingNavigationDropdown === 'notifications' ? false : 'notifications')}
                                className="p-2 rounded-full text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none relative"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                                {props.auth.notifications && props.auth.notifications.length > 0 && (
                                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-400"></span>
                                )}
                            </button>
                            {showingNavigationDropdown === 'notifications' && (
                                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 max-h-96 overflow-y-auto">
                                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300">
                                        Notifications
                                    </div>
                                    {props.auth.notifications && props.auth.notifications.length > 0 ? (
                                        props.auth.notifications.map((notification) => (
                                            <Link
                                                key={notification.id}
                                                href={notification.data.url}
                                                className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 ease-in-out"
                                            >
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{notification.data.message}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{new Date(notification.created_at).toLocaleDateString()}</p>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                            No new notifications
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <div className="flex items-center cursor-pointer" onClick={() => setShowingNavigationDropdown(showingNavigationDropdown === 'profile' ? false : 'profile')}>
                                <div className="mr-2">
                                    <img
                                        src={user.profile_picture ? (user.profile_picture.startsWith('http') || user.profile_picture.startsWith('data:') ? user.profile_picture : `/storage/${user.profile_picture.replace('public/', '')}`) : `https://i.pravatar.cc/50?u=${user.id}`}
                                        alt={user.name}
                                        className="h-8 w-8 rounded-full object-cover"
                                    />
                                </div>
                                <div className="font-medium text-base text-gray-800 dark:text-gray-200">{user.name}</div>
                            </div>
                            {/* Dropdown Content - Simplified */}
                            {showingNavigationDropdown === 'profile' && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                                    <Link href={route('profile.edit')} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</Link>
                                    <Link href={route('logout')} method="post" as="button" className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Log Out</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {header && (
                    <header className="bg-white dark:bg-gray-800 shadow">
                        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

function NavLink({ href, active, children }) {
    return (
        <Link
            href={href}
            className={`flex items-center px-2 py-2 text-base font-medium rounded-md transition duration-150 ease-in-out ${active
                ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                }`}
        >
            {children}
        </Link>
    );
}
