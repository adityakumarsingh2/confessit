import { Sparkles, ShieldCheck, Globe, MessageCircleHeart } from 'lucide-react';
import styles from './LandingPage.module.css';

const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

export default function LandingPage({ confessions }) {
    const API_URL = import.meta.env.VITE_API_URL || '';

    // Take top 8 recent public confessions for the vertical marquee
    const previewConfessions = confessions?.slice(0, 8) || [];
    
    // Duplicate for smooth infinite vertical scrolling
    const marqueeItems = [...previewConfessions, ...previewConfessions];

    return (
        <div className={styles.landingContainer}>
            <div className={styles.splitLayout}>
                
                {/* ── Left Panel: Marketing ── */}
                <section className={styles.leftPanel}>
                    <div className={styles.heroBackground}>
                        <div className={`${styles.orb} ${styles.orb1}`} />
                        <div className={`${styles.orb} ${styles.orb2}`} />
                    </div>
                    <div className={styles.badgeWrapper}>
                        <span className={styles.heroBadge}>
                            <Sparkles size={16} /> The #1 Anonymous Platform
                        </span>
                    </div>
                    
                    <h1 className={styles.heroTitle}>
                        Speak your truth, <br />
                        <span className={styles.highlight}>Stay Anonymous.</span>
                    </h1>
                    
                    <p className={styles.heroParagraph}>
                        Join a beautiful, safe space to share your deepest thoughts, secrets, and stories without fear of judgment. Everyone is listening, but no one knows who you are.
                    </p>

                    <div className={styles.heroCta}>
                        <a href={`${API_URL}/auth/google`} className={styles.ctaButton}>
                            Start Confessing
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </a>
                        <a href="#feed" className={styles.secondaryCta}>
                            Read feed
                        </a>
                    </div>

                    <div className={styles.featureList}>
                        <div className={styles.featureItem}>
                            <div className={styles.featureIcon}><ShieldCheck size={20} /></div>
                            <div>
                                <span className={styles.featureText}>100% Anonymous</span>
                                <span className={styles.featureSub}>Your identity is never exposed.</span>
                            </div>
                        </div>
                        <div className={styles.featureItem}>
                            <div className={styles.featureIcon}><Globe size={20} /></div>
                            <div>
                                <span className={styles.featureText}>Global Community</span>
                                <span className={styles.featureSub}>Connect with millions worldwide.</span>
                            </div>
                        </div>
                        <div className={styles.featureItem}>
                            <div className={styles.featureIcon}><MessageCircleHeart size={20} /></div>
                            <div>
                                <span className={styles.featureText}>Zero Judgment</span>
                                <span className={styles.featureSub}>A highly supportive environment.</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Right Panel: Live Feed Sneak Peek ── */}
                <section className={styles.rightPanel} id="feed">
                    <div className={styles.topOverlay} />
                    
                    <div className={styles.feedTrack}>
                        {marqueeItems.map((c, i) => (
                            <div key={`${c._id}-${i}`} className={styles.feedCard}>
                                <div className={styles.cardHeader}>
                                    <img src={c.anonAvatar} alt="" className={styles.cardAvatar} />
                                    <div>
                                        <div className={styles.cardName}>{c.anonName}</div>
                                        <div className={styles.cardTime}>{timeAgo(c.createdAt)}</div>
                                    </div>
                                </div>
                                <p className={styles.cardText}>{c.text}</p>
                            </div>
                        ))}
                    </div>

                    <div className={styles.bottomOverlay}>
                        <a href={`${API_URL}/auth/google`} className={styles.ctaButton} style={{ padding: '0.8rem 2rem', fontSize: '1rem', background: '#38bdf8', color: '#020617' }}>
                            Login to see more
                        </a>
                    </div>
                </section>

            </div>
        </div>
    );
}
