import { Outlet, Link, useNavigate, useLocation, matchPath } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePartner } from '../context/PartnerContext';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/api';
import { Bell, User, LogOut, Menu, X, ChevronDown, Moon, Sun, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import NotificationPopover from '../components/NotificationPopover';
import ThemeToggle from '../components/ThemeToggle';

export default function MainLayout() {
    const { user, logout } = useAuth();
    const { currentPartner, setCurrentPartner } = usePartner();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const match = matchPath("/partners/:slug/*", location.pathname);
        if (match && match.params.slug) {
            const slug = match.params.slug;
            if (!currentPartner || currentPartner.slug !== slug) {
                api.get(`/partners/${slug}`)
                    .then(res => setCurrentPartner(res.data.partner))
                    .catch(err => console.error("Failed to sync partner context", err));
            }
        } else {
            if (currentPartner) {
                setCurrentPartner(null);
            }
        }
    }, [location.pathname, currentPartner, setCurrentPartner]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const NavLink = ({ to, children }) => (
        <Link
            to={to}
            className={clsx(
                "relative px-3 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap",
                isActive(to)
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            )}
        >
            {children}
            {isActive(to) && (
                <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                />
            )}
        </Link>
    );

    const NavDropdown = ({ title, items }) => {
        const [isOpen, setIsOpen] = useState(false);
        const isChildActive = items.some(item => isActive(item.to));

        return (
            <div
                className="relative"
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                <button
                    className={clsx(
                        "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors duration-200",
                        isChildActive
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                    )}
                >
                    {title}
                    <ChevronDown className={clsx("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                    {isChildActive && (
                        <motion.div
                            layoutId="navbar-indicator"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                        />
                    )}
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute left-0 mt-1 w-48 rounded-xl bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden z-50"
                        >
                            <div className="py-1">
                                {items.map((item) => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className={clsx(
                                            "block px-4 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors",
                                            isActive(item.to)
                                                ? "text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/20"
                                                : "text-slate-700 dark:text-slate-300"
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col">
            <nav className="sticky top-0 z-50 glass-panel border-b border-white/40 dark:border-slate-700/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Left: Logo */}
                        <div className="flex items-center flex-shrink-0">
                            <Link to={currentPartner ? `/partners/${currentPartner.slug}` : (user ? "/dashboard" : "/")} className="flex items-center gap-3 group">
                                {currentPartner ? (
                                    <div className="flex items-center gap-3">
                                        {currentPartner.logo && (
                                            <img src={currentPartner.logo} alt={currentPartner.name} className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-indigo-900" />
                                        )}
                                        <span className="text-lg font-bold text-slate-400 dark:text-slate-500">X</span>
                                        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                            SolveSphere
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                                        SolveSphere
                                    </span>
                                )}
                            </Link>
                        </div>

                        {/* Center: Navigation Links */}
                        <div className="hidden sm:flex sm:space-x-8 items-center justify-center flex-1 px-4">
                            {user?.role === 'super_admin' ? (
                                <>
                                    <NavLink to={currentPartner ? `/partners/${currentPartner.slug}/dashboard` : "/dashboard"}>Dashboard</NavLink>
                                    <NavLink to="/super-admin/partners">Partners</NavLink>
                                    <NavLink to="/super-admin/users">Users</NavLink>
                                    <NavDropdown
                                        title="Community"
                                        items={[
                                            { label: 'Reports', to: currentPartner ? `/partners/${currentPartner.slug}/reports` : "/reports" },
                                            { label: 'Forum', to: currentPartner ? `/partners/${currentPartner.slug}/forum` : "/forum" },
                                            { label: 'News', to: currentPartner ? `/partners/${currentPartner.slug}/news` : "/news" },
                                        ]}
                                    />
                                    <NavLink to="/chat">Messages</NavLink>
                                    <NavLink to="/super-admin/settings">Settings</NavLink>
                                </>
                            ) : user?.role === 'partner_admin' && currentPartner?.id === user?.partner_id ? (
                                <>
                                    <NavLink to={currentPartner ? `/partners/${currentPartner.slug}/dashboard` : "/dashboard"}>Dashboard</NavLink>
                                    <NavLink to="/partner-admin/users">Manage Users</NavLink>
                                    <NavLink to="/partner-admin/subscription">Subscription</NavLink>
                                    <NavDropdown
                                        title="Community"
                                        items={[
                                            { label: 'Reports', to: currentPartner ? `/partners/${currentPartner.slug}/reports` : "/reports" },
                                            { label: 'Forum', to: currentPartner ? `/partners/${currentPartner.slug}/forum` : "/forum" },
                                            { label: 'News', to: currentPartner ? `/partners/${currentPartner.slug}/news` : "/news" },
                                        ]}
                                    />
                                    <NavLink to="/chat">Messages</NavLink>
                                </>
                            ) : (
                                <>
                                    <NavLink to={currentPartner ? `/partners/${currentPartner.slug}/dashboard` : "/dashboard"}>Dashboard</NavLink>
                                    <NavDropdown
                                        title="Community"
                                        items={[
                                            { label: 'Reports', to: currentPartner ? `/partners/${currentPartner.slug}/reports` : "/reports" },
                                            { label: 'Forum', to: currentPartner ? `/partners/${currentPartner.slug}/forum` : "/forum" },
                                            { label: 'News', to: currentPartner ? `/partners/${currentPartner.slug}/news` : "/news" },
                                        ]}
                                    />
                                    <NavLink to="/social">Social</NavLink>
                                    <NavLink to="/chat">Messages</NavLink>
                                </>
                            )}
                        </div>

                        {/* Right: Actions */}
                        <div className="hidden sm:flex sm:items-center gap-4 flex-shrink-0">
                            <ThemeToggle />

                            {user ? (
                                <>
                                    <NotificationPopover />

                                    <Link to="/profile" className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user.name}</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{(user.role || 'user').replace('_', ' ')}</span>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-3xl text-white font-bold shadow-md overflow-hidden">
                                            {user.profile_picture ? (
                                                <img src={user.profile_picture} alt={user.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-sm">{user.name.charAt(0)}</span>
                                            )}
                                        </div>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </>
                            ) : (
                                <div className="space-x-4 flex items-center">
                                    <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Login</Link>
                                    <Link to="/register" className="btn-primary text-sm shadow-lg shadow-indigo-500/20">Register</Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center sm:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                            >
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="sm:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/40 overflow-hidden"
                        >
                            <div className="pt-2 pb-3 space-y-1 px-4">
                                {user?.role === 'super_admin' ? (
                                    <>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/dashboard` : "/dashboard"} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">Dashboard</Link>
                                        <Link to="/super-admin/partners" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">Partners</Link>
                                        <Link to="/super-admin/users" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">Users</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/reports` : "/reports"} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">Reports</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/forum` : "/forum"} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">Forum</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/news` : "/news"} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">News</Link>
                                        <Link to="/chat" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">Messages</Link>
                                        <Link to="/super-admin/settings" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">Settings</Link>
                                    </>
                                ) : user?.role === 'partner_admin' && currentPartner?.id === user?.partner_id ? (
                                    <>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/dashboard` : "/dashboard"} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">Dashboard</Link>
                                        <Link to="/partner-admin/users" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">Manage Users</Link>
                                        <Link to="/partner-admin/subscription" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">Subscription</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/reports` : "/reports"} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">Reports</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/forum` : "/forum"} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">Forum</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/news` : "/news"} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">News</Link>
                                        <Link to="/chat" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">Messages</Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/dashboard` : "/dashboard"} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">Dashboard</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/reports` : "/reports"} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">Reports</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/forum` : "/forum"} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">Forum</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/news` : "/news"} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">News</Link>
                                        <Link to="/social" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">Social</Link>
                                        <Link to="/chat" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">Messages</Link>
                                    </>
                                )}
                                {currentPartner && (
                                    <Link to={user ? "/dashboard" : "/"} className="block px-3 py-2 rounded-md text-base font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border-t border-slate-100 dark:border-slate-700 mt-2 pt-2">
                                        Back to Main Site
                                    </Link>
                                )}
                                {user ? (
                                    <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Logout</button>
                                ) : (
                                    <div className="mt-4 flex flex-col gap-2">
                                        <div className="flex items-center justify-between px-3 py-2">
                                            <span className="text-base font-medium text-slate-700 dark:text-slate-200">Theme</span>
                                            <ThemeToggle />
                                        </div>
                                        <Link to="/login" className="btn-secondary text-center">Login</Link>
                                        <Link to="/register" className="btn-primary text-center">Register</Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <Outlet />
            </main>

            <footer className="glass-panel mt-auto py-6 border-t border-white/40 dark:border-slate-700/40">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                    &copy; {new Date().getFullYear()} SolveSphere. All rights reserved.
                </div>
            </footer>

            {currentPartner && (
                <Link
                    to={user ? "/dashboard" : "/"}
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm font-medium text-slate-700 dark:text-slate-200 group"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Main Site
                </Link>
            )}
        </div >
    );
}
