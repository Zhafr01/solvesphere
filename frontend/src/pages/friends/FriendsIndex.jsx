import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, UserCheck, UserX, Search, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FriendsIndex() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('friends');
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFriendsData();
    }, []);

    const fetchFriendsData = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/friends');
            setFriends(data.friends);
            setPendingRequests(data.pending_requests);
            setSentRequests(data.sent_requests);
        } catch (error) {
            console.error("Failed to fetch friends", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            const { data } = await api.get(`/friends/search?query=${searchQuery}`);
            setSearchResults(data);
        } catch (error) {
            console.error("Failed to search users", error);
        }
    };

    const sendFriendRequest = async (friendId) => {
        try {
            await api.post('/friends', { friend_id: friendId });
            alert('Friend request sent!');
            fetchFriendsData();
            // Update search results locally to reflect change
            setSearchResults(searchResults.map(u =>
                u.id === friendId ? { ...u, friendship_status: 'pending', is_sender: true } : u
            ));
        } catch (error) {
            console.error("Failed to send request", error);
            alert(error.response?.data?.message || 'Failed to send request');
        }
    };

    const respondToRequest = async (friendshipId, status) => {
        try {
            await api.put(`/friends/${friendshipId}`, { status });
            fetchFriendsData();
        } catch (error) {
            console.error(`Failed to ${status} request`, error);
        }
    };

    const unfriend = async (friendshipId) => {
        if (!confirm("Are you sure you want to remove this friend?")) return;
        try {
            await api.delete(`/friends/${friendshipId}`);
            fetchFriendsData();
        } catch (error) {
            console.error("Failed to unfriend", error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white shadow-sm sm:rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Friends & Connections</h1>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        className={`pb-4 px-4 font-medium text-sm transition-colors ${activeTab === 'friends' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('friends')}
                    >
                        My Friends ({friends.length})
                    </button>
                    <button
                        className={`pb-4 px-4 font-medium text-sm transition-colors ${activeTab === 'pending' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending Requests ({pendingRequests.length})
                    </button>
                    <button
                        className={`pb-4 px-4 font-medium text-sm transition-colors ${activeTab === 'find' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('find')}
                    >
                        Find Friends
                    </button>
                </div>

                {/* Content */}
                <div className="min-h-[300px]">
                    {loading && activeTab !== 'find' ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'friends' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {friends.length > 0 ? (
                                        friends.map(friend => (
                                            <div key={friend.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                        {friend.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{friend.name}</h3>
                                                        <p className="text-sm text-gray-500">{friend.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Link to={`/chat/${friend.id}`} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full">
                                                        <MessageCircle className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => unfriend(friend.friendship_id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                                                        title="Unfriend"
                                                    >
                                                        <UserX className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 col-span-2 text-center py-10">You haven't added any friends yet.</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'pending' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Received Requests</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {pendingRequests.length > 0 ? (
                                                pendingRequests.map(req => (
                                                    <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg bg-indigo-50/50">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                                {req.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900">{req.name}</h3>
                                                                <p className="text-xs text-gray-500">Sent {new Date(req.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => respondToRequest(req.friendship_id, 'accepted')}
                                                                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={() => respondToRequest(req.friendship_id, 'rejected')}
                                                                className="px-3 py-1 bg-white border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 col-span-2 text-sm italic">No pending requests received.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Sent Requests</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {sentRequests.length > 0 ? (
                                                sentRequests.map(req => (
                                                    <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                                                                {req.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900">{req.name}</h3>
                                                                <p className="text-xs text-gray-500">Sent {new Date(req.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">Pending</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 col-span-2 text-sm italic">No pending requests sent.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'find' && (
                                <div className="space-y-6">
                                    <form onSubmit={handleSearch} className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search users by name..."
                                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <button type="submit" className="btn-primary">Search</button>
                                    </form>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {searchResults.map(result => (
                                            <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                        {result.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{result.name}</h3>
                                                        <p className="text-sm text-gray-500">{result.email}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    {result.friendship_status === 'accepted' ? (
                                                        <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                                                            <UserCheck className="h-4 w-4" /> Friend
                                                        </span>
                                                    ) : result.friendship_status === 'pending' ? (
                                                        <span className="text-yellow-600 text-sm font-medium">
                                                            {result.is_sender ? 'Request Sent' : 'Request Received'}
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => sendFriendRequest(result.id)}
                                                            className="btn-secondary text-sm py-1 px-3 flex items-center gap-1"
                                                        >
                                                            <UserPlus className="h-4 w-4" /> Add
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {searchResults.length === 0 && searchQuery && (
                                            <p className="text-gray-500 col-span-2 text-center">No users found.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
