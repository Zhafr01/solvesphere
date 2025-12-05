import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Apply({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        domain: '',
        website: '',
        description: '',
        logo: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('apply-partner.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Apply for Partnership</h2>}
        >
            <Head title="Apply for Partnership" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Partner Name</label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                    {errors.name && <div className="text-red-600 mt-1">{errors.name}</div>}
                                </div>

                                <div>
                                    <label htmlFor="domain" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Domain Slug (e.g., my-community)</label>
                                    <input
                                        id="domain"
                                        type="text"
                                        value={data.domain}
                                        onChange={(e) => setData('domain', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                    {errors.domain && <div className="text-red-600 mt-1">{errors.domain}</div>}
                                </div>

                                <div>
                                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Website URL (Optional)</label>
                                    <input
                                        id="website"
                                        type="url"
                                        value={data.website}
                                        onChange={(e) => setData('website', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                    />
                                    {errors.website && <div className="text-red-600 mt-1">{errors.website}</div>}
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                        rows="4"
                                        required
                                    ></textarea>
                                    {errors.description && <div className="text-red-600 mt-1">{errors.description}</div>}
                                </div>

                                <div>
                                    <label htmlFor="logo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo</label>
                                    <input
                                        id="logo"
                                        type="file"
                                        onChange={(e) => setData('logo', e.target.files[0])}
                                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-700 dark:file:text-gray-300"
                                        required
                                    />
                                    {errors.logo && <div className="text-red-600 mt-1">{errors.logo}</div>}
                                </div>

                                <div className="flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                                    >
                                        Submit Application
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
