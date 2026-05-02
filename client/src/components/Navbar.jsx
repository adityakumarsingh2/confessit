import { useState } from 'react';
import styles from './Navbar.module.css';

export default function Navbar({ user, onSearch, unreadCount, onNavigate }) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        if (onSearch) onSearch(e.target.value);
    };

    return (
        <nav className={styles.nav}>
            <div className={styles.container}>
                <div className={styles.brand} onClick={() => onNavigate && onNavigate('feed')} style={{ cursor: 'pointer' }}>
                    <div className={styles.logoIcon}>
                        <img src="/logo.png" alt="ConfessIt Logo" className={styles.logoImg} />
                    </div>
                    <div className={styles.titleWrapper}>
                        <span className={styles.titleConfess}>Confess</span>
                        <span className={styles.titleIt}>It</span>
                    </div>
                </div>

                <div className={styles.center}>
                    {user && (
                        <div className={styles.searchBox}>
                            <span className={styles.searchIcon}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Search secrets..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className={styles.searchInput}
                            />
                        </div>
                    )}
                </div>

                <div className={styles.right}>
                    {user ? (
                        <div className={styles.userProfile}>
                            <button
                                className={styles.notifBtn}
                                onClick={() => onNavigate && onNavigate('inbox')}
                                title="Conversations"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                            </button>
                            <div className={styles.userInfo}>
                                <img src={user.anonAvatar} alt="avatar" className={styles.avatar} />
                                <span className={styles.name}>{user.anonName}</span>
                            </div>
                            <a href={`${import.meta.env.VITE_API_URL || ''}/auth/logout`} className={styles.logoutBtn}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                            </a>
                        </div>
                    ) : (
                        <a href={`${import.meta.env.VITE_API_URL || ''}/auth/google`} className="btn btn-primary">Join Now</a>
                    )}
                </div>
            </div>
        </nav>
    );
}
