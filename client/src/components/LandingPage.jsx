import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './LandingPage.module.css';
import './LandingPage.animations.css';

const API_URL = import.meta.env.VITE_API_URL || '';

/* ─── Data ─── */
const MOOD_LABELS = {
    'NGL':'NGL','Relationship':'Crush','Friends':'Hot take',
    'Personal Thoughts':'Secret','Feelings':'Feelings','Study':'Study',
    'College':'College','Others':'Others','Career':'Career',
    'Mental Health':'Mental Health','Family':'Family',
};

const WALL_CONFESSIONS = [
    { _id:'d1', text:"I've been secretly learning guitar for eight months just to surprise my best friend at their wedding.", anonName:"Melodic Ghost", anonAvatar:"https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", mood:"Personal Thoughts", createdAt:new Date(Date.now()-3600000).toISOString(), reactions:{'❤️':['u1','u2','u3'],'🔥':['u4','u5']}, commentCount:7 },
    { _id:'d2', text:"I actually prefer working alone. I just smile and say 'teamwork is great' in every meeting.", anonName:"Cozy Ninja", anonAvatar:"https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka", mood:"NGL", createdAt:new Date(Date.now()-7200000).toISOString(), reactions:{'😂':['u1','u2','u3','u4']}, commentCount:12 },
    { _id:'d3', text:"I once accidentally sent a voice note complaining about my manager to my manager's personal number.", anonName:"Panic Pixel", anonAvatar:"https://api.dicebear.com/7.x/avataaars/svg?seed=Harley", mood:"Others", createdAt:new Date(Date.now()-86400000).toISOString(), reactions:{'😮':['u1','u2'],'😂':['u3','u4']}, commentCount:23 },
    { _id:'d4', text:"I still have feelings for someone from three years ago. I never told them. I probably never will.", anonName:"Silent Heart", anonAvatar:"https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha", mood:"Relationship", createdAt:new Date(Date.now()-172800000).toISOString(), reactions:{'❤️':['u1','u2','u3','u4','u5'],'😢':['u6','u7']}, commentCount:31 },
    { _id:'d5', text:"I laugh at my friends' jokes even when I don't get them. I've been doing it so long I'm not sure what genuine laughter feels like anymore.", anonName:"Social Chameleon", anonAvatar:"https://api.dicebear.com/7.x/avataaars/svg?seed=Toby", mood:"Friends", createdAt:new Date(Date.now()-259200000).toISOString(), reactions:{'😢':['u1','u2','u3']}, commentCount:8 },
    { _id:'d6', text:"I'm terrified of failure. But I've learned to wear confidence like a costume. Most days it works.", anonName:"Shadow Soul", anonAvatar:"https://api.dicebear.com/7.x/avataaars/svg?seed=Luna", mood:"Feelings", createdAt:new Date(Date.now()-300000).toISOString(), reactions:{'❤️':['u1','u2'],'🔥':['u3']}, commentCount:15 },
    { _id:'d7', text:"I said I was fine so many times that I started believing it. I wasn't fine.", anonName:"Quiet Storm", anonAvatar:"https://api.dicebear.com/7.x/avataaars/svg?seed=River", mood:"Mental Health", createdAt:new Date(Date.now()-432000000).toISOString(), reactions:{'❤️':['u1','u2','u3','u4','u5','u6']}, commentCount:44 },
    { _id:'d8', text:"I turned down a dream job offer because it would've meant moving away from a relationship that ended three months later anyway.", anonName:"Hindsight Fox", anonAvatar:"https://api.dicebear.com/7.x/avataaars/svg?seed=Ember", mood:"Career", createdAt:new Date(Date.now()-518400000).toISOString(), reactions:{'😮':['u1','u2','u3']}, commentCount:19 },
    { _id:'d9', text:"I've been carrying guilt about something I did in middle school for 11 years. The other person probably doesn't even remember.", anonName:"Long Memory", anonAvatar:"https://api.dicebear.com/7.x/avataaars/svg?seed=Ghost", mood:"Personal Thoughts", createdAt:new Date(Date.now()-604800000).toISOString(), reactions:{'❤️':['u1','u2'],'😮':['u3']}, commentCount:6 },
    { _id:'d10', text:"I pretend to be bad at cooking so I don't have to do it. I've been cooking for my whole family in secret for years.", anonName:"Hidden Chef", anonAvatar:"https://api.dicebear.com/7.x/avataaars/svg?seed=Cook", mood:"Family", createdAt:new Date(Date.now()-691200000).toISOString(), reactions:{'😂':['u1','u2','u3','u4']}, commentCount:33 },
];

