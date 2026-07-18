import { useState, useCallback, useMemo, useEffect } from 'react';
import { Lock, ShieldCheck, Globe, MessageCircleHeart, Sparkles } from 'lucide-react';
import { useConfessions } from './hooks/useConfessions';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TrendingBar from './components/TrendingBar';
import ConfessionForm from './components/ConfessionForm';
import ConfessionList from './components/ConfessionList';
import PublicProfile from './components/PublicProfile';
import Toast from './components/Toast';
import LandingPage from './components/LandingPage';

let toastId = 0;

export default function App() {
    const {
        confessions,
        loading,
        user,
        activity,
        postConfession,
        reactToConfession,
        toggleBookmark,
        saveDraft,
        postComment,
        voteOnPoll,
        updateConfession,
        deleteConfession,
        regenerateIdentity,
        fetchSingleConfession,
        fetchPublicUser,
        fetchInbox,
        unreadCount,
        postPrivateConfession,
        postReply,
        refresh
    } = useConfessions();

    const [currentView, setCurrentView] = useState('feed'); // feed, my-posts, drafts, bookmarks, inbox
    const [toasts, setToasts] = useState([]);
    const [sharedConfession, setSharedConfession] = useState(null);
    const [sendToId, setSendToId] = useState(null);
    const [inboxMessages, setInboxMessages] = useState([]);

    const addToast = useCallback((message, type = 'success') => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    // --- Notifications Handling ---
    useEffect(() => {
        const handleNewConfession = (e) => {
            addToast(`You received ${e.detail.count} new secret(s)! 📩`, 'info');
        };
        window.addEventListener('new-confession', handleNewConfession);
        return () => window.removeEventListener('new-confession', handleNewConfession);
    }, [addToast]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const handleRegenerate = async () => {
        try {
            await regenerateIdentity();
            addToast('Identity regenerated! ✨');
        } catch (e) {
            addToast(e.message, 'error');
        }
    };

    // --- Share Link & Inbox Handling ---
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const shareId = params.get('share');
        const sendTo = params.get('send');

        if (shareId) {
            (async () => {
                const c = await fetchSingleConfession(shareId);
                if (c) {
                    setSharedConfession(c);
                    setCurrentView('feed');
                    window.history.replaceState({}, '', window.location.pathname);
                    addToast('Viewing shared secret 🤫');
                }
            })();
        }

        if (sendTo) {
            setSendToId(sendTo);
            setCurrentView('send');
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [fetchSingleConfession, addToast]);

    // Fetch inbox when switching to inbox view - and mark as read
    useEffect(() => {
        if (currentView === 'inbox' && user) {
            fetchInbox(true).then(setInboxMessages);
        }
    }, [currentView, user, fetchInbox]);

    // --- Computed List based on View ---
    const filteredList = useMemo(() => {
        let list = [];
        if (currentView === 'feed') list = confessions;
        else if (currentView === 'my-posts') list = activity.myConfessions || [];
        else if (currentView === 'bookmarks') list = activity.bookmarks || [];
        else if (currentView === 'drafts') list = activity.drafts || [];
        else if (currentView === 'inbox') list = inboxMessages;
        else list = confessions;

        // Prepend shared confession if it's not already in the list
        if (sharedConfession && !list.find(c => c._id === sharedConfession._id)) {
            return [sharedConfession, ...list];
        }
        return list;
    }, [currentView, confessions, activity, sharedConfession, inboxMessages]);

    const handlePost = async (payload) => {
        try {
            await postConfession(payload);
            addToast('Secret shared! 🚀');
        } catch (e) {
            addToast(e.message, 'error');
        }
    };

    const handleReact = async (id, emoji) => {
        try {
            await reactToConfession(id, emoji);
        } catch (e) {
            addToast(e.message, 'error');
        }
    };

    const handleBookmark = async (id) => {
        const isCurrentlyBookmarked = activity?.bookmarks?.some(b => (b._id || b) === id);
        try {
            await toggleBookmark(id);
            addToast(isCurrentlyBookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks 🔖', isCurrentlyBookmarked ? 'default' : 'success');
        } catch (e) {
            addToast(e.message, 'error');
        }
    };

    const handleUpdate = async (id, payload) => {
        try {
            await updateConfession(id, payload);
            addToast('Confession updated! ✨', 'success');
        } catch (e) {
            addToast(e.message, 'error');
            throw e; // Propagate for UI handling
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteConfession(id);
            addToast('Confession deleted', 'success');
        } catch (e) {
            addToast(e.message, 'error');
            throw e;
        }
    };

    const handlePostComment = async (confid, text) => {
        try {
            await postComment(confid, text);
            addToast('Comment posted! 💬', 'success');
        } catch (e) {
            addToast(e.message, 'error');
        }
    };

    const handleVote = async (id, index) => {
        try {
            await voteOnPoll(id, index);
            addToast('Vote cast! 🗳️');
        } catch (e) {
            addToast(e.message, 'error');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans relative">
            <Navbar
                user={user}
                onSearch={(q) => refresh({ search: q })}
                unreadCount={unreadCount}
                onNavigate={setCurrentView}
            />

            {!user && currentView === 'feed' && !sharedConfession ? (
                <LandingPage />
            ) : (
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex flex-col lg:flex-row gap-8">
                    {/* Left Section (Sidebar) */}
                    <div className="w-full lg:w-[280px] shrink-0">
                        <div className="sticky top-24">
                            <Sidebar
                                user={user}
                                activity={activity}
                                unreadCount={unreadCount}
                                currentView={currentView}
                                onNavigate={setCurrentView}
                                onRegenerate={handleRegenerate}
                            />
                        </div>
                    </div>

                    {/* Middle Section (Feed) */}
                    <div className="flex-1 w-full max-w-2xl mx-auto space-y-6">
                        {currentView === 'send' && sendToId ? (
                            <PublicProfile
                                userId={sendToId}
                                fetchPublicUser={fetchPublicUser}
                                onSend={postPrivateConfession}
                                addToast={addToast}
                            />
                        ) : (
                            <>
                                {user && currentView === 'feed' && <ConfessionForm onSubmit={handlePost} onSaveDraft={saveDraft} />}

                                {!user && currentView === 'feed' && (
                                    <div className="card-elegant p-10 text-center flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
                                        {/* Background subtle glow */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-3xl pointer-events-none" />
                                        
                                        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shadow-accent relative z-10">
                                            <Lock size={36} className="text-primary" />
                                        </div>
                                        <div className="z-10">
                                            <h3 className="text-2xl font-bold font-display text-foreground mb-3">Login to Confess</h3>
                                            <p className="text-muted-foreground max-w-md mx-auto text-base">You need to sign in with Google to post. Your identity remains 100% hidden and secure.</p>
                                        </div>
                                        <a href={`${import.meta.env.VITE_API_URL || ''}/auth/google`} className="btn-primary px-8 py-3.5 z-10">
                                            Login with Google
                                        </a>
                                    </div>
                                )}

                                {currentView === 'inbox' && (
                                    <div className="space-y-4 mb-8">
                                        <h2 className="text-3xl font-display font-bold">My Anonymous Inbox 📩</h2>
                                        <p className="text-muted-foreground">Only you can see these messages.</p>
                                        {user?.visitCount > 0 && (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-sm font-medium border border-border/50 text-foreground">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                                <strong>{user.visitCount.toLocaleString()}</strong> people visited your secret link
                                            </div>
                                        )}
                                    </div>
                                )}

                                <ConfessionList
                                    confessions={filteredList}
                                    loading={loading}
                                    user={user}
                                    activity={activity}
                                    onReact={handleReact}
                                    onBookmark={handleBookmark}
                                    onPostComment={handlePostComment}
                                    onUpdate={handleUpdate}
                                    onDelete={handleDelete}
                                    onVote={handleVote}
                                    onPostReply={postReply}
                                    addToast={addToast}
                                    isInbox={currentView === 'inbox'}
                                />
                            </>
                        )}
                    </div>

                    {/* Right Section (Trending) */}
                    <div className="hidden xl:block w-[300px] shrink-0">
                        <div className="sticky top-24">
                            <TrendingBar trendingPosts={confessions} />
                        </div>
                    </div>
                </main>
            )}

            {/* Toasts */}
            <Toast toasts={toasts} remove={removeToast} />
        </div>
    );
}
