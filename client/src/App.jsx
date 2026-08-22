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
import Confetti from './components/Confetti';
import LandingPage from './components/LandingPage';
import styles from './App.module.css';

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
    const [showLanding, setShowLanding] = useState(true);
    const [toasts, setToasts] = useState([]);
    const [sharedConfession, setSharedConfession] = useState(null);
    const [sendToId, setSendToId] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [inboxMessages, setInboxMessages] = useState([]);

    // Automatically exit landing view when user logs in or URL specifies feed/error
    useEffect(() => {
        if (user) {
            setShowLanding(false);
        }
    }, [user]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('error') || params.get('view') === 'feed') {
            setShowLanding(false);
        }
    }, []);

    const handleNavigate = useCallback((view) => {
        setCurrentView(view);
        setShowLanding(false);
    }, []);

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
            setShowConfetti(true);
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

    const isLandingView = !user && showLanding && currentView === 'feed' && !sharedConfession;

    return (
        <div className={styles.app}>
            {!isLandingView && (
                <Navbar
                    user={user}
                    onSearch={(q) => refresh({ search: q })}
                    unreadCount={unreadCount}
                    onNavigate={handleNavigate}
                />
            )}

            {isLandingView ? (
                <LandingPage onExplore={() => handleNavigate('feed')} />
            ) : (
                <main className={styles.main}>
                    {/* Left Section */}
                <div className={styles.sidebarSection}>
                    <Sidebar
                        user={user}
                        activity={activity}
                        unreadCount={unreadCount}
                        currentView={currentView}
                        onNavigate={setCurrentView}
                        onRegenerate={handleRegenerate}
                    />
                </div>

                {/* Middle Section */}
                <div className={styles.feed}>
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
                                <div className={`glass ${styles.loginPrompt}`} style={{ padding: '3rem 2rem', border: '1px solid var(--border-glow)' }}>
                                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: 'var(--shadow-glow)' }}>
                                        <Lock size={32} color="var(--primary)" />
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Login to Confess</h3>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem', maxWidth: '400px', margin: '0 auto' }}>You need to sign in with Google to post. Your identity remains hidden.</p>
                                    <a href={`${import.meta.env.VITE_API_URL || ''}/auth/google`} className={`btn btn-primary ${styles.ctaButton}`} style={{ padding: '0.8rem 2rem' }}>
                                        Login with Google
                                    </a>
                                </div>
                            )}

                            {currentView === 'inbox' && (
                                <div className={styles.inboxHeader}>
                                    <h2>My Anonymous Inbox 📩</h2>
                                    <p>Only you can see these messages.</p>
                                    {user?.visitCount > 0 && (
                                        <div className={styles.visitStat}>
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

                {/* Right Section */}
                <div className={styles.trendingSection}>
                    <TrendingBar trendingPosts={confessions} />
                </div>
            </main>
            )}

            {/* Confetti Celebration */}
            <Confetti active={showConfetti} onDone={() => setShowConfetti(false)} />

            {/* Toasts */}
            <Toast toasts={toasts} remove={removeToast} />
        </div>
    );
}