const HERO_PLACEHOLDER_TEXTS = [
    "I've been pretending to be okay for so long I forgot what okay actually feels like...",
    "I still think about what would have happened if I'd taken that job offer...",
    "I don't actually enjoy the things I tell people I enjoy. I just didn't want to be left out.",
    "Sometimes I rehearse conversations in my head that I'll never have in real life.",
    "I've never told anyone this, but I cried for an hour after I got the promotion I worked years for.",
];

const AVATARS = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Harley",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=River",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Moon",
];

const ANON_NAMES = ["Silent Voyager","Hidden Echo","Quiet Dreamer","Mystic Shadow","Soft Static","Pale Signal","Ghost Ink","Nameless"];

const STATS = [
    { value: 12400, suffix: '+', label: 'confessions shared', desc: '…and counting' },
    { value: 100, suffix: '%', label: 'anonymous', desc: 'your name never appears' },
    { value: 3, suffix: 's', label: 'to post', desc: 'write · anonymize · share' },
];

const CATEGORIES = [
    { emoji: '💔', label: 'Relationships', sub: 'Feelings you can\'t speak' },
    { emoji: '🔥', label: 'Hot Takes', sub: 'Thoughts too honest for dinner' },
    { emoji: '🧠', label: 'Mental Health', sub: 'What you carry quietly' },
    { emoji: '🎓', label: 'College Life', sub: 'Campus truths, campus lies' },
    { emoji: '👥', label: 'Friends', sub: 'What you\'d never say to their face' },
    { emoji: '💼', label: 'Work & Career', sub: 'Office secrets, career doubts' },
    { emoji: '😔', label: 'Personal', sub: 'Your deepest private thoughts' },
    { emoji: '👨‍👩‍👧', label: 'Family', sub: 'Things left unsaid at home' },
];

const TRUST_ITEMS = [
    { icon: '🔐', title: 'Google login prevents bots, not tracks you', body: 'We use Google only to prevent spam. We never connect your identity to what you write.' },
    { icon: '🎭', title: 'New persona, every confession', body: 'Each post gets a random name and avatar. Nothing links back to your account.' },
    { icon: '🗑️', title: 'Delete everything, anytime', body: 'Delete your account and every confession you wrote vanishes permanently.' },
    { icon: '🚫', title: 'Zero ad tracking', body: 'We don\'t run ads. We don\'t sell your data. ConfessHere is supported by users, not advertisers.' },
];

const TICKER_TEXT = "Say it  ·  Stay anonymous  ·  No judgment  ·  Be heard  ·  100% private  ·  Real feelings  ·  Unfiltered truth  ·  You're not alone  ·  ";

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
}

/* ─── Preloader ─── */
function Preloader({ onDone }) {
    const [count, setCount] = useState(0);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) { onDone(); return; }

        const DURATION = 1300;
        const start = performance.now();
        let assetsReady = false;

        const fontsReady = document.fonts?.ready ?? Promise.resolve();
        const pageReady = document.readyState === 'complete'
            ? Promise.resolve()
            : new Promise(r => window.addEventListener('load', r, { once: true }));

        Promise.race([Promise.all([fontsReady, pageReady]), new Promise(r => setTimeout(r, 3500))])
            .then(() => { assetsReady = true; });

        const tick = (now) => {
            const progress = Math.min((now - start) / DURATION, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            let n = Math.round(eased * 100);
            if (!assetsReady) n = Math.min(n, 99);
            setCount(n);
            if (progress < 1 || !assetsReady) requestAnimationFrame(tick);
            else setTimeout(() => { setLeaving(true); setTimeout(onDone, 720); }, 160);
        };
        requestAnimationFrame(tick);
    }, [onDone]);

    return (
        <div className={`${styles.preloader} ${leaving ? styles.preloaderOut : ''}`} aria-hidden="true">
            <div className={styles.preloaderBody}>
                <span className={styles.preloaderCount}>{String(count).padStart(2, '0')}</span>
                <span className={styles.preloaderWord}>Loading</span>
            </div>
            <div className={styles.preloaderBar}>
                <div className={styles.preloaderFill} />
            </div>
        </div>
    );
}

