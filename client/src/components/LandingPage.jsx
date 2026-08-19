import { useState, useEffect, useRef } from 'react';
import styles from './LandingPage.module.css';

const API_URL = import.meta.env.VITE_API_URL || '';

const MOOD_LABELS = {
    'NGL': 'NGL', 'Relationship': 'Crush', 'Friends': 'Hot take',
    'Personal Thoughts': 'Secret', 'Feelings': 'Feelings',
    'Study': 'Study', 'College': 'College', 'Others': 'Others',
    'Career': 'Career', 'Mental Health': 'Mental Health', 'Family': 'Family',
};

const REPRESENTATIVE_CONFESSIONS = [
    { _id: 'd1', text: "I've been secretly learning guitar for eight months just to surprise my best friend at their wedding.", anonName: "Melodic Ghost", anonAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", mood: "Personal Thoughts", createdAt: new Date(Date.now() - 3600000).toISOString(), reactions: { '❤️': ['u1', 'u2', 'u3'], '🔥': ['u4', 'u5'] }, commentCount: 7 },
    { _id: 'd2', text: "I actually prefer working alone. I get so much more done. I just smile and say 'teamwork is great' in every meeting.", anonName: "Cozy Ninja", anonAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka", mood: "NGL", createdAt: new Date(Date.now() - 7200000).toISOString(), reactions: { '😂': ['u1', 'u2', 'u3', 'u4'] }, commentCount: 12 },
    { _id: 'd3', text: "I once accidentally sent a voice note complaining about my manager to my manager's personal number.", anonName: "Panic Pixel", anonAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Harley", mood: "Others", createdAt: new Date(Date.now() - 86400000).toISOString(), reactions: { '😮': ['u1', 'u2'], '😂': ['u3', 'u4'] }, commentCount: 23 },
    { _id: 'd4', text: "I still have feelings for someone from three years ago. We talked every day. I never told them. I probably never will.", anonName: "Silent Heart", anonAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha", mood: "Relationship", createdAt: new Date(Date.now() - 172800000).toISOString(), reactions: { '❤️': ['u1', 'u2', 'u3', 'u4', 'u5'], '😢': ['u6', 'u7'] }, commentCount: 31 },
    { _id: 'd5', text: "I laugh at my friends' jokes even when I don't get them. I've been doing it so long I'm not sure what genuine laughter feels like anymore.", anonName: "Social Chameleon", anonAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Toby", mood: "Friends", createdAt: new Date(Date.now() - 259200000).toISOString(), reactions: { '😢': ['u1', 'u2', 'u3'] }, commentCount: 8 },
    { _id: 'd6', text: "I'm terrified of failure. But I've learned to wear confidence like a costume. Most days it works.", anonName: "Shadow Soul", anonAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna", mood: "Feelings", createdAt: new Date(Date.now() - 300000).toISOString(), reactions: { '❤️': ['u1', 'u2'], '🔥': ['u3'] }, commentCount: 15 },
    { _id: 'd7', text: "I said I was fine so many times that I started believing it. I wasn't fine.", anonName: "Quiet Storm", anonAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=River", mood: "Mental Health", createdAt: new Date(Date.now() - 432000000).toISOString(), reactions: { '❤️': ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'] }, commentCount: 44 },
    { _id: 'd8', text: "I turned down a dream job offer because it would have meant moving away from a relationship that ended three months later anyway.", anonName: "Hindsight Fox", anonAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ember", mood: "Career", createdAt: new Date(Date.now() - 518400000).toISOString(), reactions: { '😮': ['u1', 'u2', 'u3'] }, commentCount: 19 },
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
    "https://api.dicebear.com/7.x/avataaars/svg?seed=River",
];

const ANON_NAMES = ["Silent Voyager", "Hidden Echo", "Quiet Dreamer", "Mystic Shadow", "Soft Static", "Pale Signal"];

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

/* ─── Preloader ─── */
function Preloader({ onDone }) {
    const [count, setCount] = useState(0);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) { onDone(); return; }

        const DURATION = 1100;
        const start = performance.now();
        let assetsReady = false;

        const fontsReady = (document.fonts && document.fonts.ready)
            ? document.fonts.ready : Promise.resolve();
        const pageLoaded = (document.readyState === 'complete')
            ? Promise.resolve()
            : new Promise(r => window.addEventListener('load', r, { once: true }));
        const cap = new Promise(r => setTimeout(r, 3500));

        Promise.race([Promise.all([fontsReady, pageLoaded]), cap])
            .then(() => { assetsReady = true; });

        const tick = (now) => {
            const progress = Math.min((now - start) / DURATION, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            let n = Math.round(eased * 100);
            if (!assetsReady) n = Math.min(n, 99);
            setCount(n);
            if (progress < 1 || !assetsReady) {
                requestAnimationFrame(tick);
            } else {
                setTimeout(() => {
                    setLeaving(true);
                    setTimeout(onDone, 700);
                }, 200);
            }
        };
        requestAnimationFrame(tick);
    }, [onDone]);

    return (
        <div className={`${styles.preloader} ${leaving ? styles.preloaderOut : ''}`} aria-hidden="true">
            <span className={styles.preloaderCount}>{String(count).padStart(2, '0')}</span>
            <div className={styles.preloaderBar} />
        </div>
    );
}

/* ─── Wall Card ─── */
function WallCard({ confession, index }) {
    return (
        <div className={styles.wallCard} style={{ animationDelay: `${index * 0.08}s` }}>
            <div className={styles.wallCardTop}>
                <img src={confession.anonAvatar} alt="" className={styles.wallAvatar} />
                <div className={styles.wallMeta}>
                    <span className={styles.wallName}>{confession.anonName}</span>
                    <span className={styles.wallTime}>{timeAgo(confession.createdAt)}</span>
                </div>
                <span className={styles.wallMood}>{MOOD_LABELS[confession.mood] || confession.mood}</span>
            </div>
            <p className={styles.wallText}>{confession.text}</p>
            <div className={styles.wallFooter}>
                {Object.entries(confession.reactions || {}).slice(0, 2).map(([emoji, users]) => (
                    <span key={emoji} className={styles.wallReaction}>{emoji} {users.length}</span>
                ))}
                <span className={styles.wallComment}>💬 {confession.commentCount}</span>
            </div>
        </div>
    );
}

/* ─── Confession Composer ─── */
function ConfessionComposer() {
    const [text, setText] = useState('');
    const [phase, setPhase] = useState('idle');
    const [anonName, setAnonName] = useState(ANON_NAMES[0]);
    const [anonAvatar, setAnonAvatar] = useState(AVATARS[0]);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const textareaRef = useRef(null);
    const autoTypingRef = useRef(null);

    useEffect(() => {
        if (phase !== 'idle') return;
        const placeholder = HERO_PLACEHOLDER_TEXTS[placeholderIndex];
        let i = 0;
        const typeInterval = setInterval(() => {
            i++;
            setCharIndex(i);
            if (i >= placeholder.length) {
                clearInterval(typeInterval);
                autoTypingRef.current = setTimeout(() => {
                    setCharIndex(0);
                    setPlaceholderIndex(prev => (prev + 1) % HERO_PLACEHOLDER_TEXTS.length);
                }, 3200);
            }
        }, 42);
        return () => {
            clearInterval(typeInterval);
            clearTimeout(autoTypingRef.current);
        };
    }, [phase, placeholderIndex]);

    const handleTextChange = (e) => {
        setText(e.target.value);
        if (phase === 'idle') setPhase('typing');
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
            <div className={styles.composerBar}>
                <span className={styles.composerStatus}>
                    <span className={styles.statusDot} />
                    anonymous
                </span>
                {phase === 'anonymized' && (
                    <button className={styles.composerRetry} onClick={handleReset}>
                        Try again
                    </button>
                )}
            </div>

            {phase !== 'anonymized' ? (
                <>
                    <div className={styles.composerPrompt}>What's on your mind?</div>
                    <div className={styles.textareaWrap}>
                        <textarea
                            ref={textareaRef}
                            className={styles.composerArea}
                            value={displayText}
                            onChange={handleTextChange}
                            readOnly={phase === 'idle'}
                            placeholder=""
                            rows={5}
                            onClick={() => {
                                if (phase === 'idle') {
                                    setPhase('typing');
                                    setTimeout(() => textareaRef.current?.focus(), 0);
                                }
                            }}
                        />
                        {phase === 'idle' && <span className={styles.blinkCursor} aria-hidden="true" />}
                    </div>
                    <div className={styles.composerFooter}>
                        <span className={styles.composerHint}>
                            {phase === 'idle'
                                ? 'Click to write your own'
                                : text.length > 0
                                    ? `${1000 - text.length} characters left`
                                    : 'Start typing...'}
                        </span>
                        <button
                            className={styles.composerSubmit}
                            data-magnetic
                            onClick={phase === 'idle'
                                ? () => { setPhase('typing'); setTimeout(() => textareaRef.current?.focus(), 0); }
                                : handleAnonymize}
                            disabled={phase === 'typing' && !text.trim()}
                        >
                            {phase === 'idle' ? 'Write yours' : 'Post anonymously'}
                        </button>
                    </div>
                </>
            ) : (
                <div className={styles.anonResult}>
                    <div className={styles.resultLabel}>Your confession, posted as:</div>
                    <div className={styles.resultCard}>
                        <div className={styles.resultCardTop}>
                            <img src={anonAvatar} alt="" className={styles.resultAvatar} />
                            <div>
                                <span className={styles.resultName}>{anonName}</span>
                                <span className={styles.resultTime}>Just now</span>
                            </div>
                        </div>
                        <p className={styles.resultText}>{text}</p>
                        <div className={styles.resultCardFooter}>
                            <span className={styles.resultReaction}>❤️ 0</span>
                            <span className={styles.resultReaction}>💬 0</span>
                        </div>
                    </div>
                    <p className={styles.resultNote}>Your name is gone. That's the whole point.</p>
                    <a href={`${API_URL}/auth/google`} className={styles.resultCta} id="composer-cta" data-magnetic data-whisper="Sign in free">
                        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Start confessing with Google
                    </a>
                </div>
            )}
        </div>
    );
}

/* ─── Main page animations hook ─── */
function usePageAnimations(pageLoaded) {
    const wallTrackRef = useRef(null);

    useEffect(() => {
        if (!pageLoaded) return;

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const finePointer = window.matchMedia('(pointer: fine)').matches;

        /* ── 1. Scroll reveals ── */
        const revealTargets = document.querySelectorAll('[data-reveal]');
        if ('IntersectionObserver' in window) {
            const revealObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-in');
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
            revealTargets.forEach(el => revealObserver.observe(el));
        } else {
            revealTargets.forEach(el => el.classList.add('is-in'));
        }

        if (prefersReduced) return;

        /* ── 2. Letter cascade on hero headline ── */
        const splitLetters = (el) => {
            if (!el || el.dataset.split) return;
            el.dataset.split = '1';
            const text = el.textContent;
            el.textContent = '';
            let i = 0;
            for (const ch of text) {
                const span = document.createElement('span');
                span.className = 'ltr-cascade';
                span.style.setProperty('--i', i++);
                span.textContent = ch === ' ' ? '\u00A0' : ch;
                el.appendChild(span);
            }
        };

        document.querySelectorAll('[data-letter-split]').forEach(splitLetters);
        // trigger the cascade after a tiny delay so the DOM is painted
        setTimeout(() => {
            document.querySelectorAll('[data-letter-split]').forEach(el => {
                el.classList.add('cascade-in');
            });
        }, 80);

        /* ── 3. Custom cursor ── */
        const cursor = document.getElementById('ch-cursor');
        const cursorLabel = document.getElementById('ch-cursor-label');

        if (cursor && finePointer) {
            let tx = -100, ty = -100, x = -100, y = -100;
            let rafActive = false;
            let pillW = 0, pillOffY = 0, pillShiftX = 0;
            let whisperOn = false;
            let lastWhisperEl = null;

            const applyPill = () => {
                cursor.style.width = `${pillW}px`;
                cursor.style.height = '30px';
            };
            const clearPill = () => {
                cursor.style.width = '';
                cursor.style.height = '';
            };

            const renderCursor = () => {
                x += (tx - x) * 0.2;
                y += (ty - y) * 0.2;

                const offTarget = whisperOn ? (ty < 60 ? -32 : 24) : 0;
                pillOffY += (offTarget - pillOffY) * 0.2;
                let shiftTarget = 0;
                if (whisperOn) {
                    const half = pillW / 2 + 10;
                    if (tx < half) shiftTarget = half - tx;
                    else if (tx > window.innerWidth - half) shiftTarget = window.innerWidth - half - tx;
                }
                pillShiftX += (shiftTarget - pillShiftX) * 0.2;

                cursor.style.transform =
                    `translate(${(x + pillShiftX).toFixed(1)}px, ${(y - pillOffY).toFixed(1)}px) translate(-50%, -50%)`;

                requestAnimationFrame(renderCursor);
            };

            window.addEventListener('mousemove', (e) => {
                tx = e.clientX;
                ty = e.clientY;
                if (!rafActive) {
                    rafActive = true;
                    x = tx; y = ty;
                    cursor.classList.add('is-visible');
                    requestAnimationFrame(renderCursor);
                }
            }, { passive: true });

            document.addEventListener('mouseover', (e) => {
                const interactive = e.target.closest('a, button, [data-cursor]');
                let whisperEl = null;
                if (interactive && interactive.hasAttribute('data-whisper')) {
                    whisperEl = interactive;
                } else if (!interactive) {
                    whisperEl = e.target.closest('[data-whisper]');
                }

                if (whisperEl && cursorLabel) {
                    if (whisperEl !== lastWhisperEl) {
                        const variants = (whisperEl.dataset.whisper || '').split('||');
                        const idx = Number(whisperEl.dataset.whisperIdx || 0) % variants.length;
                        cursorLabel.textContent = variants[idx].trim();
                        whisperEl.dataset.whisperIdx = String((idx + 1) % variants.length);
                    }
                    pillW = Math.ceil(cursorLabel.offsetWidth) + 36;
                    applyPill();
                    whisperOn = true;
                } else {
                    if (whisperOn) clearPill();
                    whisperOn = false;
                }
                lastWhisperEl = whisperEl;
                cursor.classList.toggle('is-whisper', whisperOn);
                cursor.classList.toggle('is-link', Boolean(interactive) && !whisperOn);
            });

            document.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
            document.addEventListener('mouseenter', () => cursor.classList.add('is-visible'));
        }

        /* ── 4. Magnetic buttons ── */
        if (finePointer) {
            const magneticEls = document.querySelectorAll('[data-magnetic]');
            magneticEls.forEach(btn => {
                btn.addEventListener('mousemove', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const dx = e.clientX - (rect.left + rect.width / 2);
                    const dy = e.clientY - (rect.top + rect.height / 2);
                    btn.style.transform = `translate(${(dx * 0.26).toFixed(1)}px, ${(dy * 0.34).toFixed(1)}px)`;
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = '';
                });
            });
        }

        /* ── 5. Velocity shear + JS marquee RAF loop ── */
        const shearTargets = [
            document.querySelector('[data-shear]'),
            document.querySelector('[data-shear-interrupt]'),
        ].filter(Boolean);

        const wallTrack = document.getElementById('ch-wall-track');
        let marqueeX = 0;
        let marqueeHalf = 0;
        if (wallTrack && wallTrack.children.length) {
            // half = width of one set (not doubled)
            marqueeHalf = wallTrack.scrollWidth / 2;
        }

        let lastY = window.scrollY;
        let velocity = 0;
        let lastTime = performance.now();
        let skewed = false;

        const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

        const loop = (now) => {
            const dt = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;

            const y = window.scrollY;
            const raw = y - lastY;
            lastY = y;
            velocity += (raw - velocity) * 0.12;

            /* Shear */
            const deg = clamp(velocity * 0.055, -3, 3);
            if (Math.abs(deg) > 0.05) {
                const t = `skewY(${deg.toFixed(3)}deg)`;
                shearTargets.forEach(el => { el.style.transform = t; });
                skewed = true;
            } else if (skewed) {
                shearTargets.forEach(el => { el.style.transform = ''; });
                skewed = false;
            }

            /* Marquee */
            if (wallTrack && marqueeHalf > 0) {
                const speed = 36 + clamp(velocity * 60 * 0.14, -600, 600);
                marqueeX = (marqueeX + speed * dt) % marqueeHalf;
                if (marqueeX < 0) marqueeX += marqueeHalf;
                wallTrack.style.transform = `translate3d(${(-marqueeX).toFixed(1)}px,0,0)`;
            }

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);

        /* Update marqueeHalf on resize */
        const onResize = () => {
            if (wallTrack) marqueeHalf = wallTrack.scrollWidth / 2;
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);

    }, [pageLoaded]);
}

/* ─── Main LandingPage ─── */
export default function LandingPage() {
    const [loaded, setLoaded] = useState(false);
    const doubled = [...REPRESENTATIVE_CONFESSIONS, ...REPRESENTATIVE_CONFESSIONS];

    usePageAnimations(loaded);

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
                el.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#0a0a0a;border:1px solid rgba(255,255,255,0.12);color:#f0ede8;padding:1rem 1.75rem;border-radius:10px;font-weight:500;font-size:0.9rem;z-index:99999;animation:toastSlide 0.4s cubic-bezier(0.34,1.56,0.64,1)';
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

            {/* ─── PRELOADER ─── */}
            {!loaded && <Preloader onDone={() => setLoaded(true)} />}

            {/* ─── CUSTOM CURSOR ─── */}
            <div id="ch-cursor" className={styles.cursor} aria-hidden="true">
                <span id="ch-cursor-label" className={styles.cursorLabel} />
            </div>

            {/* ─── NAV ─── */}
            <nav className={styles.nav}>
                <span className={styles.navBrand}>ConfessHere</span>
                <a
                    href={`${API_URL}/auth/google`}
                    className={styles.navCta}
                    id="nav-cta"
                    data-magnetic
                    data-whisper="It's free"
                >
                    Start Confessing
                </a>
            </nav>

            {/* ─── HERO ─── */}
            <section className={styles.hero} id="hero">
                <div className={styles.heroInner} data-shear>
                    <h1
                        className={styles.heroHeadline}
                        data-letter-split
                        data-reveal
                    >
                        Say what you can't say anywhere else.
                    </h1>
                    <p className={styles.heroSub} data-reveal>
                        Write what's on your mind. Share it without your name attached.
                    </p>
                    <ConfessionComposer />
                    <p className={styles.heroDisclaimer} data-reveal>
                        Sign in with Google · Your real name never appears on the platform
                    </p>
                </div>
            </section>

            {/* ─── EDITORIAL INTERRUPTION ─── */}
            <section className={styles.interrupt} aria-label="Product philosophy">
                <div className={styles.interruptInner} data-shear-interrupt>
                    <p className={styles.interruptLine} data-reveal>No profile to maintain.</p>
                    <p className={styles.interruptLine} data-reveal>No followers to impress.</p>
                    <p className={`${styles.interruptLine} ${styles.interruptLineAccent}`} data-reveal>
                        Just something you needed to say.
                    </p>
                </div>
            </section>

            {/* ─── CONFESSION WALL ─── */}
            <section className={styles.wall}>
                <div className={styles.wallLabel}>
                    Representative examples — real posts look exactly like these
                </div>
                <div className={styles.wallScroll}>
                    <div className={styles.wallTrack} id="ch-wall-track">
                        {doubled.map((c, i) => (
                            <WallCard key={`${c._id}-${i}`} confession={c} index={i} />
                        ))}
                    </div>
                </div>
                <div className={styles.wallFadeLeft} aria-hidden="true" />
                <div className={styles.wallFadeRight} aria-hidden="true" />
            </section>

            {/* ─── WHY THIS EXISTS ─── */}
            <section className={styles.why}>
                <div className={styles.whyInner}>
                    <div className={styles.whyQuote} data-reveal>
                        "Some thoughts are hard to say because saying them publicly means
                        attaching your name to them."
                    </div>
                    <div className={styles.whyBody} data-reveal>
                        <p>
                            Most places you share something, you become the story.
                            Your name, your face, your history — they follow the words.
                        </p>
                        <p>
                            ConfessHere separates the thought from the person.
                            Your confession enters a space where it can exist honestly —
                            read, reacted to, and understood — without you becoming the subject.
                        </p>
                        <p>
                            It's not about hiding. It's about speaking without
                            the weight of being known.
                        </p>
                    </div>
                </div>
            </section>

            {/* ─── FINAL CTA ─── */}
            <section className={styles.cta}>
                <div className={styles.ctaInner} data-reveal>
                    <h2 className={styles.ctaHeadline}>
                        Maybe you just<br />need to say it.
                    </h2>
                    <p className={styles.ctaSub}>
                        Write what's on your mind.<br />Your name stays out of it.
                    </p>
                    <a
                        href={`${API_URL}/auth/google`}
                        className={styles.ctaBtn}
                        id="footer-cta"
                        data-magnetic
                        data-whisper="Anonymous · Free"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </a>
                    <p className={styles.ctaDisclaimer}>
                        Google is used for authentication only. Your real identity never shows on the platform.
                    </p>
                </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <span className={styles.footerBrand}>ConfessHere</span>
                    <span className={styles.footerSep}>·</span>
                    <span className={styles.footerDomain}>confessit.online</span>
                    <span className={styles.footerSep}>·</span>
                    <span className={styles.footerNote}>A space for honest, anonymous expression</span>
                </div>
                <p className={styles.footerCopy}>© 2025 ConfessHere</p>
            </footer>
        </div>
    );
}
