import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Search, UserPlus, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SocialIndex() {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (searchQuery.trim()) {
            const delayDebounceFn = setTimeout(() => {
                searchUsers();
            }, 500);

            return () => clearTimeout(delayDebounceFn);
        } else {
            setUsers([]);
        }
    }, [searchQuery]);

    const searchUsers = async () => {
        setLoading(true);
        try {
            // Assuming we have an endpoint for searching users. 
            // If not, we might need to create one or use an existing one.
            // Let's use /friends/search as a placeholder or create a new one.
            // Based on previous context, there is a /friends/search endpoint.
            const { data } = await api.get(`/friends/search?query=${searchQuery}`);
            setUsers(data);
        } catch (error) {
            console.error("Failed to search users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMessage = async (userId) => {
        // Navigate to chat with this user
        // We might need to create a conversation first or just navigate to /chat/userId
        navigate(`/chat/${userId}`);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg p-6 transition-colors duration-300">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Find People</h1>

                <div className="relative mb-8">
                    <input
                        type="text"
                        placeholder="Search for users by username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 transition-all"
                    />
                    <div className="absolute left-4 top-3.5 text-gray-400 dark:text-slate-400">
                        <Search className="h-6 w-6" />
                    </div>
                </div>

                {loading && <div className="text-center py-4 text-gray-500 dark:text-slate-400">Searching...</div>}

                {!loading && searchQuery && users.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                        No users found matching "{searchQuery}"
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {users.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <Link to={`/users/${user.id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                                        {user.profile_picture ? (
                                            <img src={user.profile_picture} alt={user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            user.name.charAt(0)
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 capitalize">{user.role.replace('_', ' ')}</p>
                                    </div>
                                </Link>
                            </div>

                            {currentUser.id !== user.id && (
                                <button
                                    onClick={() => handleMessage(user.id)}
                                    className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors"
                                    title="Message"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