/* ─── Wall Card ─── */
function WallCard({ confession }) {
    const cardRef = useRef(null);

    const handleMouseMove = useCallback((e) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        card.style.transform = `perspective(600px) rotateX(${(-dy * 5).toFixed(2)}deg) rotateY(${(dx * 5).toFixed(2)}deg) translateY(-2px)`;
        card.style.boxShadow = `${(-dx * 8).toFixed(1)}px ${(-dy * 8).toFixed(1)}px 28px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)`;
    }, []);

    const handleMouseLeave = useCallback(() => {
        const card = cardRef.current;
        if (!card) return;
        card.style.transform = '';
        card.style.boxShadow = '';
    }, []);

    return (
        <div
            ref={cardRef}
            className={styles.wallCard}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}
        >
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
    const timerRef = useRef(null);

    useEffect(() => {
        if (phase !== 'idle') return;
        const placeholder = HERO_PLACEHOLDER_TEXTS[placeholderIndex];
        let i = 0;
        const iv = setInterval(() => {
            i++;
            setCharIndex(i);
            if (i >= placeholder.length) {
                clearInterval(iv);
                timerRef.current = setTimeout(() => {
                    setCharIndex(0);
                    setPlaceholderIndex(p => (p + 1) % HERO_PLACEHOLDER_TEXTS.length);
                }, 3000);
            }
        }, 38);
        return () => { clearInterval(iv); clearTimeout(timerRef.current); };
    }, [phase, placeholderIndex]);

    const handleChange = (e) => { setText(e.target.value); if (phase==='idle') setPhase('typing'); };

    const handleAnonymize = () => {
        if (!text.trim()) return;
        setAnonName(ANON_NAMES[Math.floor(Math.random() * ANON_NAMES.length)]);
        setAnonAvatar(AVATARS[Math.floor(Math.random() * AVATARS.length)]);
        setPhase('anonymized');
    };

    const handleReset = () => { setText(''); setPhase('idle'); setCharIndex(0); };

    const displayText = phase === 'idle'
        ? HERO_PLACEHOLDER_TEXTS[placeholderIndex].slice(0, charIndex)
        : text;

    return (
        <div className={styles.composer}>
            <div className={styles.composerBar}>
                <span className={styles.composerStatus}>
                    <span className={styles.statusDot} />
                    anonymous mode
                </span>
                {phase === 'anonymized' && (
                    <button className={styles.composerRetry} onClick={handleReset}>Try again</button>
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
                            onChange={handleChange}
                            readOnly={phase === 'idle'}
                            placeholder=""
                            rows={5}
                            maxLength={1000}
                            onClick={() => { if (phase==='idle') { setPhase('typing'); setTimeout(() => textareaRef.current?.focus(), 0); } }}
                        />
                        {phase === 'idle' && <span className={styles.blinkCursor} aria-hidden="true" />}
                    </div>
                    <div className={styles.composerFooter}>
                        <span className={styles.composerHint}>
                            {phase === 'idle' ? 'Click to write your own'
                                : text.length > 0 ? `${1000 - text.length} left`
                                : 'Start typing…'}
                        </span>
                        {phase === 'typing' && text.length > 0 && (
                            <div className={styles.charRing}>
                                <svg width="28" height="28" viewBox="0 0 28 28">
                                    <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2"/>
                                    <circle cx="14" cy="14" r="11" fill="none" stroke={text.length > 900 ? '#ef4444' : '#3b82f6'} strokeWidth="2"
                                        strokeDasharray={`${(text.length / 1000) * 69.1} 69.1`}
                                        strokeLinecap="round" transform="rotate(-90 14 14)"
                                        style={{ transition: 'stroke-dasharray 0.1s, stroke 0.2s' }}
                                    />
                                </svg>
                            </div>
                        )}
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
                    <a href={`${API_URL}/auth/google`} className={styles.resultCta} id="composer-cta" data-magnetic data-whisper="Free forever">
                        <GoogleIcon />
                        Start confessing with Google
                    </a>
                </div>
            )}
        </div>
    );
}

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
    );
}

