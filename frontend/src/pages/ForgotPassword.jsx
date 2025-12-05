import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Placeholder logic - backend implementation required
        setSubmitted(true);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
                <p className="mt-2 text-sm text-slate-600">
                    Enter your email address and we'll send you a link to reset your password.
                </p>
            </div>

            {submitted ? (
                <div className="p-4 rounded-lg bg-green-50 text-green-700 text-sm">
                    <p className="font-medium">Check your email</p>
                    <p className="mt-1">If an account exists for {email}, you will receive a password reset link.</p>
                    <div className="mt-4">
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                            Back to Login
                        </Link>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
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
                        <button
                            type="submit"
                            className="btn-primary w-full flex justify-center"
                        >
                            Send Reset Link
                        </button>
                    </div>

                    <div className="text-center">
                        <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                            Back to Login
                        </Link>
                    </div>
                </form>
            )}
        </div>
    );
}
