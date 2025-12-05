import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, processing, errors, setError, clearErrors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            // clearErrors();
        };
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        clearErrors();

        try {
            const response = await axios.post('/api/login', {
                email: data.email,
                password: data.password,
            });

            localStorage.setItem('token', response.data.token);
            // Redirect to dashboard. Since we are using API auth, we might need to reload 
            // or ensure the next request sends the token. 
            // For now, we assume the backend might still serve the dashboard via web routes 
            // if we restore them, or we rely on client-side routing if available.
            // Given the mixed state, a hard redirect is safest to trigger any necessary checks.
            window.location.href = '/dashboard';
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setError(error.response.data.errors);
            } else if (error.response && error.response.status === 401) {
                setError('email', 'Invalid login credentials');
            } else {
                console.error('Login error:', error);
            }
        }
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && <div className="mb-4 font-medium text-sm text-green-600 dark:text-green-400">{status}</div>}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="block mt-4">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                    </label>
                </div>

                <div className="flex items-center justify-end mt-4">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <PrimaryButton className="ml-4" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>

                <div className="mt-4 text-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Don't have an account?</span>
                    <Link
                        href={route('register')}
                        className="underline text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-100 ml-1"
                    >
                        Register
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