/* ─── Animation Hook ─── */
function usePageAnimations(pageLoaded) {
    useEffect(() => {
        if (!pageLoaded) return;

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const finePointer = window.matchMedia('(pointer: fine)').matches;

        /* 1. Scroll reveals */
        const revealObs = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
        document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));

        /* 2. Hero line reveal (clip-path) */
        setTimeout(() => {
            document.querySelectorAll('[data-hero-line]').forEach(el => el.classList.add('is-in'));
        }, 100);

        /* 3. Stat counters */
        const statObs = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                obs.unobserve(entry.target);
                entry.target.classList.add('is-in');
                const numEl = entry.target.querySelector('[data-count]');
                if (!numEl) return;
                const target = parseInt(numEl.dataset.count, 10);
                const dur = 1800;
                const start = performance.now();
                const tick = (now) => {
                    const t = Math.min((now - start) / dur, 1);
                    const eased = 1 - Math.pow(1 - t, 4);
                    numEl.textContent = Math.round(eased * target).toLocaleString();
                    if (t < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            });
        }, { threshold: 0.5 });
        document.querySelectorAll('[data-stat]').forEach(el => statObs.observe(el));

        /* 4. Trust checklist items */
        const trustObs = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        document.querySelectorAll('[data-trust-item]').forEach(el => trustObs.observe(el));

        if (prefersReduced) return;

        /* 5. Letter cascade on category headings */
        document.querySelectorAll('[data-letter-split]').forEach(el => {
            if (el.dataset.split) return;
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
        });
        setTimeout(() => {
            document.querySelectorAll('[data-letter-split]').forEach(el => el.classList.add('cascade-in'));
        }, 120);

        /* 6. Custom cursor */
        const cursor = document.getElementById('ch-cursor');
        const cursorLabel = document.getElementById('ch-cursor-label');

        if (cursor && finePointer) {
            let tx = -200, ty = -200, x = -200, y = -200;
            let rafActive = false;
            let pillW = 0, pillOffY = 0, pillShiftX = 0;
            let whisperOn = false, lastWhisperEl = null;

            const applyPill = () => { cursor.style.width=`${pillW}px`; cursor.style.height='30px'; };
            const clearPill = () => { cursor.style.width=''; cursor.style.height=''; };

            const renderCursor = () => {
                x += (tx - x) * 0.2; y += (ty - y) * 0.2;
                const offTarget = whisperOn ? (ty < 60 ? -32 : 26) : 0;
                pillOffY += (offTarget - pillOffY) * 0.2;
                let shiftTarget = 0;
                if (whisperOn) {
                    const half = pillW / 2 + 10;
                    if (tx < half) shiftTarget = half - tx;
                    else if (tx > window.innerWidth - half) shiftTarget = window.innerWidth - half - tx;
                }
                pillShiftX += (shiftTarget - pillShiftX) * 0.2;
                cursor.style.transform = `translate(${(x+pillShiftX).toFixed(1)}px,${(y-pillOffY).toFixed(1)}px) translate(-50%,-50%)`;
                requestAnimationFrame(renderCursor);
            };

            window.addEventListener('mousemove', (e) => {
                tx = e.clientX; ty = e.clientY;
                if (!rafActive) { rafActive=true; x=tx; y=ty; cursor.classList.add('is-visible'); requestAnimationFrame(renderCursor); }
            }, { passive: true });

            document.addEventListener('mouseover', (e) => {
                const interactive = e.target.closest('a, button, [data-cursor]');
                let whisperEl = (interactive?.hasAttribute('data-whisper')) ? interactive : (!interactive ? e.target.closest('[data-whisper]') : null);

                if (whisperEl && cursorLabel) {
                    if (whisperEl !== lastWhisperEl) {
                        const variants = (whisperEl.dataset.whisper || '').split('||');
                        const idx = Number(whisperEl.dataset.whisperIdx||0) % variants.length;
                        cursorLabel.textContent = variants[idx].trim();
                        whisperEl.dataset.whisperIdx = String((idx+1) % variants.length);
                    }
                    pillW = Math.ceil(cursorLabel.offsetWidth) + 36;
                    applyPill(); whisperOn = true;
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

        /* 7. Magnetic buttons */
        if (finePointer) {
            document.querySelectorAll('[data-magnetic]').forEach(btn => {
                btn.addEventListener('mousemove', (e) => {
                    const r = btn.getBoundingClientRect();
                    const dx = e.clientX - (r.left + r.width/2);
                    const dy = e.clientY - (r.top + r.height/2);
                    btn.style.transform = `translate(${(dx*0.28).toFixed(1)}px,${(dy*0.36).toFixed(1)}px)`;
                });
                btn.addEventListener('mouseleave', () => { btn.style.transform=''; });
            });
        }

        /* 8. RAF loop: shear + marquee + progress + nav */
        const shearEls = document.querySelectorAll('[data-shear]');
        const wallTrack = document.getElementById('ch-wall-track');
        const progressEl = document.getElementById('ch-progress');
        const navEl = document.getElementById('ch-nav');

        let marqueeX = 0;
        let marqueeHalf = wallTrack ? wallTrack.scrollWidth / 2 : 0;
        let lastY = window.scrollY, velocity = 0, lastTime = performance.now(), skewed = false;

        const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
        const maxScroll = () => Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);

        const loop = (now) => {
            const dt = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;
            const y = window.scrollY;
            const raw = y - lastY;
            lastY = y;
            velocity += (raw - velocity) * 0.12;

            const deg = clamp(velocity * 0.055, -3, 3);
            if (Math.abs(deg) > 0.05) {
                const t = `skewY(${deg.toFixed(3)}deg)`;
                shearEls.forEach(el => { el.style.transform = t; });
                skewed = true;
            } else if (skewed) {
                shearEls.forEach(el => { el.style.transform = ''; });
                skewed = false;
            }

            if (wallTrack && marqueeHalf > 0) {
                const speed = 40 + clamp(velocity * 50 * 0.15, -500, 500);
                marqueeX = (marqueeX + speed * dt) % marqueeHalf;
                if (marqueeX < 0) marqueeX += marqueeHalf;
                wallTrack.style.transform = `translate3d(${(-marqueeX).toFixed(1)}px,0,0)`;
            }

            if (progressEl) progressEl.style.transform = `scaleX(${clamp(y/maxScroll(),0,1).toFixed(4)})`;
            if (navEl) navEl.classList.toggle('nav-scrolled', y > 50);

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);

        const onResize = () => { if (wallTrack) marqueeHalf = wallTrack.scrollWidth / 2; };
        window.addEventListener('resize', onResize);

        return () => {
            revealObs.disconnect();
            statObs.disconnect();
            trustObs.disconnect();
            window.removeEventListener('resize', onResize);
        };
    }, [pageLoaded]);
}

