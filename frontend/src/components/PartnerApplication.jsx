import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Upload, CheckCircle } from 'lucide-react';
import api from '../lib/api';

export default function PartnerApplication({ isOpen, onClose }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        domain: '',
        website: '',
        description: '',
        logo: null
    });
    const [logoPreview, setLogoPreview] = useState(null);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, logo: file });
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const data = new FormData();
        data.append('name', formData.name);
        data.append('domain', formData.domain);
        data.append('website', formData.website);
        data.append('description', formData.description);
        if (formData.logo) {
            data.append('logo', formData.logo);
        }

        try {
            await api.post('/apply-partner', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStep(2); // Success step
        } catch (err) {
            console.error("Application failed", err);
            setError(err.response?.data?.message || 'Failed to submit application. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setFormData({
            name: '',
            domain: '',
            website: '',
            description: '',
            logo: null
        });
        setLogoPreview(null);
        setError('');
        onClose();
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-4">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                        {step === 1 ? 'Apply as Partner' : 'Application Submitted'}
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {step === 1 ? (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {error && (
                                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                                {error}
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Partner Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="input-field"
                                                required
                                                placeholder="e.g. PixelForge Games"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Domain Slug</label>
                                            <div className="flex">
                                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                    solvesphere.com/partners/
                                                </span>
                                                <input
                                                    type="text"
                                                    name="domain"
                                                    value={formData.domain}
                                                    onChange={handleChange}
                                                    className="input-field rounded-l-none"
                                                    required
                                                    placeholder="pixelforge"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                                            <input
                                                type="url"
                                                name="website"
                                                value={formData.website}
                                                onChange={handleChange}
                                                className="input-field"
                                                placeholder="https://pixelforge.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows="3"
                                                className="input-field"
                                                required
                                                placeholder="Tell us about your organization..."
                                            ></textarea>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-500 transition-colors cursor-pointer relative">
                                                <div className="space-y-1 text-center">
                                                    {logoPreview ? (
                                                        <img src={logoPreview} alt="Preview" className="mx-auto h-24 w-24 object-contain" />
                                                    ) : (
                                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                    )}
                                                    <div className="flex text-sm text-gray-600 justify-center">
                                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                                            <span>Upload a file</span>
                                                            <input
                                                                type="file"
                                                                name="logo"
                                                                onChange={handleFileChange}
                                                                className="sr-only"
                                                                accept="image/*"
                                                                required
                                                            />
                                                        </label>
                                                    </div>
                                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="btn-primary w-full flex justify-center"
                                            >
                                                {loading ? 'Submitting...' : 'Submit Application'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="text-center py-6">
                                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                            <CheckCircle className="h-10 w-10 text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-medium text-gray-900 mb-2">Application Received!</h3>
                                        <p className="text-gray-500 mb-6">
                                            Your application has been submitted successfully. Our team will review it and get back to you shortly.
                                        </p>
                                        <button
                                            onClick={resetForm}
                                            className="btn-primary w-full"
                                        >
                                            Close
                                        </button>
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
