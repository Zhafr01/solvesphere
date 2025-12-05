import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, ThumbsUp, Trash2, ArrowLeft, Reply, Edit2, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CommentItem = ({ comment, onReply, onLike, onDelete, onEdit, user, depth = 0 }) => {
    const isLiked = comment.likes?.some(l => l.id === user?.id);
    const canModify = user?.id === comment.user_id || user?.role === 'super_admin' || user?.role === 'partner_admin';
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
            className={`mt-4 ${depth > 0 ? 'ml-8 border-l-2 border-slate-100 dark:border-slate-700 pl-4' : ''}`}
        >
            <div className="bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg p-4 transition-colors duration-300">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300 font-bold text-sm">
                            {comment.user?.name?.charAt(0)}
                        </div>
                        <div>
                            <span className="font-semibold text-gray-900 dark:text-white text-sm block">{comment.user?.name}</span>
                            <span className="text-xs text-gray-500 dark:text-slate-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    {canModify && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsEditing(!isEditing)} className="text-gray-400 hover:text-indigo-600">
                                <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => onDelete(comment.id)} className="text-gray-400 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleEditSubmit} className="mt-2">
                        <textarea
                            className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                        />
                        <div className="mt-2 flex justify-end gap-2">
                            <button type="button" onClick={() => setIsEditing(false)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                            <button type="submit" className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Save</button>
                        </div>
                    </form>
                ) : (
                    <p className="text-gray-800 dark:text-slate-300 text-sm mb-3 whitespace-pre-wrap">{comment.content}</p>
                )}

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => onLike(comment.id)}
                        className={`flex items-center gap-1 text-sm ${isLiked ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
                    >
                        <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                        {comment.likes_count || 0} Likes
                    </button>
                    <button
                        onClick={() => setIsReplying(!isReplying)}
                        className="flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                    >
                        <Reply className="h-4 w-4" /> Reply
                    </button>
                </div>

                <AnimatePresence>
                    {isReplying && (
                        <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={handleReplySubmit}
                            className="mt-4 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/50 overflow-hidden"
                        >
                            <textarea
                                className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                placeholder="Write a reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                            />
                            <div className="mt-2 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsReplying(false)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                                <button type="submit" className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Reply</button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
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
                        depth={depth + 1}
                    />
                ))}
            </AnimatePresence>
        </motion.div >
    );
};

export default function ForumDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

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

            setTopic({ ...data, comments: rootComments });
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
            // Redirect would be handled by parent or router, but here we might need to navigate back
            window.location.href = '/forum';
        } catch (error) {
            console.error("Failed to delete topic", error);
        }
    };

    if (loading) return <div>Loading topic...</div>;
    if (!topic) return <div>Topic not found.</div>;

    const canModifyTopic = user?.id === topic.user_id || user?.role === 'super_admin' || user?.role === 'partner_admin';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
        >
            <Link to="/forum" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" /> Back to Forum
            </Link>

            {/* Topic Header */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg p-6 transition-colors duration-300"
            >
                <div className="flex justify-between items-start mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{topic.title}</h1>
                    {canModifyTopic && (
                        <button onClick={handleDeleteTopic} className="text-gray-400 hover:text-red-600 p-1">
                            <Trash2 className="h-5 w-5" />
                        </button>
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
                    <p className="whitespace-pre-wrap">{topic.content}</p>
                </div>
                <div className="mt-6 flex items-center gap-4">
                    <button
                        onClick={handleLikeTopic}
                        className={`flex items-center gap-1 text-sm ${topic.is_liked_by_user ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
                    >
                        <ThumbsUp className={`h-5 w-5 ${topic.is_liked_by_user ? 'fill-current' : ''}`} />
                        {topic.likes_count || 0} Likes
                    </button>
                </div>
            </motion.div>

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
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
