import { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function PartnersIndex() {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const { data } = await api.get('/super-admin/partners');
            setPartners(data.data);
        } catch (error) {
            console.error("Failed to fetch partners", error);
        } finally {
            setLoading(false);
        }
    };

    const [selectedImage, setSelectedImage] = useState(null);

    const handleApprove = async (id) => {
        if (!confirm('Are you sure you want to approve this partner?')) return;
        try {
            await api.post(`/super-admin/partners/${id}/approve`);
            fetchPartners(); // Refresh list
        } catch (error) {
            console.error("Failed to approve partner", error);
            alert('Failed to approve partner');
        }
    };

    const handleReject = async (id) => {
        if (!confirm('Are you sure you want to reject this partner application? This will delete the application.')) return;
        try {
            await api.post(`/super-admin/partners/${id}/reject`);
            fetchPartners(); // Refresh list
        } catch (error) {
            console.error("Failed to reject partner", error);
            alert('Failed to reject partner');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this partner?')) return;
        try {
            await api.delete(`/super-admin/partners/${id}`);
            fetchPartners(); // Refresh list
        } catch (error) {
            console.error("Failed to delete partner", error);
            alert('Failed to delete partner');
        }
    };

    const handleSuspend = async (id) => {
        if (!confirm('Are you sure you want to suspend this partner? This will make their site inaccessible.')) return;
        try {
            await api.post(`/super-admin/partners/${id}/suspend`);
            fetchPartners(); // Refresh list
        } catch (error) {
            console.error("Failed to suspend partner", error);
            alert('Failed to suspend partner');
        }
    };

    const handleActivate = async (id) => {
        if (!confirm('Are you sure you want to activate (unsuspend) this partner?')) return;
        try {
            await api.post(`/super-admin/partners/${id}/activate`);
            fetchPartners(); // Refresh list
        } catch (error) {
            console.error("Failed to activate partner", error);
            alert('Failed to activate partner');
        }
    };

    const handleSubscriptionUpdate = async (partnerId, status) => {
        if (!confirm(`Are you sure you want to mark this subscription as ${status}?`)) return;
        try {
            await api.post(`/super-admin/partners/${partnerId}/subscription`, { status });
            fetchPartners();
        } catch (error) {
            console.error("Failed to update subscription", error);
            alert('Failed to update subscription');
        }
    };

    const filteredPartners = partners.filter(partner =>
        activeTab === 'active' ? (partner.status === 'active' || partner.status === 'approved' || partner.status === 'inactive') : partner.status === 'pending'
    );

    if (loading) return <div>Loading partners...</div>;

    return (
        <div className="bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg p-6 transition-colors duration-300 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Partners</h1>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-200 dark:border-slate-700 mb-6">
                <button
                    className={`pb-2 px-4 font-medium text-sm transition-colors ${activeTab === 'active' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
                    onClick={() => setActiveTab('active')}
                >
                    Active Partners
                </button>
                <button
                    className={`pb-2 px-4 font-medium text-sm transition-colors ${activeTab === 'pending' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending Applications
                    {partners.filter(p => p.status === 'pending').length > 0 && (
                        <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                            {partners.filter(p => p.status === 'pending').length}
                        </span>
                    )}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Logo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Domain</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subscription</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {filteredPartners.length > 0 ? (
                            filteredPartners.map((partner) => (
                                <tr key={partner.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {partner.logo && (
                                            <img
                                                src={partner.logo.startsWith('http') ? partner.logo : `http://localhost:8000/storage/${partner.logo}`}
                                                alt={partner.name}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{partner.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{partner.domain}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${(partner.status === 'active' || partner.status === 'approved') ? 'bg-green-100 text-green-800' :
                                                partner.status === 'inactive' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {partner.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {partner.latest_subscription ? (
                                            <div className="flex flex-col space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${partner.latest_subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            partner.latest_subscription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                        {partner.latest_subscription.status}
                                                    </span>
                                                    {partner.latest_subscription.proof_image && (
                                                        <button
                                                            onClick={() => setSelectedImage(`http://localhost:8000/storage/${partner.latest_subscription.proof_image}`)}
                                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs hover:underline flex items-center"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            View Proof
                                                        </button>
                                                    )}
                                                </div>
                                                {partner.latest_subscription.status === 'pending' && (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleSubscriptionUpdate(partner.id, 'active')}
                                                            className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded border border-green-200 dark:border-green-800 text-xs hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleSubscriptionUpdate(partner.id, 'rejected')}
                                                            className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded border border-red-200 dark:border-red-800 text-xs hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs">No Record</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {partner.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(partner.id)}
                                                    className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(partner.id)}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {(partner.status === 'active' || partner.status === 'approved') && (
                                            <>
                                                {partner.website && (
                                                    <a
                                                        href={partner.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                                    >
                                                        Visit
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => handleSuspend(partner.id)}
                                                    className="text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300"
                                                >
                                                    Suspend
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(partner.id)}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                        {/* Show activate button if inactive */}
                                        {partner.status === 'inactive' && (
                                            <>
                                                <button
                                                    onClick={() => handleActivate(partner.id)}
                                                    className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                                                >
                                                    Activate
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(partner.id)}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-slate-400">No partners found in this category.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Image Modal */}
            {
                selectedImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4" onClick={() => setSelectedImage(null)}>
                        <div className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>
                            <button
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 bg-white rounded-full p-1"
                                onClick={() => setSelectedImage(null)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <img src={selectedImage} alt="Payment Proof" className="max-w-full max-h-[80vh] object-contain" />
                        </div>
                    </div>
                )
            }
        </div >
    );
}
