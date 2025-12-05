import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function PartnerApplication({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        domain: '',
        website: '',
        description: '',
        logo: null,
        user_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        // Assuming there is a route for storing partner applications
        post(route('apply-partner.store'));
    };

    return (
        <GuestLayout>
            <Head title="Partner Application" />

            <form onSubmit={submit} encType="multipart/form-data">
                <div>
                    <InputLabel htmlFor="name" value="Partner Name" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="domain" value="Subdomain (e.g., partner)" />
                    <div className="flex items-center">
                        <TextInput
                            id="domain"
                            name="domain"
                            value={data.domain}
                            className="mt-1 block w-full rounded-r-none"
                            onChange={(e) => setData('domain', e.target.value)}
                            required
                        />
                        <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 mt-1">
                            .solvesphere.com
                        </span>
                    </div>
                    <InputError message={errors.domain} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="website" value="Website URL" />
                    <TextInput
                        id="website"
                        type="url"
                        name="website"
                        value={data.website}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('website', e.target.value)}
                        required
                        placeholder="https://example.com"
                    />
                    <InputError message={errors.website} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="logo" value="Logo" />
                    <input
                        id="logo"
                        type="file"
                        name="logo"
                        className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                        onChange={(e) => {
                            setData('logo', e.target.files[0]);
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                document.getElementById('logo-preview').src = e.target.result;
                                document.getElementById('logo-preview').classList.remove('hidden');
                            };
                            reader.readAsDataURL(e.target.files[0]);
                        }}
                        required
                        accept="image/*"
                    />
                    <img id="logo-preview" src="#" alt="Logo Preview" className="mt-2 h-20 w-20 object-cover rounded-full hidden border border-gray-300" />
                    <InputError message={errors.logo} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="description" value="Description" />
                    <textarea
                        id="description"
                        name="description"
                        value={data.description}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                        onChange={(e) => setData('description', e.target.value)}
                        required
                    />
                    <InputError message={errors.description} className="mt-2" />
                </div>

                {!auth.user && (
                    <>
                        <div className="mt-4">
                            <InputLabel htmlFor="user_name" value="Your Name" />
                            <TextInput
                                id="user_name"
                                name="user_name"
                                value={data.user_name}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('user_name', e.target.value)}
                                required
                            />
                            <InputError message={errors.user_name} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('email', e.target.value)}
                                required
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
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>
                    </>
                )}

                <div className="flex items-center justify-end mt-4">
                    <PrimaryButton className="ml-4" disabled={processing}>
                        Submit Application
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
