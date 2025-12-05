import React, { useState, useEffect, useRef } from 'react';
import api from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Upload, CheckCircle, XCircle, Clock, AlertCircle, FileText } from 'lucide-react';

export default function Index() {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [proofImage, setProofImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSubscription();
    }, []);

    const fetchSubscription = async () => {
        try {
            const { data } = await api.get('/partner-admin/subscription');
            setSubscription(data);
        } catch (error) {
            console.error("Failed to fetch subscription", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProofImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!proofImage) return;

        setUploading(true);
        setMessage({ type: '', text: '' });

        const formData = new FormData();
        formData.append('proof_image', proofImage);

        try {
            const response = await api.post('/partner-admin/subscription', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            setMessage({ type: 'success', text: 'Payment proof uploaded successfully.' });
            setSubscription(response.data.subscription);
            setProofImage(null);
            setPreview(null);
        } catch (error) {
            console.error('Upload failed', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to upload payment proof.' });
        } finally {
            setUploading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium"><CheckCircle className="w-4 h-4" /> Active</span>;
            case 'pending':
                return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm font-medium"><Clock className="w-4 h-4" /> Pending Approval</span>;
            case 'rejected':
                return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium"><XCircle className="w-4 h-4" /> Rejected</span>;
            default:
                return <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-medium"><AlertCircle className="w-4 h-4" /> Unknown</span>;
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Subscription Management</h1>
            </div>

            {/* Status Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        Subscription Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {subscription ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Current Status</p>
                                    <div>{getStatusBadge(subscription.status)}</div>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Start Date</p>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {subscription.start_date ? new Date(subscription.start_date).toLocaleDateString() : '-'}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">End Date</p>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : '-'}
                                    </p>
                                </div>
                            </div>

                            {subscription.proof_image && (
                                <div>
                                    <p className="text-sm font-medium text-slate-700 mb-2">Submitted Proof</p>
                                    <div className="border rounded-lg p-2 inline-block bg-white">
                                        <img
                                            src={subscription.proof_image.startsWith('http') ? subscription.proof_image : `http://localhost:8000/storage/${subscription.proof_image}`}
                                            alt="Payment Proof"
                                            className="max-w-xs rounded"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>No subscription record found.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Upload Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="w-5 h-5 text-indigo-600" />
                        Upload Payment Proof
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                        Please upload your payment proof to activate or renew your subscription.
                        Accepted formats: JPG, PNG. Max size: 10MB.
                    </p>

                    {message.text && (
                        <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <label className="block border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-indigo-400 dark:hover:border-indigo-400 transition-colors bg-slate-50/50 dark:bg-slate-800/50 cursor-pointer relative overflow-hidden">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center pointer-events-none">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="max-h-64 rounded-lg shadow-sm mb-4" />
                                ) : (
                                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                )}
                                <span className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300">
                                    {preview ? 'Change Image' : 'Click to upload image'}
                                </span>
                                <span className="text-sm text-slate-400 dark:text-slate-500 mt-1">or drag and drop here</span>
                            </div>
                        </label>

                        <div className="flex justify-end relative z-10">
                            <button
                                type="submit"
                                disabled={uploading || !proofImage}
                                className={`px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2
                                    ${(uploading || !proofImage) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        Submit Proof
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
