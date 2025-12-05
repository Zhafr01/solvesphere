import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

export default function Guest({ children }) {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

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

    const backgroundImage = theme === 'dark' ? '/assets/auth_background_dark.png' : '/assets/auth_background.png';

    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center p-6 bg-gray-100 dark:bg-gray-900">
            <div className="absolute top-4 right-4 z-10">
                <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 bg-gray-200 dark:text-gray-400 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none">
                    {theme === 'dark' ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                    )}
                </button>
            </div>

            <div className="w-full md:w-1/2 md:min-h-[40vh] bg-white dark:bg-gray-800 shadow-2xl overflow-hidden rounded-3xl flex flex-col md:flex-row">
                {/* Left Side - Image/Branding */}
                <div className="w-full md:w-1/2 h-48 md:h-auto bg-cover bg-center relative" style={{ backgroundImage: `url('${backgroundImage}')` }}>
                    <div className="absolute inset-0 bg-indigo-900/40 dark:bg-black/40"></div>
                    <div className="relative z-10 flex flex-col justify-center items-center w-full h-full text-white px-6">
                        <div className="bg-black/30 p-6 rounded-2xl backdrop-blur-sm shadow-lg">
                            <h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-4 drop-shadow-lg text-center">SolveSphere</h1>
                            <p className="text-base md:text-lg text-center drop-shadow-md">Connect. Collaborate. Solve.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center">
                    <div className="flex justify-center mb-6">
                        <Link href="/">
                            <img src="/assets/logo.png" className="w-20 h-20 fill-current text-gray-500" alt="Logo" />
                        </Link>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
