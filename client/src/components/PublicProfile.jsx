import { useState, useEffect } from 'react';
import styles from './PublicProfile.module.css';
import Confetti from './Confetti';

export default function PublicProfile({ userId, fetchPublicUser, onSend, addToast }) {
    const [targetUser, setTargetUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [selectedMood, setSelectedMood] = useState('🙈 NGL');
    const [sent, setSent] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const MOODS = [
        { label: '🙈 NGL', value: 'NGL' },
        { label: '🔥 Hot take', value: 'Friends' },
        { label: '😂 Funny', value: 'Feelings' },
        { label: '💔 Secret', value: 'Personal Thoughts' },
        { label: '😈 Roast', value: 'Friends' },
        { label: '❤️ Crush', value: 'Relationship' },
    ];

    const SUGGESTIONS = [
        "Not gonna lie, you're really impressive 👏",
        "I have a huge crush on you 👀",
        "You are secretly admired more than you think",
        "I've been thinking about you lately..."
    ];

    useEffect(() => {
        async function load() {
            setLoading(true);
            const user = await fetchPublicUser(userId);
            setTargetUser(user);
            setLoading(false);
        }
        if (userId) load();
    }, [userId, fetchPublicUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const moodObj = MOODS.find(m => m.label === selectedMood);
        const moodValue = moodObj ? moodObj.value : 'Others';

        try {
            await onSend({
                text: message,
                recipientId: userId,
                mood: moodValue
            });
            setSent(true);
            setShowConfetti(true); // 🎉 Trigger confetti!
            addToast('Message sent anonymously! 🤫');
        } catch (err) {
            addToast(err.message, 'error');
        }
    };

    if (loading) return <div className={styles.status}>Loading profile...</div>;
    if (!targetUser) return <div className={styles.status}>User not found 😕</div>;

    if (sent) {
        return (
            <div className={styles.container}>
                <Confetti active={showConfetti} onDone={() => setShowConfetti(false)} />
                <div className={styles.status}>
                    <span className={styles.successIcon}>🎉</span>
                    <h2 className={styles.title}>Sent!</h2>
                    <p className={styles.subtitle}>Your anonymous message has been delivered to {targetUser.anonName}.</p>
                    <button onClick={() => { setSent(false); setMessage(''); }} className={`btn btn-secondary ${styles.backBtn}`}>Send another</button>
                    <br />
                    <a href="/" className={`btn btn-primary ${styles.backBtn}`}>Join ConfessIt</a>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.avatarWrapper}>
                    <img src={targetUser.anonAvatar} alt="avatar" className={styles.avatar} />
                </div>
                <h1 className={styles.title}>Send a secret to <span className="grad-text">{targetUser.anonName}</span></h1>
                <p className={styles.subtitle}>They will never know who sent it. 🤫</p>

                {/* 📊 Visitor Counter */}
                {targetUser.visitCount > 1 && (
                    <div className={styles.visitBadge}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        <span><strong>{targetUser.visitCount.toLocaleString()}</strong> people have visited this link</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.moodSection}>
                    <p className={styles.sectionLabel}>Select Mood:</p>
                    <div className={styles.moodGrid}>
                        {MOODS.map(m => (
                            <button
                                key={m.label}
                                type="button"
                                className={`${styles.moodBtn} ${selectedMood === m.label ? styles.activeMood : ''}`}
                                onClick={() => setSelectedMood(m.label)}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                <textarea
                    className={styles.textarea}
                    placeholder="Write your anonymous message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                />

                <p className={styles.hint}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    Safety first: Be kind and respectful.
                </p>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
                    Send Message
                </button>
            </form>

            <div className={styles.suggestions}>
                <p className={styles.sectionLabel}>Auto-generated ideas 💡</p>
                <div className={styles.suggestionGrid}>
                    {SUGGESTIONS.map((s, i) => (
                        <button key={i} type="button" className={styles.suggestBtn} onClick={() => setMessage(s)}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
