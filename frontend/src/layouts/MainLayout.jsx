import { Outlet, Link, useNavigate, useLocation, matchPath } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePartner } from '../context/PartnerContext';

import api from '../lib/api';
import { LogOut, Menu, X, ChevronDown, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import NotificationPopover from '../components/NotificationPopover';
import ThemeToggle from '../components/ThemeToggle';
import BottomNav from '../components/BottomNav';
import BackgroundAnimation from '../components/BackgroundAnimation';

export default function MainLayout() {
    const { user, logout } = useAuth();
    const { currentPartner, setCurrentPartner } = usePartner();

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
                "relative px-4 py-2 text-sm font-bold transition-all duration-300 rounded-xl",
                isActive(to)
                    ? "text-white bg-white/10 shadow-lg shadow-indigo-500/20 backdrop-blur-md"
                    : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/50 dark:hover:bg-white/5"
            )}
        >
            <span className={clsx(
                "relative z-10 bg-clip-text",
                isActive(to) ? "text-transparent bg-gradient-to-r from-indigo-400 to-violet-400" : ""
            )}>
                {children}
            </span>
            {isActive(to) && (
                <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-200/20 dark:border-indigo-500/20"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
                        "flex items-center gap-1 px-4 py-2 text-sm font-bold transition-all duration-300 rounded-xl",
                        isChildActive
                            ? "text-white bg-white/10 shadow-lg shadow-indigo-500/20 backdrop-blur-md"
                            : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/50 dark:hover:bg-white/5"
                    )}
                >
                    <span className={clsx(
                        "relative z-10 bg-clip-text flex items-center gap-1",
                        isChildActive ? "text-transparent bg-gradient-to-r from-indigo-400 to-violet-400" : ""
                    )}>
                        {title}
                        <ChevronDown className={clsx("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                    </span>
                    {isChildActive && (
                        <motion.div
                            layoutId="navbar-indicator"
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-200/20 dark:border-indigo-500/20"
                            initial={false}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    )}
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute left-0 mt-2 w-56 rounded-2xl glass-panel border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden z-50 p-2"
                        >
                            <div className="space-y-1">
                                {items.map((item) => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className={clsx(
                                            "block px-4 py-3 text-sm rounded-xl transition-all duration-200",
                                            isActive(item.to)
                                                ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold shadow-md"
                                                : "text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400"
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
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-50 dark:bg-slate-950">
            <BackgroundAnimation intensity="high" />

            <nav className="sticky top-0 z-50 transition-all duration-300">
                <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 dark:border-white/5 shadow-sm supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-slate-900/40"></div>

                <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex h-20 items-center justify-between">
                        {/* Left: Logo */}
                        <div className="flex items-center flex-shrink-0">
                            <Link to={currentPartner ? `/partners/${currentPartner.slug}` : (user ? "/dashboard" : "/")} className="flex items-center gap-3 group">
                                {currentPartner ? (
                                    <div className="flex items-center gap-3">
                                        {currentPartner.logo && (
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                                                <img src={currentPartner.logo} alt={currentPartner.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-white/50 dark:ring-white/10 shadow-lg relative z-10" />
                                            </div>
                                        )}
                                        <span className="text-xl font-bold text-slate-400 dark:text-slate-500">/</span>
                                        <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                                            SolveSphere
                                        </span>
                                    </div>
                                ) : (
                                    <div className="relative flex items-center gap-2">
                                        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-fuchsia-500 blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 rounded-full"></div>
                                        <img src="/public/images/logo.png" alt="SolveSphere Logo" className="h-8 w-auto relative z-10" />
                                        <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 relative z-10">
                                            SolveSphere
                                        </span>
                                    </div>
                                )}
                            </Link>
                        </div>

                        {/* Center: Navigation Links */}
                        <div className="hidden lg:flex lg:space-x-2 items-center justify-center flex-1 px-4">
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
                                    <NavLink to={currentPartner ? `/partners/${currentPartner.slug}/users` : "/partner-admin/users"}>Users</NavLink>
                                    <NavLink to={currentPartner ? `/partners/${currentPartner.slug}/subscription` : "/partner-admin/subscription"}>Subscription</NavLink>
                                    <NavDropdown
                                        title="Community"
                                        items={[
                                            { label: 'Reports', to: currentPartner ? `/partners/${currentPartner.slug}/reports` : "/reports" },
                                            { label: 'Forum', to: currentPartner ? `/partners/${currentPartner.slug}/forum` : "/forum" },
                                            { label: 'News', to: currentPartner ? `/partners/${currentPartner.slug}/news` : "/news" },
                                        ]}
                                    />
                                    <NavLink to={currentPartner ? `/partners/${currentPartner.slug}/chat` : "/chat"}>Messages</NavLink>
                                    <NavLink to={currentPartner ? `/partners/${currentPartner.slug}/settings` : "/partner-admin/settings"}>Settings</NavLink>
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
                                    <NavLink to={currentPartner ? `/partners/${currentPartner.slug}/social` : "/social"}>Social</NavLink>
                                    <NavLink to={currentPartner ? `/partners/${currentPartner.slug}/chat` : "/chat"}>Messages</NavLink>
                                </>
                            )}
                        </div>

                        {/* Right: Actions */}
                        <div className="hidden lg:flex lg:items-center gap-4 flex-shrink-0">
                            <ThemeToggle />

                            {user ? (
                                <>
                                    <NotificationPopover />

                                    <Link to={currentPartner ? `/partners/${currentPartner.slug}/profile` : "/profile"} className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700/50 hover:opacity-80 transition-opacity group">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{user.name}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{(user.role || 'user').replace('_', ' ')}</span>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full blur opacity-20 group-hover:opacity-50 transition-opacity"></div>
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg text-white font-bold shadow-lg overflow-hidden relative z-10 border-2 border-white dark:border-slate-800">
                                                {user.profile_picture ? (
                                                    <img src={user.profile_picture} alt={user.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <span>{user.name.charAt(0)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-105"
                                        title="Retire car"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </>
                            ) : (
                                <div className="space-x-4 flex items-center">
                                    <Link to="/login" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Login</Link>
                                    <Link to="/register" className="btn-primary shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all">Register</Link>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center lg:hidden gap-4">
                            {user && <NotificationPopover />}
                            <ThemeToggle />
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
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
                            className="lg:hidden absolute top-20 left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-b border-white/20 dark:border-slate-700/40 overflow-hidden z-40 shadow-xl"
                        >
                            <div className="py-4 space-y-1 px-4 max-h-[calc(100vh-5rem)] overflow-y-auto">
                                {user && (
                                    <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                                        <Link
                                            to={currentPartner ? `/partners/${currentPartner.slug}/profile` : "/profile"}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg text-white font-bold shadow-md overflow-hidden ring-2 ring-white dark:ring-slate-700">
                                                {user.profile_picture ? (
                                                    <img src={user.profile_picture} alt={user.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <span>{user.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 dark:text-slate-200">{user.name}</span>
                                                <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{(user.role || 'user').replace('_', ' ')}</span>
                                            </div>
                                        </Link>
                                    </div>
                                )}

                                {user?.role === 'super_admin' ? (
                                    <>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/dashboard` : "/dashboard"} className="mobile-nav-link">Dashboard</Link>
                                        <Link to="/super-admin/partners" className="mobile-nav-link">Partners</Link>
                                        <Link to="/super-admin/users" className="mobile-nav-link">Users</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/reports` : "/reports"} className="mobile-nav-link">Reports</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/forum` : "/forum"} className="mobile-nav-link">Forum</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/news` : "/news"} className="mobile-nav-link">News</Link>
                                        <Link to="/chat" className="mobile-nav-link">Messages</Link>
                                        <Link to="/super-admin/settings" className="mobile-nav-link">Settings</Link>
                                    </>
                                ) : user?.role === 'partner_admin' && currentPartner?.id === user?.partner_id ? (
                                    <>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/dashboard` : "/dashboard"} className="mobile-nav-link">Dashboard</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/users` : "/partner-admin/users"} className="mobile-nav-link">Manage Users</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/subscription` : "/partner-admin/subscription"} className="mobile-nav-link">Subscription</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/reports` : "/reports"} className="mobile-nav-link">Reports</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/forum` : "/forum"} className="mobile-nav-link">Forum</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/news` : "/news"} className="mobile-nav-link">News</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/chat` : "/chat"} className="mobile-nav-link">Messages</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/settings` : "/partner-admin/settings"} className="mobile-nav-link">Settings</Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/dashboard` : "/dashboard"} className="mobile-nav-link">Dashboard</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/reports` : "/reports"} className="mobile-nav-link">Reports</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/forum` : "/forum"} className="mobile-nav-link">Forum</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/news` : "/news"} className="mobile-nav-link">News</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/social` : "/social"} className="mobile-nav-link">Social</Link>
                                        <Link to={currentPartner ? `/partners/${currentPartner.slug}/chat` : "/chat"} className="mobile-nav-link">Messages</Link>
                                    </>
                                )}
                                {currentPartner && (
                                    <Link to={user ? "/dashboard" : "/"} className="mobile-nav-link border-t border-slate-100 dark:border-slate-800 mt-2 pt-2 text-slate-500">
                                        Back to Main Site
                                    </Link>
                                )}
                                {user ? (
                                    <button onClick={handleLogout} className="mobile-nav-link w-full text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Logout</button>
                                ) : (
                                    <div className="mt-6 flex flex-col gap-3">
                                        <Link to="/login" className="btn-secondary w-full justify-center">Login</Link>
                                        <Link to="/register" className="btn-primary w-full justify-center">Register</Link>
                                    </div>
                                )}

                                {/* Legal Links */}
                                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 space-y-1">
                                    <Link to="/about-us" className="mobile-nav-link text-sm text-slate-500 font-normal">About Us</Link>
                                    <Link to="/privacy-policy" className="mobile-nav-link text-sm text-slate-500 font-normal">Privacy Policy</Link>
                                    <Link to="/terms-of-service" className="mobile-nav-link text-sm text-slate-500 font-normal">Terms of Service</Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <main className="flex-grow pt-8 pb-32 px-4 sm:px-6 lg:px-8 mx-auto w-full relative flex flex-col md:pb-24 z-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname.includes('/chat') ? 'chat-page' : location.pathname}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3 }}
                        className="w-full pb-32 md:pb-0"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>

                {/* Sticky Back Buttons */}
                <div className="fixed bottom-24 md:bottom-8 right-8 z-40 pointer-events-none">
                    {currentPartner && (
                        <Link
                            to={user ? "/dashboard" : "/"}
                            className="pointer-events-auto flex items-center gap-2 px-5 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full shadow-2xl hover:shadow-indigo-500/20 hover:scale-105 transition-all text-sm font-bold text-slate-700 dark:text-slate-200 group"
                        >
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Main Site
                        </Link>
                    )}

                    {!currentPartner && location.pathname === '/dashboard' && (
                        <Link
                            to="/"
                            className="pointer-events-auto flex items-center gap-2 px-5 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full shadow-2xl hover:shadow-indigo-500/20 hover:scale-105 transition-all text-sm font-bold text-slate-700 dark:text-slate-200 group"
                        >
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Landing Page
                        </Link>
                    )}
                </div>
            </main>

            <footer className="mt-auto py-8 border-t border-white/10 dark:border-white/5 relative z-10 bg-white/30 dark:bg-slate-900/30 backdrop-blur-lg hidden md:block">
                <div className="max-w-[95%] mx-auto px-4 flex justify-between items-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                    <span>&copy; {new Date().getFullYear()} SolveSphere. All rights reserved.</span>
                    <div className="flex gap-6">
                        <Link to="/about-us" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            About Us
                        </Link>
                        <Link to="/privacy-policy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/terms-of-service" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </footer>

            <BottomNav />

            <style>{`
                .mobile-nav-link {
                    display: block;
                    padding: 0.75rem 1rem;
                    border-radius: 0.75rem;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #475569;
                    transition: all 0.2s;
                }
                .dark .mobile-nav-link {
                    color: #e2e8f0;
                }
                .mobile-nav-link:hover {
                    background-color: rgba(99, 102, 241, 0.1);
                    color: #4f46e5;
                }
                .dark .mobile-nav-link:hover {
                    background-color: rgba(99, 102, 241, 0.2);
                    color: #818cf8;
                }
            `}</style>
        </div >
    );
}
