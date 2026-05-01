import { useState, useEffect, useRef } from 'react';
import CommentItem from './CommentItem';
import styles from './CommentSection.module.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function CommentSection({ confessionId, user, onPostComment }) {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [replyTo, setReplyTo] = useState(null);
    const [viewAll, setViewAll] = useState(false);
    const commentsEndRef = useRef(null);

    const fetchComments = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/confessions/${confessionId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (e) {
            console.error('fetchComments:', e);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [confessionId]);

    const scrollToBottom = () => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        setLoading(true);
        try {
            await onPostComment(confessionId, {
                text: text.trim(),
                parentCommentId: replyTo?._id || null
            });
            setText('');
            setReplyTo(null);
            await fetchComments();
            setTimeout(scrollToBottom, 100);
        } catch (e) {
            console.error('handleSubmit comment:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (commentId) => {
        try {
            const res = await fetch(`${API_BASE}/api/comments/${commentId}/like`, {
                method: 'POST',
                credentials: 'include',
            });
            if (res.ok) fetchComments();
        } catch (e) { console.error('Like error:', e); }
    };

    const handleDelete = async (commentId) => {
        try {
            const res = await fetch(`${API_BASE}/api/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (res.ok) fetchComments();
        } catch (e) { console.error('Delete error:', e); }
    };

    const threadComments = () => {
        const root = comments.filter(c => !c.parentCommentId);
        const replies = comments.filter(c => c.parentCommentId);
        return root.map(c => ({
            ...c,
            replies: replies.filter(r => r.parentCommentId === c._id)
        }));
    };

    const threaded = threadComments();
    const displayedComments = viewAll ? threaded : threaded.slice(0, 3);

    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit}>
                {replyTo && (
                    <div className={styles.replyingTo}>
                        <span>Replying to <strong>{replyTo.anonName}</strong></span>
                        <button type="button" onClick={() => setReplyTo(null)} aria-label="Cancel reply">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                )}
                <div className={styles.inputWrap}>
                    <img src={user?.anonAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=guest'} alt="" className={styles.userMiniAvatar} />
                    <input
                        type="text"
                        placeholder={user ? "Add a comment..." : "Sign in to comment"}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={!user || loading}
                        className={styles.input}
                        maxLength={500}
                    />
                    <button type="submit" disabled={!user || loading || !text.trim()} className={styles.sendBtn} title="Post comment">
                        {loading ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        )}
                    </button>
                </div>
            </form>

            <div className={styles.list}>
                {displayedComments.map(comment => (
                    <CommentItem
                        key={comment._id}
                        comment={comment}
                        user={user}
                        onReply={setReplyTo}
                        onLike={handleLike}
                        onDelete={handleDelete}
                    />
                ))}

                {threaded.length > 3 && !viewAll && (
                    <button className={styles.viewMore} onClick={() => setViewAll(true)}>
                        View {threaded.length - 3} more comment{threaded.length - 3 > 1 ? 's' : ''}
                    </button>
                )}

                <div ref={commentsEndRef} />
            </div>

            {comments.length === 0 && (
                <div className={styles.empty}>
                    No comments yet. Be the first! ✨
                </div>
            )}
        </div>
    );
}
