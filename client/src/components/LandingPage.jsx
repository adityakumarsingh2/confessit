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
        <div className="min-h-[85vh] flex flex-col lg:flex-row items-center justify-between gap-16 py-16 px-6 max-w-7xl mx-auto relative overflow-hidden">
            
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

            {/* ── LEFT: The Branding ── */}
            <div className="w-full lg:w-1/2 space-y-10 z-10">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-secondary/80 backdrop-blur-sm text-sm font-medium border border-border/60 text-foreground shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                    Zero Logs · 100% Anonymous
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold font-display leading-[1.1] tracking-tight">
                    Confess anything.<br/>
                    <span className="text-gradient-warm pb-2">Stay hidden.</span>
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground max-w-lg leading-relaxed">
                    Join the world's safest anonymous space. Share your <strong className="text-foreground font-semibold">deepest secrets</strong>, receive honest feedback, and connect without a name.
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4">
                    <a href={`${API_URL}/auth/google`} className="btn-primary px-8 py-4 flex items-center justify-center gap-3 text-lg w-full sm:w-auto shadow-accent hover:shadow-lg transition-all">
                        <svg className="w-6 h-6 bg-white rounded-full p-1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </a>
                    <div className="text-sm font-mono text-muted-foreground flex items-center gap-2">
                        <span className="text-primary text-lg">🔒</span> Encrypted & Private
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-10 border-t border-border/40">
                    <div className="space-y-1.5">
                        <div className="text-3xl sm:text-4xl font-bold font-display text-foreground">10K+</div>
                        <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-widest font-semibold">Stories</div>
                    </div>
                    <div className="space-y-1.5">
                        <div className="text-3xl sm:text-4xl font-bold font-display text-foreground">50K+</div>
                        <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-widest font-semibold">Peers</div>
                    </div>
                    <div className="space-y-1.5">
                        <div className="text-3xl sm:text-4xl font-bold font-display text-foreground">0</div>
                        <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-widest font-semibold">Judgment</div>
                    </div>
                </div>
            </div>

            {/* ── RIGHT: The Feed ── */}
            <div className="w-full lg:w-[45%] relative h-[650px] overflow-hidden rounded-3xl border border-border/40 bg-secondary/20 backdrop-blur-xl p-4 sm:p-6 shadow-2xl z-10">
                {/* Fade overlays */}
                <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-background to-transparent z-20 pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />
                
                <div className="flex flex-col gap-5 animate-float h-full overflow-hidden pt-10">
                    {doubled.map((c, i) => (
                        <div key={`${c._id}-${i}`} className="card-elegant p-5 space-y-4 bg-card/90 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <img src={c.anonAvatar} alt="" className="w-11 h-11 rounded-full border-2 border-primary/20 bg-secondary/50" />
                                <div>
                                    <div className="font-semibold text-foreground text-sm tracking-wide">{c.anonName}</div>
                                    <div className="text-xs text-muted-foreground font-mono">{timeAgo(c.createdAt)}</div>
                                </div>
                            </div>
                            {c.mood && MOOD_LABELS[c.mood] && (
                                <span className="inline-block px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-semibold bg-primary/10 text-primary border border-primary/20">{MOOD_LABELS[c.mood]}</span>
                            )}
                            <p className="text-foreground/80 text-[15px] leading-relaxed font-medium">{c.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
