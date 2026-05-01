import { useState, useRef, useEffect } from 'react';
import CommentSection from './CommentSection';
import styles from './ConfessionCard.module.css';

const API_BASE = import.meta.env.VITE_API_URL || '';
const DEFAULT_REACTIONS = ['❤️', '😂', '😢', '🔥', '😮'];

const MOOD_LABELS = {
    'Relationship': '❤️ Crush',
    'Friends': '🔥 Hot take',
    'Personal Thoughts': '💔 Secret',
    'Family': '👨‍👩‍👧 Family',
    'Study': '📚 Study',
    'Career': '💼 Career',
    'Mental Health': '🧠 Mental Health',
    'College': '🎓 College',
    'Feelings': '😌 Feelings',
    'Others': '💬 Others',
};

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function ConfessionCard({ confession, user, onReact, onBookmark, onPostComment, onUpdate, onDelete, onVote, onPostReply, addToast, isInbox = false }) {
    const [showComments, setShowComments] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const pickerRef = useRef(null);

    // Secret Code & Reply Management
    const [isEditing, setIsEditing] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [editText, setEditText] = useState(confession.text);
    const [replyText, setReplyText] = useState('');
    const [showPrompt, setShowPrompt] = useState(false);
    const [promptType, setPromptType] = useState(null); // 'edit' or 'delete'
    const [promptCode, setPromptCode] = useState('');
    const [promptError, setPromptError] = useState('');
    const [busy, setBusy] = useState(false);
    const [confirmDeleteInbox, setConfirmDeleteInbox] = useState(false);

    // Close emoji picker on outside click
    useEffect(() => {
        if (!showEmojiPicker) return;
        const handleOutside = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [showEmojiPicker]);

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !onPostReply) return;
        setBusy(true);
        try {
            await onPostReply(confession._id, replyText);
            setIsReplying(false);
            setReplyText('');
            addToast('Reply posted publicly! 🚀');
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setBusy(false);
        }
    };

    const reactionsMap = confession.reactions || {};

    // Sort and get top reactions
    const sortedReactions = Object.entries(reactionsMap)
        .filter(([_, users]) => users.length > 0)
        .sort((a, b) => b[1].length - a[1].length);

    const topReactions = sortedReactions.slice(0, 3);

    const getUserReactionsCount = (emoji) => {
        if (!user || !emoji) return 0;
        return (reactionsMap[emoji] || []).filter(id => id === user._id).length;
    };

    const currentReaction = Object.entries(reactionsMap).find(([_, users]) => users.includes(user?._id))?.[0];

    const handleVote = async (optionIndex) => {
        if (!user || !onVote) return;
        await onVote(confession._id, optionIndex);
    };

    const handleReaction = (emoji) => {
        if (!user) return;
        const count = getUserReactionsCount(emoji);
        if (count < 10) {
            onReact(confession._id, emoji);
        }
        setShowEmojiPicker(false);
    };

    const handlePromptSubmit = async (e) => {
        e.preventDefault();
        if (promptType === 'edit' && editText.trim().length < 5) return;
        setBusy(true);
        setPromptError('');
        try {
            if (promptType === 'delete') {
                await onDelete(confession._id, promptCode);
                setShowPrompt(false);
                setPromptCode('');
            } else if (promptType === 'edit') {
                await onUpdate(confession._id, { text: editText.trim(), secretCode: promptCode });
                setIsEditing(false);
                setShowPrompt(false);
                setPromptCode('');
            }
        } catch (err) {
            setPromptError(err.message || 'Incorrect code. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    const startEdit = () => {
        setEditText(confession.text);
        setPromptType('edit');
        setIsEditing(true);
        setShowPrompt(true);
    };

    const cancelPrompt = () => {
        setShowPrompt(false);
        setPromptCode('');
        if (isEditing) {
            setIsEditing(false);
            setEditText(confession.text);
        }
    };

    const handleShare = () => {
        const shareUrl = `${window.location.origin}/?share=${confession._id}`;
        navigator.clipboard.writeText(shareUrl);
        if (addToast) addToast('Link copied to clipboard! 🔗');
    };

    return (
        <article className={`glass ${styles.card} ${confession.isReplied ? styles.repliedCard : ''} slide-up`}>
            <div className={styles.header}>
                <div className={styles.userInfo}>
                    <div className={styles.avatarWrapper}>
                        <img src={confession.anonAvatar} alt="Anon" className={styles.avatar} />
                    </div>
                    <div className={styles.userMeta}>
                        <h4 className={styles.anonName}>{confession.anonName}</h4>
                        <span className={styles.time}>{timeAgo(confession.createdAt)}</span>
                    </div>
                </div>
                <div className={`${styles.moodTag} mood-${confession.mood?.toLowerCase().replace(/ /g, '-')}`}>
                    {MOOD_LABELS[confession.mood] || confession.mood}
                </div>
                {confession.recipientId && (
                    <div className={styles.privateBadge}>🤫 Private</div>
                )}
            </div>

            {isEditing ? (
                <textarea
                    className={styles.editArea}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={4}
                />
            ) : (
                <p className={styles.text}>{confession.text}</p>
            )}

            {confession.recipientReply && (
                <div className={styles.replyBox}>
                    <div className={styles.replyHeader}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        Official Reply
                    </div>
                    <p className={styles.replyText}>{confession.recipientReply}</p>
                </div>
            )}

            {isReplying && (
                <form className={styles.replyForm} onSubmit={handleReplySubmit}>
                    <textarea
                        className={styles.replyArea}
                        placeholder="Write a public reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        required
                        autoFocus
                    />
                    <div className={styles.replyActions}>
                        <button type="button" className="btn btn-ghost btn-xs" onClick={() => setIsReplying(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-xs" disabled={busy || !replyText.trim()}>
                            {busy ? 'Posting...' : 'Post Reply'}
                        </button>
                    </div>
                </form>
            )}

            {/* ─── Inbox Actions: Reply & Delete (only for the recipient) ─── */}
            {isInbox && user?._id === confession.recipientId?.toString() && (
                <div className={styles.inboxActions}>
                    {!confession.isReplied && !isReplying && (
                        <button
                            className={`${styles.inboxBtn} ${styles.replyInboxBtn}`}
                            onClick={() => setIsReplying(true)}
                            title="Reply publicly"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                            Reply Publicly
                        </button>
                    )}
                    {confession.isReplied && (
                        <span className={styles.repliedBadge}>✅ Replied &amp; Published</span>
                    )}
                    {!confirmDeleteInbox ? (
                        <button
                            className={`${styles.inboxBtn} ${styles.deleteInboxBtn}`}
                            onClick={() => setConfirmDeleteInbox(true)}
                            title="Delete this message"
                            disabled={busy}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Delete
                        </button>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Sure?</span>
                            <button className={`${styles.inboxBtn} ${styles.deleteInboxBtn}`} onClick={() => { onDelete(confession._id, 'skip-code'); setBusy(true); }} disabled={busy}>
                                {busy ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                            <button className={`${styles.inboxBtn}`} style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid var(--border)' }} onClick={() => setConfirmDeleteInbox(false)}>Cancel</button>
                        </div>
                    )}
                </div>
            )}

            {confession.poll?.options?.length > 0 && !isInbox && (
                <div className={styles.poll}>
                    <p className={styles.pollQuestion}>{confession.poll.question}</p>
                    <div className={styles.pollGrid}>
                        {confession.poll.options.map((opt, i) => {
                            const hasVoted = user && opt.votes.includes(user._id);
                            const totalVotes = confession.poll.options.reduce((acc, curr) => acc + curr.votes.length, 0);
                            const percent = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;

                            return (
                                <button
                                    key={i}
                                    type="button"
                                    className={`${styles.pollOption} ${hasVoted ? styles.voted : ''}`}
                                    onClick={() => handleVote(i)}
                                    disabled={!user}
                                >
                                    <div className={styles.pollBg} style={{ width: `${percent}%` }} />
                                    <span className={styles.optText}>{opt.text}</span>
                                    <span className={styles.optPercent}>{percent}%</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {!isInbox && (
                <div className={styles.footer}>
                    <div className={styles.engagement}>
                        <div className={styles.reactionContainer}>
                            {topReactions.map(([emoji, users]) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    className={`${styles.miniReact} ${currentReaction === emoji ? styles.activeReact : ''} ${getUserReactionsCount(emoji) >= 10 ? styles.maxed : ''}`}
                                    onClick={() => handleReaction(emoji)}
                                    disabled={!user}
                                    title={getUserReactionsCount(emoji) > 0 ? `${getUserReactionsCount(emoji)}/10 likes` : 'React'}
                                >
                                    {emoji} <span className={styles.miniCount}>{users.length}</span>
                                    {getUserReactionsCount(emoji) > 0 && (
                                        <span className={styles.userBadge}>{getUserReactionsCount(emoji)}</span>
                                    )}
                                </button>
                            ))}

                            <div className={styles.pickerWrapper} ref={pickerRef}>
                                <button
                                    className={styles.addReact}
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    disabled={!user}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                                </button>

                                {showEmojiPicker && (
                                    <div className={`glass ${styles.pickerPopup}`}>
                                        {DEFAULT_REACTIONS.map(emoji => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => handleReaction(emoji)}
                                                className={styles.pickerEmoji}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button className={styles.commentToggle} type="button" onClick={() => setShowComments(!showComments)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                            <span className={styles.statCount}>{confession.commentCount || 0}</span>
                        </button>
                    </div>

                    <div className={styles.actions}>
                        {user?._id === confession.recipientId && !confession.isReplied && (
                            <button className={`${styles.cardAction} ${styles.replyBtn}`} onClick={() => setIsReplying(true)} title="Reply">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                            </button>
                        )}
                        {user?._id === confession.userId && (
                            <button
                                className={styles.cardAction}
                                type="button"
                                onClick={startEdit}
                                title="Edit"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                        )}
                        {(user?._id === confession.userId || user?._id === confession.recipientId) && (
                            <button
                                className={`${styles.cardAction} ${styles.deleteBtn}`}
                                type="button"
                                onClick={() => {
                                    if (user?._id === confession.recipientId) {
                                        onDelete(confession._id, 'skip-code');
                                    } else {
                                        setPromptType('delete');
                                        setShowPrompt(true);
                                    }
                                }}
                                title="Delete"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        )}
                        <button
                            className={`${styles.actionBtn} ${user?.bookmarks?.includes(confession._id) ? styles.bookmarked : ''}`}
                            type="button"
                            onClick={() => onBookmark(confession._id)}
                            disabled={!user}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2-2z"></path></svg>
                        </button>
                        <button className={styles.actionBtn} type="button" onClick={handleShare} title="Share">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                        </button>
                    </div>
                </div>
            )}

            {showPrompt && (
                <div className={styles.promptOverlay}>
                    <form className={`glass ${styles.promptBox}`} onSubmit={handlePromptSubmit}>
                        <h4>Enter Secret Code</h4>
                        <p>Required to {promptType} this confession.</p>
                        <input
                            type="password"
                            className={styles.promptInput}
                            placeholder="Secret Code"
                            value={promptCode}
                            onChange={(e) => { setPromptCode(e.target.value); setPromptError(''); }}
                            required
                            autoFocus
                        />
                        {promptError && (
                            <p style={{ color: 'var(--danger)', fontSize: '0.82rem', marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
                                ⚠ {promptError}
                            </p>
                        )}
                        <div className={styles.promptActions}>
                            <button type="button" onClick={cancelPrompt} className="btn btn-ghost btn-sm">Cancel</button>
                            <button type="submit" className={`btn ${promptType === 'delete' ? 'btn-danger' : 'btn-primary'} btn-sm`} disabled={busy || (promptType === 'edit' && editText.trim().length < 5) || promptCode.length < 4}>
                                {busy ? 'Verifying...' : `Confirm ${promptType === 'edit' ? 'Edit' : 'Delete'}`}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showComments && (
                <div className={styles.commentSection}>
                    <CommentSection
                        confessionId={confession._id}
                        user={user}
                        onPostComment={onPostComment}
                    />
                </div>
            )}
        </article>
    );
}
