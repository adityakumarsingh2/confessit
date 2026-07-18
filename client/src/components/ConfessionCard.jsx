import { useState, useRef, useEffect } from 'react';
import CommentSection from './CommentSection';

const DEFAULT_REACTIONS = ['❤️', '😂', '😢', '🔥', '😮'];

const MOOD_LABELS = {
    'NGL': '🙈 NGL',
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

export default function ConfessionCard({ confession, user, activity, onReact, onBookmark, onPostComment, onUpdate, onDelete, onVote, onPostReply, addToast, isInbox = false }) {
    const [showComments, setShowComments] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const pickerRef = useRef(null);

    // Edit & Reply state
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(confession.text);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [busy, setBusy] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

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

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (editText.trim().length < 5) return;
        setBusy(true);
        try {
            await onUpdate(confession._id, { text: editText.trim() });
            setIsEditing(false);
        } catch (err) {
            addToast(err.message || 'Update failed', 'error');
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        setBusy(true);
        try {
            await onDelete(confession._id);
        } catch (err) {
            addToast(err.message, 'error');
            setBusy(false);
            setConfirmDelete(false);
        }
    };

    const reactionsMap = confession.reactions || {};
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
        if (count < 10) onReact(confession._id, emoji);
        setShowEmojiPicker(false);
    };

    const handleShare = () => {
        const shareUrl = `${window.location.origin}/?share=${confession._id}`;
        navigator.clipboard.writeText(shareUrl);
        if (addToast) addToast('Link copied! 🔗');
    };

    const isOwner = user?._id === confession.userId;
    const isRecipient = user?._id === confession.recipientId?.toString();
    const isBookmarked = activity?.bookmarks?.some(b => (b._id || b) === confession._id);

    return (
        <article className={`card-elegant p-5 sm:p-7 flex flex-col gap-5 slide-up ${confession.isReplied ? 'ring-2 ring-primary/40 shadow-glow' : ''}`}>
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                    <div className="shrink-0 w-11 h-11 rounded-full border border-primary/20 bg-secondary/80 overflow-hidden shadow-sm">
                        <img src={confession.anonAvatar} alt="Anon" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground text-[15px] sm:text-base tracking-wide">{confession.anonName}</h4>
                        <span className="text-xs text-muted-foreground font-mono font-medium">{timeAgo(confession.createdAt)}</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                    {confession.mood && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold bg-primary/10 text-primary border border-primary/20 shadow-sm">
                            {MOOD_LABELS[confession.mood] || confession.mood}
                        </span>
                    )}
                    {confession.recipientId && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold bg-destructive/10 text-destructive border border-destructive/20 shadow-sm">
                            🤫 Private
                        </span>
                    )}
                </div>
            </div>

            {/* Post Content / Edit Area */}
            {isEditing ? (
                <form onSubmit={handleEditSubmit} className="space-y-3">
                    <textarea
                        className="w-full bg-background/50 text-foreground border border-primary/30 rounded-xl p-4 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-inner text-[15px] leading-relaxed"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => { setIsEditing(false); setEditText(confession.text); }}>Cancel</button>
                        <button type="submit" className="btn-primary px-5 py-2 text-sm" disabled={busy || editText.trim().length < 5}>
                            {busy ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            ) : (
                <p className="text-foreground/90 text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap break-words font-medium">
                    {confession.text}
                </p>
            )}

            {/* Recipient Reply */}
            {confession.recipientReply && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 sm:p-5 relative mt-2">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/30 rounded-l-xl" />
                    <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2 uppercase tracking-wide">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        Official Reply
                    </div>
                    <p className="text-foreground/80 text-[14px] leading-relaxed italic">{confession.recipientReply}</p>
                </div>
            )}

            {/* Reply Form (for recipient in feed view) */}
            {isReplying && (
                <form className="bg-secondary/30 rounded-xl p-4 border border-border/50 shadow-inner mt-2 space-y-3" onSubmit={handleReplySubmit}>
                    <textarea
                        className="w-full bg-background border border-border/60 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground resize-none"
                        placeholder="Write a public reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={3}
                        required
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" className="px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsReplying(false)}>Cancel</button>
                        <button type="submit" className="btn-primary px-5 py-1.5 text-sm" disabled={busy || !replyText.trim()}>
                            {busy ? 'Posting...' : 'Post Reply'}
                        </button>
                    </div>
                </form>
            )}

            {/* ─── Inbox Actions ─── */}
            {isInbox && isRecipient && (
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border/40">
                    {!confession.isReplied && !isReplying && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-semibold transition-colors" onClick={() => setIsReplying(true)}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                            Reply Publicly
                        </button>
                    )}
                    {confession.isReplied && (
                        <span className="flex items-center gap-1.5 text-emerald-500 font-bold text-sm bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                            ✅ Replied & Published
                        </span>
                    )}
                    {!confirmDelete ? (
                        <button className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg text-sm font-semibold transition-colors ml-auto" onClick={() => setConfirmDelete(true)} disabled={busy}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Delete
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 ml-auto">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Sure?</span>
                            <button className="px-4 py-1.5 bg-destructive text-destructive-foreground rounded-lg text-sm font-bold shadow-sm" onClick={handleDelete} disabled={busy}>
                                {busy ? '...' : 'Yes, Delete'}
                            </button>
                            <button className="px-4 py-1.5 bg-secondary text-foreground rounded-lg text-sm font-medium border border-border/50 hover:bg-secondary/70 transition-colors" onClick={() => setConfirmDelete(false)}>Cancel</button>
                        </div>
                    )}
                </div>
            )}

            {/* Poll */}
            {confession.poll?.options?.length > 0 && !isInbox && (
                <div className="bg-secondary/40 rounded-2xl p-4 border border-border/50 space-y-3 mt-2">
                    <p className="text-sm font-bold text-foreground flex items-center gap-2">
                        <span className="text-primary text-lg">📊</span> {confession.poll.question}
                    </p>
                    <div className="space-y-2">
                        {confession.poll.options.map((opt, i) => {
                            const hasVoted = user && opt.votes.includes(user._id);
                            const totalVotes = confession.poll.options.reduce((acc, curr) => acc + curr.votes.length, 0);
                            const percent = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    className={`relative w-full text-left p-3 rounded-xl overflow-hidden transition-all border ${hasVoted ? 'border-primary bg-primary/10' : 'border-border/60 bg-background hover:border-primary/50'} focus:outline-none focus:ring-2 focus:ring-primary/20 flex items-center justify-between`}
                                    onClick={() => handleVote(i)}
                                    disabled={!user}
                                >
                                    <div 
                                        className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out ${hasVoted ? 'bg-primary/20' : 'bg-secondary'}`} 
                                        style={{ width: `${percent}%` }} 
                                    />
                                    <span className={`relative z-10 text-sm font-medium ${hasVoted ? 'text-primary' : 'text-foreground'}`}>{opt.text}</span>
                                    <span className={`relative z-10 text-xs font-bold font-mono ${hasVoted ? 'text-primary' : 'text-muted-foreground'}`}>{percent}%</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ─── Footer ─── */}
            {!isInbox && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/40 mt-1">
                    
                    {/* Reactions & Comments toggle */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex flex-wrap items-center gap-1.5 bg-secondary/30 p-1.5 rounded-full border border-border/50">
                            {topReactions.map(([emoji, users]) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium transition-all border ${currentReaction === emoji ? 'bg-primary/15 border-primary/30 text-primary shadow-sm' : 'bg-transparent border-transparent hover:bg-background hover:border-border/60 text-foreground'} ${getUserReactionsCount(emoji) >= 10 ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    onClick={() => handleReaction(emoji)}
                                    disabled={!user}
                                    title={getUserReactionsCount(emoji) > 0 ? `${getUserReactionsCount(emoji)}/10 likes` : 'React'}
                                >
                                    <span>{emoji}</span> 
                                    <span className="text-xs opacity-80 font-mono">{users.length}</span>
                                    {getUserReactionsCount(emoji) > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-primary-foreground flex items-center justify-center rounded-full text-[9px] font-bold ring-2 ring-background">
                                            {getUserReactionsCount(emoji)}
                                        </span>
                                    )}
                                </button>
                            ))}

                            <div className="relative" ref={pickerRef}>
                                <button
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-background border border-border/60 hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-primary transition-colors shadow-sm ml-1"
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    disabled={!user}
                                    title="Add reaction"
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                                </button>
                                
                                {showEmojiPicker && (
                                    <div className="absolute bottom-full left-0 mb-2 p-2 bg-background/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-xl flex gap-1 z-50">
                                        {DEFAULT_REACTIONS.map(emoji => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => handleReaction(emoji)}
                                                className="w-9 h-9 flex items-center justify-center text-lg hover:bg-secondary rounded-xl transition-colors hover:scale-110 active:scale-95"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button 
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors ml-auto sm:ml-0" 
                            type="button" 
                            onClick={() => setShowComments(!showComments)}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                            <span className="font-mono">{confession.commentCount || 0}</span>
                        </button>
                    </div>

                    {/* Actions Right */}
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                        {isRecipient && !confession.isReplied && (
                            <button className="p-2.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" onClick={() => setIsReplying(true)} title="Reply">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                            </button>
                        )}
                        {isOwner && !isEditing && (
                            <button className="p-2.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" type="button" onClick={() => { setEditText(confession.text); setIsEditing(true); }} title="Edit">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                        )}
                        {(isOwner || isRecipient) && (
                            !confirmDelete ? (
                                <button className="p-2.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" type="button" onClick={() => setConfirmDelete(true)} title="Delete">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            ) : (
                                <div className="flex items-center gap-1.5 bg-destructive/5 pl-3 pr-1 py-1 rounded-full border border-destructive/20">
                                    <span className="text-[11px] font-bold text-destructive uppercase tracking-widest">Delete?</span>
                                    <button className="px-3 py-1.5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full shadow-sm hover:opacity-90" onClick={handleDelete} disabled={busy}>{busy ? '...' : 'Yes'}</button>
                                    <button className="px-3 py-1.5 bg-background text-foreground border border-border text-xs font-bold rounded-full hover:bg-secondary" onClick={() => setConfirmDelete(false)}>No</button>
                                </div>
                            )
                        )}
                        <button
                            className={`p-2.5 rounded-full transition-colors ${isBookmarked ? 'text-warning bg-warning/10 border-warning/20' : 'text-muted-foreground hover:text-warning hover:bg-warning/10 border-transparent'} border`}
                            type="button"
                            onClick={() => onBookmark(confession._id)}
                            disabled={!user}
                            title="Bookmark"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                        </button>
                        <button className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" type="button" onClick={handleShare} title="Share">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                        </button>
                    </div>
                </div>
            )}

            {showComments && (
                <div className="pt-2">
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
