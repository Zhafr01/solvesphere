import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await login({ email, password });
            navigate('/dashboard');
        } catch (err) {
            let errorMessage = err.response?.data?.message || 'Login failed';
            if (errorMessage.includes('SQLSTATE') || errorMessage.includes('Connection refused')) {
                errorMessage = 'System is currently unavailable. Please try again later.';
            }
            setError(errorMessage);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">{error}</div>}

            <div>
                <label className="block text-slate-700 dark:text-slate-200 text-sm font-semibold mb-2" htmlFor="email">
                    Email Address
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    required
                    placeholder="you@example.com"
                />
            </div>

            <div>
                <label className="block text-slate-700 dark:text-slate-200 text-sm font-semibold mb-2" htmlFor="password">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    required
                    placeholder="••••••••"
                />
            </div>

            <div className="flex items-center justify-end">
                <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                    Forgot your password?
                </Link>
            </div>

            <div>
                <button
                    type="submit"
                    className="btn-primary w-full flex justify-center"
                >
                    Sign In
                </button>
            </div>

            <div className="text-center">
                <p className="text-sm text-slate-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Register
                    </Link>
                </p>
            </div>
        </form>
    );
}
