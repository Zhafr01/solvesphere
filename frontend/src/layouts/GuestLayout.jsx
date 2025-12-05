import { Outlet, Link } from 'react-router-dom';

export default function GuestLayout() {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900">
            <div>
                <Link to="/" className="text-4xl font-bold text-white drop-shadow-md">
                    SolveSphere
                </Link>
            </div>

            <div className="w-full sm:max-w-md mt-8 px-8 py-8 glass-panel overflow-hidden sm:rounded-2xl">
                <Outlet />
            </div>
        </div>
    );
}
