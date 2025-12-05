import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState(null);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await register({ name, email, password, password_confirmation: passwordConfirmation });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">{error}</div>}

            <div>
                <label className="block text-slate-700 text-sm font-semibold mb-2" htmlFor="name">
                    Full Name
                </label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    required
                    placeholder="John Doe"
                />
            </div>

            <div>
                <label className="block text-slate-700 text-sm font-semibold mb-2" htmlFor="email">
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
                <label className="block text-slate-700 text-sm font-semibold mb-2" htmlFor="password">
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

            <div>
                <label className="block text-slate-700 text-sm font-semibold mb-2" htmlFor="password_confirmation">
                    Confirm Password
                </label>
                <input
                    id="password_confirmation"
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="input-field"
                    required
                    placeholder="••••••••"
                />
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    className="btn-primary w-full flex justify-center"
                >
                    Create Account
                </button>
            </div>

            <div className="text-center">
                <p className="text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Login
                    </Link>
                </p>
            </div>
        </form>
    );
}
