import { useState, useRef, useEffect } from 'react';

const MAX = 1000;
const MOODS = ['NGL', 'Study', 'Relationship', 'Family', 'Friends', 'Feelings', 'Personal Thoughts', 'Career', 'Mental Health', 'College', 'Others'];

export default function ConfessionForm({ onSubmit, onSaveDraft }) {
    const [text, setText] = useState('');
    const [mood, setMood] = useState('NGL');
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [allowComments, setAllowComments] = useState(true);
    const [pollEnabled, setPollEnabled] = useState(false);
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [busy, setBusy] = useState(false);
    const textareaRef = useRef(null);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [text]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (text.trim().length < 5) return;

        setBusy(true);
        const payload = {
            text: text.trim(),
            mood,
            isAnonymous,
            allowComments,
        };

        if (pollEnabled) {
            payload.poll = {
                question: 'Vote on this!',
                options: pollOptions.filter(o => o.trim()).map(o => ({ text: o.trim(), votes: [] }))
            };
        }

        try {
            await onSubmit(payload);
            setText('');
            setPollEnabled(false);
            setPollOptions(['', '']);
        } catch (err) {
            console.error('Post failed:', err.message);
        } finally {
            setBusy(false);
        }
    };

    const handleAddOption = () => {
        if (pollOptions.length < 5) setPollOptions([...pollOptions, '']);
    };

    const addEmoji = (e) => {
        setText(prev => (prev + e).slice(0, MAX));
    };

    return (
        <form className="card-elegant p-5 sm:p-7 space-y-6 slide-up relative overflow-hidden" onSubmit={handleSubmit}>
            {/* Subtle glow effect behind form */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative">
                <div>
                    <h2 className="text-2xl font-bold font-display text-foreground tracking-tight">Spill a Secret</h2>
                    <p className="text-sm text-muted-foreground mt-1">Your identity is completely hidden.</p>
                </div>
                <div className="relative">
                    <select 
                        value={mood} 
                        onChange={(e) => setMood(e.target.value)} 
                        className="appearance-none bg-secondary/80 text-foreground text-sm font-medium border border-border/50 rounded-full pl-5 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm backdrop-blur-sm"
                    >
                        {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                </div>
            </div>

            <div className="space-y-3 z-10 relative">
                <textarea
                    ref={textareaRef}
                    placeholder="What's going on? Be honest, it's anonymous... 🤫"
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, MAX))}
                    className="w-full bg-secondary/30 text-foreground border border-border/50 rounded-2xl p-5 min-h-[140px] resize-none focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60 text-[15px] leading-relaxed"
                    required
                />
                
                <div className="flex items-center justify-between px-1">
                    <div className="flex flex-wrap gap-1">
                        {['✨', '🔥', '❤️', '😂', '😢', '😮', '💀', '💯'].map(e => (
                            <button 
                                key={e} 
                                type="button" 
                                onClick={() => addEmoji(e)} 
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary text-lg transition-transform hover:scale-110 active:scale-95"
                            >
                                {e}
                            </button>
                        ))}
                    </div>
                    <div className={`text-xs font-mono font-medium ${text.length > MAX * 0.9 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {text.length} / {MAX}
                    </div>
                </div>
            </div>

            {pollEnabled && (
                <div className="p-4 rounded-2xl bg-secondary/40 border border-border/50 space-y-4 z-10 relative">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <span className="text-primary">📊</span> Anonymous Poll
                    </p>
                    <div className="space-y-2.5">
                        {pollOptions.map((opt, i) => (
                            <input
                                key={i}
                                type="text"
                                placeholder={`Option ${i + 1}`}
                                value={opt}
                                onChange={(e) => {
                                    const newOpts = [...pollOptions];
                                    newOpts[i] = e.target.value;
                                    setPollOptions(newOpts);
                                }}
                                className="w-full bg-background border border-border/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all text-foreground placeholder:text-muted-foreground/60"
                            />
                        ))}
                    </div>
                    {pollOptions.length < 5 && (
                        <button 
                            type="button" 
                            onClick={handleAddOption} 
                            className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors px-1"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Add Option
                        </button>
                    )}
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-5 border-t border-border/40 z-10 relative">
                <div className="flex items-center gap-6 px-1">
                    <label className={`flex items-center gap-2 cursor-pointer transition-all ${pollEnabled ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                        <input type="checkbox" className="hidden" checked={pollEnabled} onChange={(e) => setPollEnabled(e.target.checked)} />
                        <span className="text-lg">📊</span>
                        <span className="text-sm font-semibold tracking-wide">Poll</span>
                    </label>
                    <label className={`flex items-center gap-2 cursor-pointer transition-all ${allowComments ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                        <input type="checkbox" className="hidden" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} />
                        <span className="text-lg">💬</span>
                        <span className="text-sm font-semibold tracking-wide">Comments</span>
                    </label>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={async () => {
                            if (!text.trim()) return;
                            try { await onSaveDraft({ text, mood }); }
                            catch (err) { console.error('Draft save failed:', err.message); }
                        }}
                        className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        disabled={!text.trim()}
                    >
                        Save Draft
                    </button>
                    <button 
                        className="btn-primary px-8 py-2.5 flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed shadow-accent hover:shadow-lg" 
                        type="submit" 
                        disabled={busy || text.trim().length < 5}
                    >
                        {busy ? 'Posting...' : 'Post Secret 🚀'}
                    </button>
                </div>
            </div>
        </form>
    );
}
