import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

export default function LandingPage({ partner, partners }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <div class="flex-shrink-0 flex items-center">
                                {partner?.logo ? (
                                    <img src={partner.logo} alt={partner.name} className="h-10 w-auto mr-2 rounded" />
                                ) : null}
                                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                                    {partner?.name || 'SolveSphere'}
                                </span>
                            </div>
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-4">
                                    <a href="#" className="hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</a>
                                    <a href="#features" className="hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</a>
                                    <a href="#about" className="hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors">About</a>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-4 flex items-center md:ml-6">
                                <button
                                    onClick={toggleTheme}
                                    className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    {theme === 'dark' ? (
                                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 24.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                                    )}
                                </button>
                                <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Log in</Link>
                                <Link href="/register" className="ml-3 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-lg shadow-indigo-500/30">
                                    Get Started
                                </Link>
                            </div>
                        </div>
                        <div className="-mr-2 flex md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path className={!isMenuOpen ? 'block' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={isMenuOpen ? 'block' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                {/* Mobile menu */}
                <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800`}>
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <a href="#" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">Home</a>
                        <a href="#features" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">Features</a>
                        <a href="#about" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">About</a>
                        <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">Log in</Link>
                        <Link href="/register" className="block px-3 py-2 rounded-md text-base font-medium bg-indigo-600 hover:bg-indigo-700">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-16 pb-32 flex content-center items-center justify-center min-h-screen">
                <div className="absolute top-0 w-full h-full bg-center bg-cover" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80')" }}>
                    <span id="blackOverlay" className="w-full h-full absolute opacity-75 bg-black"></span>
                </div>
                <div className="container relative mx-auto">
                    <div className="items-center flex flex-wrap">
                        <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
                            <div className="pr-12">
                                <h1 className="text-gray-900 dark:text-white font-semibold text-5xl animate-fade-in-up">
                                    Your journey starts with <span className="text-indigo-400">{partner?.name || 'SolveSphere'}</span>
                                </h1>
                                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 animate-fade-in-up delay-100">
                                    A platform designed to empower your development workflow. Collaborate, innovate, and solve problems faster than ever before.
                                </p>
                                <div className="mt-8 flex flex-wrap justify-center gap-6 animate-fade-in-up delay-200">
                                    <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transform transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                        Get Started
                                    </Link>
                                    <a href="#features" className="bg-transparent border-2 border-gray-900 dark:border-white hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 text-gray-900 dark:text-white font-bold py-4 px-10 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                                        Learn More
                                    </a>
                                    <Link href="/apply-partner" className="bg-transparent border-2 border-indigo-500 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white font-bold py-4 px-10 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                        Apply as Partner
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px" style={{ transform: "translateZ(0)" }}>
                    <svg className="absolute bottom-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" version="1.1" viewBox="0 0 2560 100" x="0" y="0">
                        <polygon className="text-gray-50 dark:text-gray-900 fill-current" points="2560 0 2560 100 0 100"></polygon>
                    </svg>
                </div>
            </div>

            {/* Features Section */}
            <section className="pb-20 bg-gray-50 dark:bg-gray-900 -mt-24" id="features">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap">
                        <div className="lg:pt-12 pt-6 w-full md:w-4/12 px-4 text-center">
                            <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-gray-800 w-full mb-8 shadow-lg rounded-lg transform transition hover:-translate-y-2">
                                <div className="px-4 py-5 flex-auto">
                                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-red-400">
                                        <i className="fas fa-award"></i>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    </div>
                                    <h6 className="text-xl font-semibold text-gray-900 dark:text-white">Fast Performance</h6>
                                    <p className="mt-2 mb-4 text-gray-600 dark:text-gray-400">
                                        Optimized for speed and efficiency, ensuring your workflow never hits a bottleneck.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-4/12 px-4 text-center">
                            <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-gray-800 w-full mb-8 shadow-lg rounded-lg transform transition hover:-translate-y-2">
                                <div className="px-4 py-5 flex-auto">
                                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-blue-400">
                                        <i className="fas fa-retweet"></i>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                    </div>
                                    <h6 className="text-xl font-semibold text-gray-900 dark:text-white">Seamless Sync</h6>
                                    <p className="mt-2 mb-4 text-gray-600 dark:text-gray-400">
                                        Keep your team in sync with real-time updates and collaborative tools.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 w-full md:w-4/12 px-4 text-center">
                            <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-gray-800 w-full mb-8 shadow-lg rounded-lg transform transition hover:-translate-y-2">
                                <div className="px-4 py-5 flex-auto">
                                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-emerald-400">
                                        <i className="fas fa-fingerprint"></i>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    </div>
                                    <h6 className="text-xl font-semibold text-gray-900 dark:text-white">Secure & Reliable</h6>
                                    <p className="mt-2 mb-4 text-gray-600 dark:text-gray-400">
                                        Built with security in mind, protecting your data with enterprise-grade encryption.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners Section */}
            {!partner && (
                <section className="pb-20 bg-white dark:bg-gray-800" id="partners">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-wrap justify-center text-center mb-12">
                            <div className="w-full lg:w-6/12 px-4">
                                <h2 className="text-4xl font-semibold text-gray-900 dark:text-white">Our Partners</h2>
                                <p className="text-lg leading-relaxed m-4 text-gray-600 dark:text-gray-400">
                                    Collaborating with top organizations to bring you the best solutions.
                                </p>
                                <input
                                    type="text"
                                    placeholder="Search partners..."
                                    className="mt-4 px-4 py-2 border rounded-full w-full max-w-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                    onChange={(e) => {
                                        const term = e.target.value.toLowerCase();
                                        const cards = document.querySelectorAll('.partner-card');
                                        cards.forEach(card => {
                                            const name = card.dataset.name.toLowerCase();
                                            if (name.includes(term)) {
                                                card.style.display = 'block';
                                            } else {
                                                card.style.display = 'none';
                                            }
                                        });
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6">
                            {partners && partners.length > 0 ? (
                                partners.map((p) => (
                                    <div key={p.id} className="partner-card w-full md:w-6/12 lg:w-3/12 lg:mb-0 mb-12 px-4" data-name={p.name}>
                                        <div className="px-6">
                                            {p.logo ? (
                                                <img alt={p.name} src={p.logo} className="shadow-lg rounded-full mx-auto max-w-120-px h-32 w-32 object-cover" />
                                            ) : (
                                                <div className="shadow-lg rounded-full mx-auto h-32 w-32 bg-indigo-500 flex items-center justify-center text-white text-3xl font-bold">
                                                    {p.name.substring(0, 2)}
                                                </div>
                                            )}
                                            <div className="pt-6 text-center">
                                                <h5 className="text-xl font-bold text-gray-900 dark:text-white">{p.name}</h5>
                                                <p className="mt-1 text-sm text-gray-500 uppercase font-semibold">
                                                    {p.domain}
                                                </p>
                                                <div className="mt-6">
                                                    <Link href={route('partners.site.index', p.slug)} className="bg-indigo-500 text-white active:bg-indigo-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button">
                                                        Visit
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-600 dark:text-gray-400">No partners found.</p>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="relative bg-gray-50 dark:bg-gray-900 pt-8 pb-6 border-t border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap items-center md:justify-between justify-center">
                        <div className="w-full md:w-4/12 px-4 mx-auto text-center">
                            <div className="text-sm text-gray-500 font-semibold py-1">
                                Copyright © {new Date().getFullYear()} {partner?.name || 'SolveSphere'}.
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
