import { Home, Inbox, FileText, Bookmark, Archive, RefreshCw, Copy, UserCircle2 } from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar({ user, activity, unreadCount, currentView, onNavigate, onRegenerate }) {
    if (!user) return (
        <aside className={`${styles.sidebar} sticky-top`}>
            <div className={`glass ${styles.profileCard}`} style={{ textAlign: 'center', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                    <UserCircle2 size={32} color="var(--text-muted)" />
                </div>
                <h3 className={styles.anonName} style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>Guest Mode</h3>
                <p className={styles.realName} style={{ lineHeight: '1.5', fontSize: '0.9rem' }}>Login to unlock your profile and track your secrets.</p>
            </div>
        </aside>
    );

    const navItems = [
        { id: 'feed', label: 'Main Feed', icon: <Home size={20} /> },
        { id: 'inbox', label: 'Anonymous Inbox', icon: <Inbox size={20} />, badge: unreadCount }, // For NGL messages
        { id: 'my-posts', label: 'My Secrets', icon: <FileText size={20} /> },
        { id: 'bookmarks', label: 'Bookmarks', icon: <Bookmark size={20} /> },
        { id: 'drafts', label: 'Drafts', icon: <Archive size={20} />, badge: activity?.drafts?.length }
    ];

    const shareUrl = `${window.location.origin}/?send=${user._id}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        if (onNavigate) onNavigate('feed'); // Reset view or just toast
        // We'll rely on the parent to show toast if we pass it up, 
        // but for now let's assume Sidebar styles handles some feedback or we just copy.
    };

    return (
        <aside className={`${styles.sidebar} sticky-top`}>
            <div className={`glass ${styles.profileCard}`}>
                <div className={styles.avatarWrapper}>
                    <img src={user.anonAvatar} alt="avatar" className={styles.avatar} />
                    <button type="button" onClick={onRegenerate} className={styles.cycleBtn} title="Regenerate Identity">
                        <RefreshCw size={14} strokeWidth={3} />
                    </button>
                </div>
                <div className={styles.info}>
                    <h3 className={styles.anonName}>{user.anonName}</h3>
                    <p className={styles.realName}>
                        {typeof user.name === 'string' ? user.name : (user.name?.displayName || 'User')}
                    </p>
                </div>

                <div className={styles.nglSection}>
                    <p className={styles.nglHint}>Share your link to get secrets <span role="img" aria-label="shush">🤫</span></p>
                    <div className={styles.copyGroup}>
                        <input readOnly value={shareUrl} className={styles.shareInput} />
                        <button onClick={handleCopy} className={styles.copyBtn} style={{display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center'}}>
                            <Copy size={14} /> Copy
                        </button>
                    </div>
                </div>

                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statVal}>{activity?.myConfessions?.length || 0}</span>
                        <span className={styles.statLab}>Secrets</span>
                    </div>
                    <div className={styles.divider} />
                    <div className={styles.statItem}>
                        <span className={styles.statVal}>{activity?.bookmarks?.length || 0}</span>
                        <span className={styles.statLab}>Saved</span>
                    </div>
                </div>
            </div>

            <nav className={styles.nav}>
                {navItems.map(item => (
                    <button
                        key={item.id}
                        type="button"
                        className={`${styles.navItem} ${currentView === item.id ? styles.active : ''}`}
                        onClick={() => onNavigate(item.id)}
                    >
                        <span className={styles.navIcon}>{item.icon}</span>
                        <span className={styles.navLabel}>{item.label}</span>
                        {item.badge > 0 && (
                            <span className={styles.badge}>{item.badge}</span>
                        )}
                    </button>
                ))}
            </nav>
        </aside>
    );
}
