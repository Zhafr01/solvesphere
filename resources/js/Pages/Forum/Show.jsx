import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Show({ auth, forumTopic }) {
    const { data, setData, post, processing, reset } = useForm({
        content: '',
    });

    const submitComment = (e) => {
        e.preventDefault();
        post(route('forum-topics.comments.store', forumTopic.id), {
            onSuccess: () => reset('content'),
        });
    };

    const isAuthor = auth.user.id === forumTopic.user_id;
    const isRecent = (new Date() - new Date(forumTopic.created_at)) / 60000 < 15;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">{forumTopic.title}</h2>}
        >
            <Head title={forumTopic.title} />

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                            {forumTopic.title}
                        </h2>
                        {isAuthor && isRecent && (
                            <div className="flex space-x-2">
                                <Link href={route('forum-topics.edit', forumTopic.id)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    Edit
                                </Link>
                                <Link href={route('forum-topics.destroy', forumTopic.id)} method="delete" as="button" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                    Delete
                                </Link>
                            </div>
                        )}
                    </div>
                    <div className="flex items-start mt-4">
                        <img
                            src={forumTopic.user?.profile_picture ? (forumTopic.user.profile_picture.startsWith('http') || forumTopic.user.profile_picture.startsWith('data:') ? forumTopic.user.profile_picture : `/storage/${forumTopic.user.profile_picture}`) : `https://i.pravatar.cc/50?u=${forumTopic.user_id}`}
                            alt={forumTopic.user?.name || 'Unknown User'}
                            className="h-12 w-12 rounded-full mr-4 object-cover"
                        />
                        <div className="flex-1">
                            <div className="prose dark:prose-invert max-w-none mt-2" dangerouslySetInnerHTML={{ __html: forumTopic.content }}></div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">By <span className="text-blue-500 hover:underline">{forumTopic.user?.name || 'Unknown User'}</span>
                                {forumTopic.user?.role === 'admin' && (
                                    <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        Admin
                                    </span>
                                )}
                                on {new Date(forumTopic.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Comments</h3>
                {forumTopic.comments.map((comment) => (
                    <div key={comment.id} className={`bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mt-4 ${comment.id === forumTopic.best_answer_id ? 'border-2 border-green-500' : ''}`}>
                        <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-start">
                                <img
                                    src={comment.user?.profile_picture ? (comment.user.profile_picture.startsWith('http') || comment.user.profile_picture.startsWith('data:') ? comment.user.profile_picture : `/storage/${comment.user.profile_picture}`) : `https://i.pravatar.cc/50?u=${comment.user_id}`}
                                    alt={comment.user?.name || 'Unknown User'}
                                    className="h-10 w-10 rounded-full mr-4 object-cover"
                                />
                                <div className="flex-1">
                                    <div className="prose dark:prose-invert max-w-none mt-2" dangerouslySetInnerHTML={{ __html: comment.content }}></div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">By <span className="text-blue-500 hover:underline">{comment.user?.name || 'Unknown User'}</span>
                                        {comment.user?.role === 'admin' && (
                                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                Admin
                                            </span>
                                        )}
                                        on {new Date(comment.created_at).toLocaleDateString()}</p>

                                    <div className="flex items-center mt-4">
                                        <Link href={route('comments.like', comment.id)} method="post" as="button" className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                            <svg className={`h-5 w-5 ${comment.likes.some(u => u.id === auth.user.id) ? 'text-blue-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017a2 2 0 01-1.99-1.938l-1.333-6.665A2 2 0 0110 9.42V6a2 2 0 012-2h2a2 2 0 012 2v4z" />
                                            </svg>
                                            <span className="ml-1">{comment.likes.length}</span>
                                        </Link>
                                    </div>
                                </div>
                                {comment.id === forumTopic.best_answer_id && (
                                    <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Best Answer
                                    </span>
                                )}
                            </div>
                            {!forumTopic.best_answer_id && (auth.user.id === forumTopic.user_id || auth.user.role === 'partner_admin' || auth.user.role === 'super_admin') && (
                                <Link href={route('forum-topics.best-answer', [forumTopic.id, comment.id])} method="post" as="button" className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                                    Mark as Best Answer
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <form onSubmit={submitComment}>
                    <div className="mb-4">
                        <label htmlFor="content" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Add a comment</label>
                        <textarea
                            name="content"
                            id="content"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                        ></textarea>
                    </div>
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" disabled={processing}>
                        Submit
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
