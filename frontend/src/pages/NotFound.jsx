import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
            <div className="bg-indigo-50 text-indigo-600 rounded-full p-6 mb-6">
                <span className="text-6xl font-bold">404</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
            <p className="text-gray-500 max-w-md mb-8">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Go Back
                </button>
                <Link
                    to="/"
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                >
                    <Home className="h-5 w-5" />
                    Go Home
                </Link>
            </div>
        </div>
    );
}