/* ─── Main Page ─── */
export default function LandingPage() {
    const [loaded, setLoaded] = useState(false);
    const handleDone = useCallback(() => setLoaded(true), []);
    const doubled = [...WALL_CONFESSIONS, ...WALL_CONFESSIONS];

    usePageAnimations(loaded);

    // Konami code easter egg
    useEffect(() => {
        const SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
        let buf = [];
        const fn = (e) => {
            buf.push(e.key);
            if (buf.length > SEQ.length) buf.shift();
            if (buf.join(',') === SEQ.join(',')) {
                const el = document.createElement('div');
                el.textContent = '🤫 You found the secret. Now go confess something.';
                el.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#0a0a0a;border:1px solid rgba(255,255,255,0.12);color:#f0ede8;padding:1rem 1.75rem;border-radius:10px;font-weight:500;font-size:0.9rem;z-index:99999;animation:toastSlide 0.4s cubic-bezier(0.34,1.56,0.64,1)';
                document.body.appendChild(el);
                setTimeout(() => el.remove(), 4000);
                buf = [];
            }
        };
        window.addEventListener('keydown', fn);
        return () => window.removeEventListener('keydown', fn);
    }, []);

    return (
        <div className={styles.page}>

            {/* Grain overlay */}
            <div className={styles.grain} aria-hidden="true" />

            {/* Preloader */}
            {!loaded && <Preloader onDone={handleDone} />}

            {/* Scroll progress */}
            <div id="ch-progress" aria-hidden="true" />

            {/* Custom cursor */}
            <div id="ch-cursor" aria-hidden="true">
                <span id="ch-cursor-label" />
            </div>

            {/* ─── NAV ─── */}
            <nav id="ch-nav" className={styles.nav}>
                <span className={styles.navBrand}>ConfessHere</span>
                <div className={styles.navRight}>
                    <span className={styles.navMuted}>anonymous confessions</span>
                    <a href={`${API_URL}/auth/google`} className={styles.navCta} id="nav-cta" data-magnetic data-whisper="It's free">
                        Start Confessing
                    </a>
                </div>
            </nav>

            {/* ─── HERO ─── */}
            <section className={styles.hero} id="hero">
                {/* Ambient layers */}
                <div className={styles.heroGlow} aria-hidden="true" />
                <div className={styles.particles} aria-hidden="true">
                    {[...Array(10)].map((_, i) => (
                        <span key={i} className={styles.particle} style={{ '--pi': i }} />
                    ))}
                </div>

                <div className={styles.heroContent}>
                    {/* Left — headline + sub + badge */}
                    <div className={styles.heroLeft} data-shear>
                        <div className={styles.heroBadge} data-reveal>
                            <span className={styles.heroBadgeDot} />
                            100% anonymous · No account to read
                        </div>

                        <div className={styles.heroHeadlineWrap}>
                            <div className={styles.heroLine} data-hero-line style={{ '--line-i': 0 }}>
                                <span className={styles.heroLineInner}>Say the thing</span>
                            </div>
                            <div className={styles.heroLine} data-hero-line style={{ '--line-i': 1 }}>
                                <span className={styles.heroLineInner}>you{'\u2019'}ve never</span>
                            </div>
                            <div className={styles.heroLine} data-hero-line style={{ '--line-i': 2 }}>
                                <span className={`${styles.heroLineInner} ${styles.heroLineAccent}`}>said aloud.</span>
                            </div>
                        </div>

                        <p className={styles.heroSub} data-reveal data-reveal-delay="1">
                            Write what's on your mind. Share it without
                            your name attached. No judgment. No trace. Just truth.
                        </p>

                        <div className={styles.heroActions} data-reveal data-reveal-delay="2">
                            <a href={`${API_URL}/auth/google`} className={styles.heroCta} data-magnetic data-whisper="Anonymous · Free">
                                <GoogleIcon />
                                Start confessing
                            </a>
                            <span className={styles.heroCtaNote}>No credit card. No email stored.</span>
                        </div>
                    </div>

                    {/* Right — Composer */}
                    <div className={styles.heroRight} data-reveal data-reveal-delay="2">
                        <div className={styles.composerFloat}>
                            <ConfessionComposer />
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── TICKER ─── */}
            <div className={styles.ticker} aria-hidden="true">
                <div className={styles.tickerTrack}>
                    {[...Array(4)].map((_, i) => (
                        <span key={i} className={styles.tickerText}>{TICKER_TEXT}</span>
                    ))}
                </div>
            </div>

            {/* ─── STATS ─── */}
            <section className={styles.statsRow}>
                {STATS.map((s, i) => (
                    <div key={s.label} className={styles.statItem} data-stat style={{ '--si': i }}>
                        <div className={styles.statNum}>
                            <span data-count={s.value}>0</span>
                            <span className={styles.statSuffix}>{s.suffix}</span>
                        </div>
                        <div className={styles.statLabel}>{s.label}</div>
                        <div className={styles.statDesc}>{s.desc}</div>
                    </div>
                ))}
            </section>

            {/* ─── CONFESSION WALL ─── */}
            <section className={styles.wall}>
                <div className={styles.wallHeader} data-reveal>
                    <div className={styles.wallHeaderLeft}>
                        <span className={styles.wallTag}>
                            <span className={styles.wallTagDot} />
                            Live wall
                        </span>
                        <span className={styles.wallSubLabel}>Scrolls with your scroll velocity</span>
                    </div>
                    <span className={styles.wallNote}>Representative examples — real posts look exactly like these</span>
                </div>
                <div className={styles.wallScroll}>
                    <div className={styles.wallTrack} id="ch-wall-track">
                        {doubled.map((c, i) => <WallCard key={`${c._id}-${i}`} confession={c} />)}
                    </div>
                </div>
                <div className={styles.wallFadeLeft} aria-hidden="true" />
                <div className={styles.wallFadeRight} aria-hidden="true" />
            </section>

            {/* ─── EDITORIAL — "Why anonymity?" ─── */}
            <section className={styles.editorial}>
                <div className={styles.editorialInner} data-shear>
                    <p className={styles.editorialLine} data-reveal>No profile to maintain.</p>
                    <p className={styles.editorialLine} data-reveal data-reveal-delay="1">No algorithm deciding who sees it.</p>
                    <p className={`${styles.editorialLine} ${styles.editorialAccent}`} data-reveal data-reveal-delay="2">
                        Just a thought that needed to exist.
                    </p>
                </div>
            </section>

            {/* ─── CATEGORIES ─── */}
            <section className={styles.categories}>
                <div className={styles.categoriesInner}>
                    <div className={styles.categoriesHead} data-reveal>
                        <h2 className={styles.categoriesHeadline}>What do people confess about?</h2>
                        <p className={styles.categoriesSub}>Everything. Literally, everything.</p>
                    </div>
                    <div className={styles.categoriesGrid}>
                        {CATEGORIES.map((cat, i) => (
                            <div
                                key={cat.label}
                                className={styles.categoryCard}
                                data-reveal
                                style={{ '--ci': i, transitionDelay: `${i * 0.07}s` }}
                            >
                                <span className={styles.categoryEmoji}>{cat.emoji}</span>
                                <span className={styles.categoryLabel}>{cat.label}</span>
                                <span className={styles.categorySub}>{cat.sub}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── HOW IT WORKS ─── */}
            <section className={styles.howItWorks}>
                <div className={styles.howInner}>
                    <div className={styles.howHead} data-reveal>
                        <h2 className={styles.howHeadline}>
                            Three steps.<br />One truth.
                        </h2>
                    </div>
                    <div className={styles.howSteps}>
                        {[
                            { num: '01', title: 'Write freely', body: "Type whatever is on your mind. We don't save drafts. Nothing is read by us before you post." },
                            { num: '02', title: 'We erase you', body: "You get a randomly generated name and avatar. No metadata. No IP. No trace of who you are." },
                            { num: '03', title: 'The world hears it', body: "Your confession joins the wall. People react, relate, and feel less alone — without knowing it was you." },
                        ].map((step, i) => (
                            <div key={step.num} className={styles.howStep} data-reveal style={{ '--si': i, transitionDelay: `${i * 0.14}s` }}>
                                <div className={styles.howStepInner}>
                                    <span className={styles.howNum}>{step.num}</span>
                                    <h3 className={styles.howTitle}>{step.title}</h3>
                                    <p className={styles.howBody}>{step.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── TRUST ─── */}
            <section className={styles.trust}>
                <div className={styles.trustInner}>
                    <div className={styles.trustHead} data-reveal>
                        <h2 className={styles.trustHeadline}>Your confession is protected.</h2>
                        <p className={styles.trustSub}>Here's exactly how.</p>
                    </div>
                    <div className={styles.trustGrid}>
                        {TRUST_ITEMS.map((item, i) => (
                            <div key={item.title} className={styles.trustItem} data-trust-item style={{ '--ti': i }}>
                                <span className={styles.trustIcon}>{item.icon}</span>
                                <div>
                                    <h4 className={styles.trustTitle}>{item.title}</h4>
                                    <p className={styles.trustBody}>{item.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FINAL CTA ─── */}
            <section className={styles.cta}>
                <div className={styles.ctaGlow} aria-hidden="true" />
                <div className={styles.ctaInner} data-reveal>
                    <div className={styles.ctaEyebrow}>Ready when you are</div>
                    <h2 className={styles.ctaHeadline} data-letter-split>
                        Maybe you just need to say it.
                    </h2>
                    <p className={styles.ctaSub}>
                        Over 12,000 people have already said what they couldn't say anywhere else.
                    </p>
                    <div className={styles.ctaActions}>
                        <a href={`${API_URL}/auth/google`} className={styles.ctaBtn} id="footer-cta" data-magnetic data-whisper="Anonymous · Free">
                            <GoogleIcon />
                            Continue with Google
                        </a>
                        <p className={styles.ctaNote}>
                            Google is used for auth only · Your real identity never appears
                        </p>
                    </div>
                    {/* Sound wave bars — purely decorative CSS */}
                    <div className={styles.soundWave} aria-hidden="true">
                        {[...Array(20)].map((_, i) => (
                            <span key={i} className={styles.soundBar} style={{ '--bi': i }} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className={styles.footer}>
                <div className={styles.footerTop}>
                    <div className={styles.footerBrand}>ConfessHere</div>
                    <div className={styles.footerLinks}>
                        <span className={styles.footerLink}>confessit.online</span>
                        <span className={styles.footerDot}>·</span>
                        <span className={styles.footerLink}>A space for honest, anonymous expression</span>
                    </div>
                </div>
                <div className={styles.footerBottom}>
                    <span>© 2025 ConfessHere</span>
                    <span>Built with honesty in mind.</span>
                </div>
            </footer>
        </div>
    );
}
