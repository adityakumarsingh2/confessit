import { useState } from 'react';

export default function Navbar({ user, onSearch, unreadCount, onNavigate }) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        if (onSearch) onSearch(e.target.value);
    };

    return (
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                
                {/* Brand Logo */}
                <div 
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
                    onClick={() => onNavigate && onNavigate('feed')}
                >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm overflow-hidden">
                        <img src="/logo.png" alt="ConfessIt Logo" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-xl sm:text-2xl font-display font-extrabold tracking-tight flex items-center">
                        <span className="text-foreground">Confess</span>
                        <span className="text-gradient-warm">It</span>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="hidden md:flex flex-1 max-w-md px-8">
                    {user && (
                        <div className="relative w-full group">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Search secrets..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border/60 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-foreground placeholder:text-muted-foreground/70"
                            />
                        </div>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3 sm:gap-4">
                    {user ? (
                        <>
                            {/* Notifications */}
                            <button
                                className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
                                onClick={() => onNavigate && onNavigate('inbox')}
                                title="Conversations"
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground ring-2 ring-background">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            
                            {/* Profile Info */}
                            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-secondary/60 border border-border/50 shadow-sm">
                                <img src={user.anonAvatar} alt="avatar" className="w-7 h-7 rounded-full bg-background border border-border shadow-2xs" />
                                <span className="text-sm font-bold text-foreground">{user.anonName}</span>
                            </div>

                            {/* Logout */}
                            <a 
                                href={`${import.meta.env.VITE_API_URL || ''}/auth/logout`} 
                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors ml-1"
                                title="Logout"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                            </a>
                        </>
                    ) : (
                        <a href={`${import.meta.env.VITE_API_URL || ''}/auth/google`} className="btn-primary px-6 py-2.5 text-sm">
                            Join Now
                        </a>
                    )}
                </div>
            </div>
        </nav>
    );
}
