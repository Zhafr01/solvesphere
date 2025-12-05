import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { UserPlus, MessageCircle, Check, X } from 'lucide-react';

export default function PublicProfile() {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [user, setUser] = useState(null);
    const [friendStatus, setFriendStatus] = useState(null); // 'none', 'pending_sent', 'pending_received', 'friends'
    const [loading, setLoading] = useState(true);

    const [friendshipId, setFriendshipId] = useState(null);

    useEffect(() => {
        fetchUserProfile();
    }, [id]);

    const fetchUserProfile = async () => {
        try {
            const { data } = await api.get(`/users/${id}/profile`);
            setUser(data.user);
            setFriendStatus(data.friend_status);
            setFriendshipId(data.friendship_id);
        } catch (error) {
            console.error("Failed to fetch user profile", error);
        } finally {
            setLoading(false);
        }
    };

    const sendFriendRequest = async () => {
        try {
            await api.post('/friends', { friend_id: user.id });
            setFriendStatus('pending_sent');
        } catch (error) {
            console.error("Failed to send friend request", error);
        }
    };

    const handleAccept = async () => {
        try {
            await api.put(`/friends/${friendshipId}`, { status: 'accepted' });
            setFriendStatus('friends');
        } catch (error) {
            console.error("Failed to accept friend request", error);
        }
    };

    const handleReject = async () => {
        try {
            await api.put(`/friends/${friendshipId}`, { status: 'rejected' });
            setFriendStatus('none');
            setFriendshipId(null);
        } catch (error) {
            console.error("Failed to reject friend request", error);
        }
    };

    if (loading) return <div>Loading profile...</div>;
    if (!user) return <div>User not found.</div>;

    return (
        <div className="max-w-3xl mx-auto bg-white shadow-sm sm:rounded-lg p-8">
            <div className="flex flex-col items-center">
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-5xl text-white font-bold mb-4">
                    {user.profile_picture ? (
                        <img src={user.profile_picture} alt={user.name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                        user.name.charAt(0)
                    )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500 capitalize mt-1">{user.role?.replace('_', ' ')}</p>

                {user.bio && (
                    <p className="text-gray-600 mt-4 text-center max-w-lg">{user.bio}</p>
                )}

                <div className="mt-8 flex gap-4">
                    {currentUser?.id !== user.id && (
                        <>
                            {friendStatus === 'none' && (
                                <button
                                    onClick={sendFriendRequest}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Add Friend
                                </button>
                            )}
                            {friendStatus === 'pending_sent' && (
                                <button disabled className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed">
                                    Request Sent
                                </button>
                            )}
                            {friendStatus === 'pending_received' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAccept}
                                        className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                    >
                                        <Check className="h-4 w-4" />
                                        Accept
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        className="btn-secondary flex items-center gap-2 text-red-600 hover:bg-red-50"
                                    >
                                        <X className="h-4 w-4" />
                                        Reject
                                    </button>
                                </div>
                            )}
                            {friendStatus === 'friends' && (
                                <Link to={`/chat/${user.id}`} className="btn-primary flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4" />
                                    Message
                                </Link>
                            )}
                            {/* Allow messaging even if not friends (Open Messaging) */}
                            {friendStatus !== 'friends' && (
                                <Link to={`/chat/${user.id}`} className="btn-secondary flex items-center gap-2 ml-2">
                                    <MessageCircle className="h-4 w-4" />
                                    Message
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center border-t pt-8">
                <div>
                    <span className="block text-2xl font-bold text-gray-900">{user.friends_count || 0}</span>
                    <span className="text-gray-500">Friends</span>
                </div>
                <div>
                    <span className="block text-2xl font-bold text-gray-900">{user.topics_count || 0}</span>
                    <span className="text-gray-500">Topics</span>
                </div>
                <div>
                    <span className="block text-2xl font-bold text-gray-900">{user.comments_count || 0}</span>
                    <span className="text-gray-500">Comments</span>
                </div>
            </div>
        </div>
    );
}
