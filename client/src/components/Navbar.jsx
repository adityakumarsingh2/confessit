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
                        <svg className={styles.logoSvg} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L4 5V11C4 16.19 7.41 21.05 12 22C16.59 21.05 20 16.19 20 11V5L12 2Z" fill="url(#logo-grad)" />
                            <path d="M12 16.5C14.4853 16.5 16.5 14.4853 16.5 12C16.5 9.51472 14.4853 7.5 12 7.5C9.51472 7.5 7.5 9.51472 7.5 12C7.5 14.4853 9.51472 16.5 12 16.5Z" fill="white" fillOpacity="0.15" />
                            <circle cx="12" cy="11.5" r="2" fill="white" />
                            <path d="M12 13V15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="logo-grad" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#6366f1" />
                                    <stop offset="1" stopColor="#ec4899" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <span className={`${styles.title} grad-text`}>ConfessIt</span>
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
