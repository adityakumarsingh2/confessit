import { useState, useEffect, useRef } from 'react';
import styles from './LandingPage.module.css';

const API_URL = import.meta.env.VITE_API_URL || '';

const MOOD_LABELS = {
    'NGL': '🙈 NGL', 'Relationship': '❤️ Crush', 'Friends': '🔥 Hot take',
    'Personal Thoughts': '💔 Secret', 'Feelings': '😌 Feelings',
    'Study': '📚 Study', 'College': '🎓 College', 'Others': '💬 Others',
    'Career': '💼 Career', 'Mental Health': '🧠 Mental Health', 'Family': '👨‍👩‍👧 Family',
};

const REPRESENTATIVE_CONFESSIONS = [
    { _id: 'd1', text: "I've been secretly learning the guitar for 8 months just to surprise my best friend at their wedding.", anonName: "Melodic Ghost", anonAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", mood: "Personal Thoughts", createdAt: new Date(Date.now() - 3600000).toISOString(), reactions: { '❤️': ['u1', 'u2', 'u3'], '🔥': ['u4', 'u5'] }, commentCount: 7 },
    { _id: 'd2', text: "I actually prefer working alone because I get way more done. I just smile and say 'teamwork is great' in every meeting.", anonName: "Cozy Ninja", anonAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka", mood: "NGL", createdAt: new Date(Date.now() - 7200000).toISOString(), reactions: { '😂': ['u1', 'u2', 'u3', 'u4'] }, commentCount: 12 },
    { _id: 'd3', text: "I once accidentally sent a voice note complaining about my manager... to my manager's personal number.", anonName: "Panic Pixel", anonAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Harley", mood: "Others", createdAt: new Date(Date.now() - 86400000).toISOString(), reactions: { '😮': ['u1', 'u2'] , '😂': ['u3', 'u4'] }, commentCount: 23 },
    { _id: 'd4', text: "I still have feelings for someone from 3 years ago. We talked every day. I never told them. I probably never will.", anonName: "Silent Heart", anonAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha", mood: "Relationship", createdAt: new Date(Date.now() - 172800000).toISOString(), reactions: { '❤️': ['u1', 'u2', 'u3', 'u4', 'u5'], '😢': ['u6', 'u7'] }, commentCount: 31 },
    { _id: 'd5', text: "I laugh at my friends' jokes even when I don't get them. I've been doing it for so long I don't remember what genuine laughter feels like.", anonName: "Social Chameleon", anonAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Toby", mood: "Friends", createdAt: new Date(Date.now() - 259200000).toISOString(), reactions: { '😢': ['u1', 'u2', 'u3'] }, commentCount: 8 },
    { _id: 'd6', text: "I'm terrified of failure, but I've learned to wear confidence like a costume. Most days it works. Some days it doesn't.", anonName: "Shadow Soul", anonAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna", mood: "Feelings", createdAt: new Date(Date.now() - 300000).toISOString(), reactions: { '❤️': ['u1', 'u2'], '🔥': ['u3'] }, commentCount: 15 },
];

const HERO_PLACEHOLDER_TEXTS = [
    "I've been pretending to be okay for so long I forgot what okay actually feels like...",
    "I still think about what would have happened if I'd taken that job offer...",
    "I don't actually enjoy the things I tell people I enjoy. I just didn't want to be left out.",
    "Sometimes I rehearse conversations in my head that I'll never have in real life.",
];

const AVATARS = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Harley",
];

const ANON_NAMES = ["Silent Voyager", "Hidden Echo", "Quiet Dreamer", "Mystic Shadow"];

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function MiniCard({ confession, index }) {
    return (
        <div className={styles.feedCard} style={{ animationDelay: `${index * 0.08}s` }}>
            <div className={styles.feedCardHeader}>
                <img src={confession.anonAvatar} alt="" className={styles.feedAvatar} />
                <div>
                    <span className={styles.feedName}>{confession.anonName}</span>
                    <span className={styles.feedTime}>{timeAgo(confession.createdAt)}</span>
                </div>
                <span className={styles.feedMood}>{MOOD_LABELS[confession.mood] || confession.mood}</span>
            </div>
            <p className={styles.feedText}>{confession.text}</p>
            <div className={styles.feedFooter}>
                {Object.entries(confession.reactions || {}).slice(0, 2).map(([emoji, users]) => (
                    <span key={emoji} className={styles.feedReaction}>{emoji} {users.length}</span>
                ))}
                <span className={styles.feedComment}>💬 {confession.commentCount}</span>
            </div>
        </div>
    );
}

// The hero interactive composer — the main micro-interaction
function HeroComposer() {
    const [text, setText] = useState('');
    const [phase, setPhase] = useState('idle'); // idle | typing | preview | anonymized
    const [anonName, setAnonName] = useState(ANON_NAMES[0]);
    const [anonAvatar, setAnonAvatar] = useState(AVATARS[0]);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isAutoTyping, setIsAutoTyping] = useState(false);
    const textareaRef = useRef(null);
    const autoTypingRef = useRef(null);

    // Rotate placeholder typing demo when idle
    useEffect(() => {
        if (phase !== 'idle') return;
        const placeholder = HERO_PLACEHOLDER_TEXTS[placeholderIndex];
        let i = 0;
        setIsAutoTyping(true);
        const typeInterval = setInterval(() => {
            i++;
            setCharIndex(i);
            if (i >= placeholder.length) {
                clearInterval(typeInterval);
                autoTypingRef.current = setTimeout(() => {
                    setCharIndex(0);
                    setPlaceholderIndex(prev => (prev + 1) % HERO_PLACEHOLDER_TEXTS.length);
                    setIsAutoTyping(false);
                }, 3000);
            }
        }, 45);
        return () => {
            clearInterval(typeInterval);
            clearTimeout(autoTypingRef.current);
        };
    }, [phase, placeholderIndex]);

    const handleTextChange = (e) => {
        setText(e.target.value);
        if (phase === 'idle' || phase === 'preview') {
            setPhase('typing');
            setIsAutoTyping(false);
        }
    };

    const handleAnonymize = () => {
        if (!text.trim()) return;
        const randName = ANON_NAMES[Math.floor(Math.random() * ANON_NAMES.length)];
        const randAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
        setAnonName(randName);
        setAnonAvatar(randAvatar);
        setPhase('anonymized');
    };

    const handleReset = () => {
        setText('');
        setPhase('idle');
        setCharIndex(0);
    };

    const currentPlaceholder = HERO_PLACEHOLDER_TEXTS[placeholderIndex];
    const displayText = phase === 'idle' ? currentPlaceholder.slice(0, charIndex) : text;

    return (
        <div className={styles.composer}>
            <div className={styles.composerHeader}>
                <span className={styles.composerLabel}>
                    <span className={styles.composerDot} />
                    Anonymous Confession
                </span>
                {phase === 'anonymized' && (
                    <button className={styles.composerReset} onClick={handleReset}>
                        Try again
                    </button>
                )}
            </div>

            {phase !== 'anonymized' ? (
                <>
                    <textarea
                        ref={textareaRef}
                        className={styles.composerTextarea}
                        placeholder={phase === 'idle' ? '' : "What's really on your mind?"}
                        value={displayText}
                        onChange={handleTextChange}
                        readOnly={phase === 'idle'}
                        rows={4}
                    />
                    {phase === 'idle' && (
                        <div className={styles.composerCursor} />
                    )}
                    <div className={styles.composerActions}>
                        <span className={styles.composerHint}>
                            {phase === 'idle' ? 'This is just a preview — click to type your own' : `${1000 - text.length} chars left`}
                        </span>
                        <button
                            className={styles.composerBtn}
                            onClick={phase === 'idle' ? () => { setPhase('typing'); textareaRef.current?.focus(); } : handleAnonymize}
                            disabled={phase === 'typing' && !text.trim()}
                        >
                            {phase === 'idle' ? 'Write yours →' : 'Share anonymously →'}
                        </button>
                    </div>
                </>
            ) : (
                <div className={styles.composerPreview}>
                    <div className={styles.previewCard}>
                        <div className={styles.previewHeader}>
                            <img src={anonAvatar} alt="" className={styles.previewAvatar} />
                            <div>
                                <span className={styles.previewName}>{anonName}</span>
                                <span className={styles.previewTime}>Just now</span>
                            </div>
                        </div>
                        <p className={styles.previewText}>{text}</p>
                        <div className={styles.previewFooter}>
                            <span className={styles.previewReaction}>❤️ 0</span>
                            <span className={styles.previewReaction}>💬 0</span>
                        </div>
                    </div>
                    <div className={styles.previewNote}>
                        Your name is gone. That's the whole point.
                    </div>
                    <a href={`${API_URL}/auth/google`} className={styles.composerCta}>
                        Start Confessing Anonymously
                    </a>
                </div>
            )}
        </div>
    );
}

export default function LandingPage() {
    const doubled = [...REPRESENTATIVE_CONFESSIONS, ...REPRESENTATIVE_CONFESSIONS];

    // Easter egg: Konami code
    useEffect(() => {
        const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
        let seq = [];
        const handleKey = (e) => {
            seq.push(e.key);
            if (seq.length > KONAMI.length) seq.shift();
            if (seq.join(',') === KONAMI.join(',')) {
                const el = document.createElement('div');
                el.textContent = '🤫 You found the secret. Now go confess something.';
                el.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:rgba(20,20,24,0.95);border:1px solid rgba(99,102,241,0.4);color:#a5b4fc;padding:1rem 2rem;border-radius:14px;font-weight:600;font-size:0.95rem;z-index:99999;backdrop-filter:blur(20px);box-shadow:0 20px 60px rgba(0,0,0,0.5);animation:toastSlide 0.4s cubic-bezier(0.34,1.56,0.64,1)';
                document.body.appendChild(el);
                setTimeout(() => el.remove(), 4000);
                seq = [];
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    return (
        <div className={styles.page}>

            {/* ─── SECTION 1: Hero ─── */}
            <section className={styles.hero} id="hero">
                <div className={styles.heroBg} aria-hidden="true">
                    <div className={styles.orb1} />
                    <div className={styles.orb2} />
                    <div className={`${styles.orb3}`} />
                </div>
                <div className={styles.heroContent}>
                    <div className={styles.heroLeft}>
                        <div className={styles.badge}>
                            <span className={styles.badgeDot} />
                            Anonymous · Private · No judgment
                        </div>

                        <h1 className={styles.heroTitle}>
                            Some things are easier to say
                            <span className={styles.heroAccent}> when nobody knows it's you.</span>
                        </h1>

                        <p className={styles.heroDescription}>
                            ConfessHere is a space for the thoughts you carry quietly.
                            Write what's on your mind and share it with the world — without your name attached.
                        </p>

                        <div className={styles.heroCtas}>
                            <a href={`${API_URL}/auth/google`} className={styles.googleBtn} id="hero-cta-google">
                                <svg className={styles.googleIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Start Confessing Anonymously
                            </a>
                            <a href="#how-it-works" className={styles.secondaryCta}>
                                See how it works ↓
                            </a>
                        </div>
                    </div>

                    <div className={styles.heroRight}>
                        <HeroComposer />
                    </div>
                </div>
            </section>

            {/* ─── SECTION 2: How It Works ─── */}
            <section className={styles.howSection} id="how-it-works">
                <div className={styles.sectionInner}>
                    <div className={styles.sectionLabel}>How it works</div>
                    <h2 className={styles.sectionTitle}>
                        From thought to anonymous — in seconds.
                    </h2>
                    <div className={styles.steps}>
                        <div className={styles.step}>
                            <div className={styles.stepIcon}>
                                <span aria-hidden="true">💭</span>
                            </div>
                            <div className={styles.stepNum}>01</div>
                            <h3 className={styles.stepTitle}>Think it.</h3>
                            <p className={styles.stepText}>
                                Something's been sitting with you. A feeling, a secret, an honest thought you haven't said out loud.
                            </p>
                        </div>
                        <div className={styles.stepConnector} aria-hidden="true" />
                        <div className={styles.step}>
                            <div className={styles.stepIcon}>
                                <span aria-hidden="true">✍️</span>
                            </div>
                            <div className={styles.stepNum}>02</div>
                            <h3 className={styles.stepTitle}>Write it.</h3>
                            <p className={styles.stepText}>
                                Sign in with Google — we use it only to authenticate. Your real name never appears. You get a random identity.
                            </p>
                        </div>
                        <div className={styles.stepConnector} aria-hidden="true" />
                        <div className={styles.step}>
                            <div className={styles.stepIcon}>
                                <span aria-hidden="true">🌊</span>
                            </div>
                            <div className={styles.stepNum}>03</div>
                            <h3 className={styles.stepTitle}>Let it go.</h3>
                            <p className={styles.stepText}>
                                Your confession enters the shared space. Others read, react, and comment — none of them know it's you.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── SECTION 3: Feed Preview ─── */}
            <section className={styles.feedSection}>
                <div className={styles.sectionInner}>
                    <div className={styles.sectionLabel}>The confession wall</div>
                    <h2 className={styles.sectionTitle}>
                        What ConfessHere looks like in action.
                    </h2>
                    <p className={styles.sectionDesc}>
                        These are representative examples of the kind of confessions shared on ConfessHere.
                        Real posts are posted by real people — with random names and avatars like these.
                    </p>
                </div>

                <div className={styles.feedScrollOuter}>
                    <div className={styles.feedScrollInner}>
                        {doubled.map((c, i) => (
                            <MiniCard key={`${c._id}-${i}`} confession={c} index={i} />
                        ))}
                    </div>
                </div>

                <div className={styles.feedGradientLeft} aria-hidden="true" />
                <div className={styles.feedGradientRight} aria-hidden="true" />
            </section>

            {/* ─── SECTION 4: Why It Matters ─── */}
            <section className={styles.whySection}>
                <div className={styles.sectionInner}>
                    <div className={styles.sectionLabel}>Why anonymous space matters</div>
                    <h2 className={styles.sectionTitle}>
                        Not everything needs an audience. <br />
                        <span className={styles.heroAccent}>Some things just need to be said.</span>
                    </h2>

                    <div className={styles.pillars}>
                        <div className={styles.pillar}>
                            <div className={styles.pillarIcon} aria-hidden="true">🎭</div>
                            <h3 className={styles.pillarTitle}>Say what you couldn't</h3>
                            <p className={styles.pillarText}>
                                Some thoughts get stuck because saying them out loud means being known for them.
                                Anonymity removes that pressure.
                            </p>
                        </div>
                        <div className={styles.pillar}>
                            <div className={styles.pillarIcon} aria-hidden="true">👂</div>
                            <h3 className={styles.pillarTitle}>Be heard without exposure</h3>
                            <p className={styles.pillarText}>
                                Your thought enters a community of real people who react, comment,
                                and often say "me too" — without knowing who you are.
                            </p>
                        </div>
                        <div className={styles.pillar}>
                            <div className={styles.pillarIcon} aria-hidden="true">🧘</div>
                            <h3 className={styles.pillarTitle}>Release, don't suppress</h3>
                            <p className={styles.pillarText}>
                                Writing something down — even to strangers — can be a genuine relief.
                                ConfessHere gives that release a place to go.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── SECTION 5: Final CTA ─── */}
            <section className={styles.ctaSection}>
                <div className={styles.ctaInner}>
                    <div className={styles.ctaOrb} aria-hidden="true" />
                    <p className={styles.ctaEyebrow}>Ready?</p>
                    <h2 className={styles.ctaTitle}>
                        Some thoughts don't need<br />your name attached to them.
                    </h2>
                    <p className={styles.ctaSubtext}>
                        Join with Google. Get a random identity. Say what you need to say.
                    </p>
                    <a href={`${API_URL}/auth/google`} className={styles.ctaPrimaryBtn} id="footer-cta-google">
                        <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </a>
                    <p className={styles.ctaDisclaimer}>
                        Your Google account is used for authentication only. Your real identity never appears on the platform.
                    </p>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className={styles.footerBrand}>
                        <span className={styles.footerLogo}>ConfessHere</span>
                        <span className={styles.footerDomain}>confessit.online</span>
                    </div>
                    <p className={styles.footerNote}>
                        A space for honest, anonymous expression. No names. No judgment.
                    </p>
                    <p className={styles.footerCopy}>© 2025 ConfessHere · Built for real humans with real thoughts</p>
                </div>
            </footer>
        </div>
    );
}
