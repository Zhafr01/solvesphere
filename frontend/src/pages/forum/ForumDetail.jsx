import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { usePartner } from '../../context/PartnerContext';
import { MessageSquare, ThumbsUp, Trash2, ArrowLeft, Reply, Edit2, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLoader from '../../components/ui/PageLoader';

const CommentItem = ({ comment, onReply, onLike, onDelete, onEdit, user, currentPartner, depth = 0 }) => {
    const isLiked = comment.likes?.some(l => l.id === user?.id);
    const canModify = user?.id === comment.user_id || (user?.role === 'super_admin' && !currentPartner) || (user?.role === 'partner_admin' && user?.partner_id === currentPartner?.id);
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);

    const handleReplySubmit = (e) => {
        e.preventDefault();
        onReply(comment.id, replyContent);
        setIsReplying(false);
        setReplyContent('');
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        onEdit(comment.id, editContent);
        setIsEditing(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-4 ${depth > 0 ? 'ml-4 md:ml-8' : ''}`}
        >
            <div className="bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg p-4 transition-colors duration-300 relative group">
                {/* Thread line for nested comments */}
                {depth > 0 && (
                    <div className="absolute -left-4 md:-left-8 top-6 w-4 md:w-8 h-px bg-slate-200 dark:bg-slate-700" />
                )}

                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300 font-bold text-sm ring-2 ring-white dark:ring-slate-800">
                            {comment.user?.name?.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 dark:text-white text-sm">{comment.user?.name}</span>
                                {comment.user?.role === 'super_admin' && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 uppercase tracking-wider">
                                        {/* If we are on a partner site (currentPartner exists), show "Super Admin" to distinguish.
                                            If we are on main site (!currentPartner), just show "Admin". */}
                                        {currentPartner ? 'Super Admin' : 'Admin'}
                                    </span>
                                )}
                                {comment.user?.role === 'partner_admin' && currentPartner && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30 uppercase tracking-wider">
                                        Admin
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    {canModify && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setIsEditing(!isEditing)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => onDelete(comment.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleEditSubmit} className="mt-2">
                        <textarea
                            className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:outline-none transition-all resize-y min-h-[100px]"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                        />
                        <div className="mt-3 flex justify-end gap-2">
                            <button type="button" onClick={() => setIsEditing(false)} className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-1.5">Cancel</button>
                            <button type="submit" className="text-xs font-medium bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-500/20">Save Changes</button>
                        </div>
                    </form>
                ) : (
                    <div className="pl-13 ml-1">
                        <p className="text-gray-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                    </div>
                )}

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700/50">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onLike(comment.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isLiked ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20' : 'bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 ring-1 ring-transparent hover:ring-gray-200 dark:hover:ring-slate-600'}`}
                    >
                        <motion.div
                            initial={false}
                            animate={isLiked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ThumbsUp className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} />
                        </motion.div>
                        <span>{comment.likes_count || 0}</span>
                    </motion.button>

                    <button
                        onClick={() => setIsReplying(!isReplying)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                    >
                        <Reply className="h-3.5 w-3.5" /> Reply
                    </button>
                </div>

                <AnimatePresence>
                    {isReplying && (
                        <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={handleReplySubmit}
                            className="mt-4 overflow-hidden"
                        >
                            <div className="relative">
                                <textarea
                                    className="w-full p-4 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:outline-none bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-white placeholder-gray-400 transition-all resize-y min-h-[100px]"
                                    placeholder={`Reply to ${comment.user?.name}...`}
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    autoFocus
                                />
                                <div className="absolute bottom-3 right-3 flex gap-2">
                                    <button type="button" onClick={() => setIsReplying(false)} className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-1.5">Cancel</button>
                                    <button type="submit" className="text-xs font-medium bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-500/20">Post Reply</button>
                                </div>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>

            {/* Recursively render replies with container */}
            <div className="border-l-2 border-slate-100 dark:border-slate-700/50 ml-5 md:ml-5 space-y-4">
                <AnimatePresence>
                    {comment.replies?.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            onReply={onReply}
                            onLike={onLike}
                            onDelete={onDelete}
                            onEdit={onEdit}
                            user={user}
                            currentPartner={currentPartner}
                            depth={depth + 1}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </motion.div >
    );
};

export default function ForumDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const { currentPartner } = usePartner();
    const navigate = useNavigate();
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', content: '' });

    useEffect(() => {
        fetchTopic();
    }, [id]);

    const fetchTopic = async () => {
        try {
            const { data } = await api.get(`/forum-topics/${id}`);
            console.log("Fetched topic data:", data);

            // Organize comments into hierarchy
            const commentsMap = {};
            const rootComments = [];

            // Check if comments exist
            const comments = data.comments || [];

            // First pass: create map and initialize replies array
            comments.forEach(c => {
                c.replies = [];
                commentsMap[c.id] = c;
            });

            // Second pass: link children to parents
            comments.forEach(c => {
                if (c.parent_id) {
                    if (commentsMap[c.parent_id]) {
                        commentsMap[c.parent_id].replies.push(c);
                    }
                } else {
                    rootComments.push(c);
                }
            });

            // Sort root comments by likes (descending)
            rootComments.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));



            setTopic({ ...data, comments: rootComments });
            setEditForm({ title: data.title, content: data.content });
        } catch (error) {
            console.error("Failed to fetch topic", error);
            if (error.response) {
                console.error("Error response:", error.response.status, error.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLikeTopic = async () => {
        try {
            const { data } = await api.post(`/forum-topics/${id}/like`);
            setTopic(prev => ({
                ...prev,
                likes_count: data.likes_count,
                is_liked_by_user: data.liked,
            }));
        } catch (error) {
            console.error("Failed to like topic", error);
        }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            await api.post(`/forum-topics/${id}/comments`, { content: newComment });
            fetchTopic();
            setNewComment('');
        } catch (error) {
            console.error("Failed to post comment", error);
            alert("Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (parentId, content) => {
        try {
            await api.post(`/forum-topics/${id}/comments`, { content, parent_id: parentId });
            fetchTopic();
        } catch (error) {
            console.error("Failed to post reply", error);
            alert("Failed to post reply");
        }
    };

    const handleEditComment = async (commentId, content) => {
        try {
            await api.put(`/forum-topics/${id}/comments/${commentId}`, { content });
            fetchTopic();
        } catch (error) {
            console.error("Failed to edit comment", error);
        }
    };

    const handleLikeComment = async (commentId) => {
        try {
            await api.post(`/comments/${commentId}/like`);
            fetchTopic(); // Re-fetch to update all counts and states correctly
        } catch (error) {
            console.error("Failed to like comment", error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;
        try {
            await api.delete(`/forum-topics/${id}/comments/${commentId}`);
            fetchTopic();
        } catch (error) {
            console.error("Failed to delete comment", error);
        }
    };

    const handleDeleteTopic = async () => {
        if (!confirm("Are you sure you want to delete this topic?")) return;
        try {
            await api.delete(`/forum-topics/${id}`);
            // Redirect based on current context
            if (currentPartner) {
                navigate(`/partners/${currentPartner.slug}/forum`);
            } else {
                navigate('/forum');
            }
        } catch (error) {
            console.error("Failed to delete topic", error);
        }
    };


    const handleUpdateTopic = async () => {
        try {
            const { data } = await api.put(`/forum-topics/${id}`, editForm);
            setTopic(prev => ({ ...prev, title: data.topic.title, content: data.topic.content }));
            setIsEditing(false);
            alert("Topic updated successfully");
        } catch (error) {
            console.error("Failed to update topic", error);
            alert("Failed to update topic");
        }
    };

    if (loading) return <PageLoader message="Loading topic..." />;
    if (!topic) return <div>Topic not found.</div>;

    const canModifyTopic = user?.id === topic.user_id || (user?.role === 'super_admin' && !currentPartner) || (user?.role === 'partner_admin' && user?.partner_id === topic.partner_id);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
        >


            {/* Topic Header */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg p-6 transition-colors duration-300"
            >
                <div className="flex justify-between items-start mb-4">
                    {isEditing ? (
                        <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-slate-600 focus:outline-none focus:border-indigo-500 w-full mr-4"
                        />
                    ) : (
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{topic.title}</h1>
                    )}
                    {canModifyTopic && !isEditing && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-indigo-600 p-1">
                                <Edit2 className="h-5 w-5" />
                            </button>
                            <button onClick={handleDeleteTopic} className="text-gray-400 hover:text-red-600 p-1">
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    )}

                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 mb-6">
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300 font-bold">
                        {topic.user?.name?.charAt(0)}
                    </div>
                    <span>{topic.user?.name}</span>
                    <span>•</span>
                    <span>{new Date(topic.created_at).toLocaleDateString()}</span>
                </div>
                <div className="prose max-w-none text-gray-800 dark:text-slate-300 dark:prose-invert">
                    {isEditing ? (
                        <textarea
                            value={editForm.content}
                            onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                            rows="8"
                            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="whitespace-pre-wrap">{topic.content}</p>
                    )}
                </div>
                {isEditing && (
                    <div className="mt-4 flex justify-end gap-2">
                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                        <button onClick={handleUpdateTopic} className="px-4 py-2 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm">Save Changes</button>
                    </div>
                )}
            </motion.div>

            <div className="flex items-center gap-4 px-2">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLikeTopic}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${topic.is_liked_by_user ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm'}`}
                >
                    <motion.div
                        initial={false}
                        animate={topic.is_liked_by_user ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ThumbsUp className={`h-5 w-5 ${topic.is_liked_by_user ? 'fill-current' : ''}`} />
                    </motion.div>
                    <span>{topic.likes_count || 0} Likes</span>
                </motion.button>
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Comments ({topic.comments?.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0) || 0})
                </h3>

                {/* Comment Form */}
                <div className="bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg p-4 transition-colors duration-300">
                    <form onSubmit={handlePostComment}>
                        <textarea
                            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px] bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400"
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <div className="mt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={!newComment.trim() || submitting}
                                className="btn-primary"
                            >
                                {submitting ? 'Posting...' : 'Post Comment'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                    <AnimatePresence>
                        {topic.comments?.map(comment => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                onReply={handleReply}
                                onLike={handleLikeComment}
                                onDelete={handleDeleteComment}
                                onEdit={handleEditComment}
                                user={user}
                                currentPartner={currentPartner}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
