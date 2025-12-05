import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Send, Search, MoreVertical, MessageCircle, Image, X, Smile, CheckCheck } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

export default function ChatIndex() {
    const { user } = useAuth();
    const { id: userId } = useParams(); // Optional: open chat with specific user
    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [fetchingUser, setFetchingUser] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [highlightedMessageId, setHighlightedMessageId] = useState(null);

    const messagesEndRef = useRef(null);
    const pollInterval = useRef(null);
    const activeChatRef = useRef(null);
    const fileInputRef = useRef(null);

    // Keep ref in sync with state
    useEffect(() => {
        activeChatRef.current = activeChat;
    }, [activeChat]);

    useEffect(() => {
        fetchConversations();
        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Scroll to highlighted message
    // Scroll to highlighted message or bottom
    const scrollContainerRef = useRef(null);
    const isAtBottom = useRef(true);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

    // Handle scroll events to track if user is at bottom
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            // Use a smaller threshold to avoid false positives when user scrolls up slightly
            const atBottom = scrollHeight - scrollTop - clientHeight < 50;
            isAtBottom.current = atBottom;
            // console.log("Scroll:", { scrollTop, scrollHeight, clientHeight, atBottom });
        }
    };

    // Scroll to highlighted message or bottom
    useEffect(() => {
        if (highlightedMessageId && messages.length > 0) {
            const element = document.getElementById(`message-${highlightedMessageId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-2');
                setTimeout(() => {
                    element.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2');
                    setHighlightedMessageId(null);
                }, 2000);
            }
        } else if (scrollContainerRef.current && !highlightedMessageId) {
            // Scroll if we are at bottom or if it's the first load/send (shouldScrollToBottom)
            if (isAtBottom.current || shouldScrollToBottom) {
                const { scrollHeight, clientHeight } = scrollContainerRef.current;
                scrollContainerRef.current.scrollTo({
                    top: scrollHeight - clientHeight,
                    behavior: 'smooth'
                });
                if (shouldScrollToBottom) setShouldScrollToBottom(false);
            }
        }
    }, [messages, highlightedMessageId, user.id, shouldScrollToBottom]);

    // Reset scroll state when changing chat
    useEffect(() => {
        setShouldScrollToBottom(true);
        isAtBottom.current = true;
    }, [activeChat?.id]);

    useEffect(() => {
        if (userId) {
            const targetId = parseInt(userId);

            // First check if we already have the user in our conversations list
            const targetUser = conversations.find(u => u.id === targetId);

            if (targetUser) {
                setActiveChat(targetUser);
            } else {
                // If not found, we need to fetch the user details
                // We only fetch if we're not already fetching and if the current active chat isn't already this user
                if (!fetchingUser && activeChat?.id !== targetId) {
                    setFetchingUser(true);
                    api.get(`/users/${userId}/profile`)
                        .then(({ data }) => {
                            const newUser = {
                                id: data.user.id,
                                name: data.user.name,
                                profile_picture: data.user.profile_picture,
                                unread_count: 0
                            };

                            // Add to conversations if not present
                            setConversations(prev => {
                                if (prev.find(u => u.id === newUser.id)) return prev;
                                return [newUser, ...prev];
                            });

                            // Set as active chat
                            setActiveChat(newUser);
                        })
                        .catch(err => {
                            console.error("Failed to fetch user for chat", err);
                            // If user not found, maybe redirect to main chat?
                            // navigate('/chat');
                        })
                        .finally(() => {
                            setFetchingUser(false);
                        });
                }
            }
        } else {
            // If no userId in URL, clear active chat
            setActiveChat(null);
        }
    }, [userId, conversations]);

    useEffect(() => {
        if (activeChat) {
            fetchMessages(activeChat.id);
            // Poll for new messages
            pollInterval.current = setInterval(() => {
                fetchMessages(activeChat.id, true);
            }, 3000);
        }

        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, [activeChat]);

    const fetchConversations = async () => {
        try {
            const { data } = await api.get('/chat');
            setConversations(prev => {
                // If we have an active chat (or one in ref) that is NOT in the new data, we should keep it
                // This prevents the active chat from disappearing when the list refreshes
                const currentActive = activeChatRef.current;
                if (currentActive && !data.find(c => c.id === currentActive.id)) {
                    return [currentActive, ...data];
                }
                return data;
            });
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (otherUserId, isPolling = false) => {
        try {
            const { data } = await api.get(`/chat/${otherUserId}`);
            // Only update if there are new messages to avoid flicker or if not polling
            setMessages(prev => {
                // If polling, check if data is exactly the same
                if (isPolling && JSON.stringify(prev) === JSON.stringify(data)) {
                    return prev;
                }
                return data;
            });

            // Update unread count in conversation list locally
            if (!isPolling) {
                setConversations(prev => prev.map(c =>
                    c.id === otherUserId ? { ...c, unread_count: 0 } : c
                ));
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    const handleSearch = async () => {
        try {
            console.log("Searching for:", searchQuery);
            const { data } = await api.get('/chat/search', {
                params: { query: searchQuery }
            });
            console.log("Search results:", data);
            setSearchResults(data);
        } catch (error) {
            console.error("Failed to search messages", error);
        }
    };

    const handleSelectSearchResult = (result) => {
        // Find the user in conversations or create a temporary user object
        // The result.other_user contains the user info we need
        const targetUser = {
            id: result.other_user.id,
            name: result.other_user.name,
            profile_picture: result.other_user.profile_picture,
            unread_count: 0 // Assumed 0 as we are opening it
        };

        setActiveChat(targetUser);
        setHighlightedMessageId(result.id);
        setSearchQuery(''); // Clear search query to show conversation list
        setSearchResults([]);
        navigate(`/chat/${targetUser.id}`);
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setNewMessage(prev => prev + emojiObject.emoji);
    };

    const isSingleEmoji = (text) => {
        if (!text) return false;
        const cleanText = text.trim();
        // Check if it contains any alphanumeric characters
        if (/[a-zA-Z0-9]/.test(cleanText)) return false;

        // Check if it looks like emoji(s) - simplified check
        // If it has no letters/numbers and is short, and has at least one non-ascii char (likely emoji)
        // This is a heuristic but might be more reliable than complex regex for now
        const hasNonAscii = /[^\x00-\x7F]/.test(cleanText);
        return hasNonAscii && [...cleanText].length <= 6;
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedImage) || !activeChat) return;

        setSending(true);
        try {
            const formData = new FormData();
            if (newMessage.trim()) formData.append('message', newMessage);
            if (selectedImage) formData.append('image', selectedImage);

            const { data } = await api.post(`/chat/${activeChat.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShouldScrollToBottom(true); // Force scroll to bottom when sending
            setMessages([...messages, data.data]);
            setNewMessage('');
            setSelectedImage(null);
            setPreviewUrl(null);
            setShowEmojiPicker(false);

            // Update conversation list with last message
            setConversations(prev => {
                const updated = prev.map(c =>
                    c.id === activeChat.id ? { ...c, last_message: data.data } : c
                );
                // Move active chat to top
                return updated.sort((a, b) => {
                    if (a.id === activeChat.id) return -1;
                    if (b.id === activeChat.id) return 1;
                    return 0;
                });
            });
        } catch (error) {
            console.error("Failed to send message", error);
            alert("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const handleSelectChat = (chatUser) => {
        setActiveChat(chatUser);
        navigate(`/chat/${chatUser.id}`);
    };

    if (loading) return <div className="flex justify-center items-center h-[calc(100vh-100px)]">Loading chat...</div>;

    return (
        <div className="bg-white dark:bg-slate-900 shadow-sm sm:rounded-lg h-[calc(100vh-120px)] overflow-hidden flex">
            {/* Sidebar - Conversation List */}
            <div className={`w-full md:w-1/3 border-r border-gray-200 dark:border-slate-700 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-slate-800 border-transparent rounded-lg focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {searchQuery ? (
                        searchResults.length > 0 ? (
                            searchResults.map(result => (
                                <div
                                    key={result.id}
                                    onClick={() => handleSelectSearchResult(result)}
                                    className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border-b border-gray-100 dark:border-slate-800 last:border-0"
                                >
                                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300 font-bold text-sm flex-shrink-0">
                                        {result.other_user.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                                                {result.other_user.name}
                                            </h3>
                                            <span className="text-xs text-gray-500 dark:text-slate-400">
                                                {new Date(result.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2">
                                            <span className="bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">
                                                {result.message}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500 dark:text-slate-400">
                                <p>No messages found.</p>
                            </div>
                        )
                    ) : (
                        conversations.length > 0 ? (
                            conversations.map(conv => (
                                <div
                                    key={conv.id}
                                    onClick={() => handleSelectChat(conv)}
                                    className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${activeChat?.id === conv.id ? 'bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-50 dark:hover:bg-indigo-900/30' : ''}`}
                                >
                                    <div className="relative">
                                        <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300 font-bold text-lg">
                                            {conv.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className={`font-semibold truncate ${activeChat?.id === conv.id ? 'text-indigo-900 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                                                {conv.name}
                                            </h3>
                                            {conv.last_message && (
                                                <span className="text-xs text-gray-500 dark:text-slate-400">
                                                    {new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className={`text-sm truncate ${conv.unread_count > 0 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400'}`}>
                                                {conv.last_message
                                                    ? (conv.last_message.message || (conv.last_message.attachment ? '📷 Image' : ''))
                                                    : 'Start a conversation'}
                                            </p>
                                            {conv.unread_count > 0 && (
                                                <span className="ml-2 bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                    {conv.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500 dark:text-slate-400">
                                <p>No conversations yet.</p>
                                <p className="text-sm mt-2">Find friends to start chatting!</p>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`w-full md:w-2/3 flex flex-col ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
                {activeChat ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-3">
                                <button
                                    className="md:hidden p-2 -ml-2 text-gray-600 dark:text-slate-300"
                                    onClick={() => setActiveChat(null)}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                </button>
                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                    {activeChat.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{activeChat.name}</h3>

                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                                <MoreVertical className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-950"
                        >
                            {messages.map((msg, index) => {
                                const isMe = msg.sender_id === user.id;
                                return (
                                    <div key={msg.id || index} id={`message-${msg.id}`} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${isMe
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-bl-none'
                                            }`}>
                                            {msg.attachment && (
                                                <div className="mb-2">
                                                    <img
                                                        src={msg.attachment.startsWith('http') ? msg.attachment : `http://localhost:8000/storage/${msg.attachment}`}
                                                        alt="Attachment"
                                                        className="rounded-lg max-w-full h-auto max-h-64 object-cover"
                                                    />
                                                </div>
                                            )}
                                            {msg.message && (
                                                <p className={isSingleEmoji(msg.message) ? 'text-4xl leading-relaxed' : 'text-sm'}>
                                                    {msg.message}
                                                </p>
                                            )}
                                            <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400 dark:text-slate-500'}`}>
                                                <p className="text-[10px]">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                {isMe && (
                                                    <CheckCheck className={`h-4 w-4 ${msg.is_read ? 'text-blue-300' : 'text-indigo-300/70'}`} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 relative">
                            {showEmojiPicker && (
                                <div className="absolute bottom-20 left-4 z-10">
                                    <EmojiPicker onEmojiClick={handleEmojiClick} theme="auto" />
                                </div>
                            )}
                            {previewUrl && (
                                <div className="mb-4 relative inline-block">
                                    <img src={previewUrl} alt="Preview" className="h-32 w-auto rounded-lg border border-gray-200 dark:border-slate-700" />
                                    <button
                                        onClick={() => {
                                            setSelectedImage(null);
                                            setPreviewUrl(null);
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                            <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImageSelect}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="p-3 text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                                >
                                    <Smile className="h-6 w-6" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                                >
                                    <Image className="h-6 w-6" />
                                </button>
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-1 input-field"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onClick={() => setShowEmojiPicker(false)}
                                />
                                <button
                                    type="submit"
                                    disabled={(!newMessage.trim() && !selectedImage) || sending}
                                    className="btn-primary p-3 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-950">
                        <div className="w-24 h-24 bg-gray-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle className="h-12 w-12 text-gray-400 dark:text-slate-600" />
                        </div>
                        <p className="text-lg font-medium">Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
