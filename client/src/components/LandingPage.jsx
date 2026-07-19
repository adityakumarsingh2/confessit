import styles from './LandingPage.module.css';

const API_URL = import.meta.env.VITE_API_URL || '';

const MOOD_LABELS = {
    'NGL': '🙈 NGL', 'Relationship': '❤️ Crush', 'Friends': '🔥 Hot take',
    'Personal Thoughts': '💔 Secret', 'Feelings': '😌 Feelings',
    'Study': '📚 Study', 'College': '🎓 College', 'Others': '💬 Others',
    'Career': '💼 Career', 'Mental Health': '🧠 Mental Health', 'Family': '👨‍👩‍👧 Family',
};

const DUMMY_CONFESSIONS = [
    { _id: 'd1', text: "I've been secretly learning to play the piano for 6 months just to surprise my parents.", anonName: "Melodic Ghost", anonAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", mood: "Personal Thoughts", createdAt: new Date(Date.now() - 3600000).toISOString() },
    { _id: 'd2', text: "I actually like working from home more because I can stay in my pajamas all day.", anonName: "Cozy Ninja", anonAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka", mood: "NGL", createdAt: new Date(Date.now() - 7200000).toISOString() },
    { _id: 'd3', text: "I once accidentally sent a text complaining about my boss... to my boss.", anonName: "Panic Pixel", anonAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Harley", mood: "Others", createdAt: new Date(Date.now() - 86400000).toISOString() },
    { _id: 'd4', text: "I still have a crush on my high school best friend, but I'll never tell them.", anonName: "Silent Heart", anonAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha", mood: "Relationship", createdAt: new Date(Date.now() - 172800000).toISOString() },
    { _id: 'd5', text: "I fake-laugh at my friends' jokes even when I don't get them.", anonName: "Social Chameleon", anonAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Toby", mood: "Friends", createdAt: new Date(Date.now() - 259200000).toISOString() },
    { _id: 'd6', text: "I'm terrified of failure, but I pretend everything is under control.", anonName: "Shadow Soul", anonAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna", mood: "Feelings", createdAt: new Date(Date.now() - 300000000).toISOString() },
];

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function LandingPage() {
    const feed = DUMMY_CONFESSIONS;
    const doubled = [...feed, ...feed];

    return (
        <div className={styles.page}>
            <div className={styles.split}>

                {/* ── LEFT: The Branding ── */}
                <div className={styles.left}>
                    <div className={styles.contentBox}>
                        <div className={styles.badge}>
                            <span className={styles.badgeDot} />
                            Zero Logs · 100% Anonymous
                        </div>

                        <h1 className={styles.title}>
                            Confess anything.
                            <span className={styles.titleAccent}>Stay hidden.</span>
                        </h1>

                        <p className={styles.description}>
                            Join the world's safest anonymous space. Share your <strong>deepest secrets</strong>, receive honest feedback, and connect without a name.
                        </p>

                        <div className={styles.ctaGroup}>
                            <a href={`${API_URL}/auth/google`} className={styles.googleBtn}>
                                <svg className={styles.googleIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Continue with Google
                            </a>
                            <div className={styles.securityNote}>
                                🔒 Encrypted & Private
                            </div>
                        </div>

                        <div className={styles.statsRow}>
                            <div className={styles.statItem}>
                                <span className={styles.statVal}>10K+</span>
                                <span className={styles.statLabel}>Stories</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statVal}>50K+</span>
                                <span className={styles.statLabel}>Monthly Peers</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statVal}>0</span>
                                <span className={styles.statLabel}>Judgment</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: The Feed ── */}
                <div className={styles.right}>
                    <div className={styles.feedTrack}>
                        {doubled.map((c, i) => (
                            <div key={`${c._id}-${i}`} className={styles.confessionCard}>
                                <div className={styles.cardHeader}>
                                    <img src={c.anonAvatar} alt="" className={styles.cardAvatar} />
                                    <div className={styles.cardInfo}>
                                        <span className={styles.cardName}>{c.anonName}</span>
                                        <span className={styles.cardMeta}>{timeAgo(c.createdAt)}</span>
                                    </div>
                                </div>
                                {c.mood && MOOD_LABELS[c.mood] && (
                                    <span className={styles.moodTag}>{MOOD_LABELS[c.mood]}</span>
                                )}
                                <p className={styles.cardText}>{c.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
