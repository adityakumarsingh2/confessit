require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');           
const bcrypt = require('bcryptjs');
const Confession = require('./models/Confession');

// Passport Config
require('./config/passport');

const User = require('./models/User');
const Comment = require('./models/Comment');

const app = express();

const envOrigins = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

const defaultOrigins = [
    'https://www.confesshere.online',
    'https://confesshere.online',
    'https://justconfessit.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
];

const allowedOrigins = Array.from(new Set([...envOrigins, ...defaultOrigins]));

const getRedirectOrigin = (req) => {
    const originHeader = req?.headers?.origin || req?.headers?.referer;
    if (originHeader) {
        try {
            const parsed = new URL(originHeader).origin;
            if (allowedOrigins.includes(parsed)) return parsed;
        } catch (e) {}
    }
    return envOrigins[0] || 'https://www.confesshere.online';
};

// Trust proxy (required for session cookies over proxy)
app.set('trust proxy', 1);

// DB Connection
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/confession_wall')
        .then(() => console.log('MongoDB Connected'))
        .catch(err => console.log(err));
}

// --- Middleware (order matters!) ---
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || origin.endsWith('.confesshere.online') || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        console.warn(`[CORS] Request from origin ${origin} allowed as fallback.`);
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// --- Helper: Auth Middleware ---
const isAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: 'Authentication required' });
};

// --- Auth Routes ---
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    (req, res, next) => {
        passport.authenticate('google', { failureRedirect: getRedirectOrigin(req) + '/?error=auth_failed' })(req, res, next);
    },
    (req, res) => {
        res.redirect(getRedirectOrigin(req));
    }
);

app.get('/auth/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect(getRedirectOrigin(req));
    });
});

// --- User Activity & Auth Routes ---
app.get('/api/stats', async (req, res) => {
    try {
        const confessions = await Confession.countDocuments({
            $or: [
                { recipientId: null },
                { isReplied: true }
            ]
        });
        const comments = await Comment.countDocuments({});
        const users = await User.countDocuments({});

        res.json({ confessions, comments, users });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/user', async (req, res) => {
    if (!req.user) return res.json(null);
    try {
        const user = await User.findById(req.user._id).select('-__v');
        res.json(user || null);
    } catch (err) {
        res.json(req.user);
    }
});

app.get('/api/user/activity', isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('bookmarks');
        const myConfessions = await Confession.find({ userId: req.user._id });
        res.json({
            bookmarks: user.bookmarks,
            drafts: user.drafts,
            myConfessions
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/user/regenerate-identity', isAuth, async (req, res) => {
    try {
        const ADJECTIVES = ['Silent', 'Brave', 'Hidden', 'Mystic', 'Quiet', 'Wandering', 'Secret', 'Lonesome', 'Ancient', 'Golden'];
        const NOUNS = ['Soul', 'Heart', 'Shadow', 'Echo', 'Whisper', 'Spirit', 'Dreamer', 'Voyager', 'Phantom', 'Oracle'];

        const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
        const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
        const num = Math.floor(Math.random() * 100);

        const newName = `${adj}${noun}${num}`;
        const newAvatar = `https://api.dicebear.com/7.x/pixel-art-neutral/svg?seed=${Math.random().toString(36).substring(7)}`;

        const user = await User.findByIdAndUpdate(req.user._id, {
            anonName: newName,
            anonAvatar: newAvatar
        }, { new: true });

        res.json(user);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// --- NGL-style Private Messaging Routes ---

// GET /api/users/:id - Public info for sharing (increments visit count)
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $inc: { visitCount: 1 } },
            { new: true }
        ).select('anonName anonAvatar visitCount');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/user/inbox - Private messages for logged in user
app.get('/api/user/inbox', isAuth, async (req, res) => {
    try {
        const messages = await Confession.find({ recipientId: req.user._id }).sort({ createdAt: -1 });

        // Optionally mark all as read if requested via query param
        if (req.query.markAsRead === 'true') {
            await Confession.updateMany(
                { recipientId: req.user._id, isRead: false },
                { $set: { isRead: true } }
            );
        }

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/user/inbox/unread-count - Lightweight check for sidebar
app.get('/api/user/inbox/unread-count', isAuth, async (req, res) => {
    try {
        const count = await Confession.countDocuments({
            recipientId: req.user._id,
            isRead: false
        });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/confessions/private - Send an anonymous message to someone
app.post('/api/confessions/private', async (req, res) => {
    const { text, mood, recipientId } = req.body;
    try {
        const confession = new Confession({
            text,
            mood: mood || 'Others',
            recipientId,
            isAnonymous: true,
            allowComments: false, // Private messages don't have public comments usually
            anonName: 'Anonymous Sender', // Generic for guest senders
            anonAvatar: `https://api.dicebear.com/7.x/pixel-art-neutral/svg?seed=${Math.random().toString(36).substring(7)}`
        });

        const newConfession = await confession.save();
        res.status(201).json(newConfession);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST /api/confessions/:id/reply - Recipient replies to a private message
app.post('/api/confessions/:id/reply', isAuth, async (req, res) => {
    const { text } = req.body;
    try {
        const confession = await Confession.findById(req.params.id);
        if (!confession) return res.status(404).json({ message: 'Confession not found' });

        if (confession.recipientId?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the recipient can reply' });
        }

        confession.recipientReply = text;
        confession.isReplied = true;
        confession.isRead = true; // Marking as read if they replied

        await confession.save();
        res.json(confession);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- Confession Routes ---

// GET /api/confessions
app.get('/api/confessions', async (req, res) => {
    try {
        const { sort, search, mood } = req.query;
        let query = {
            $or: [
                { recipientId: null }, // Public confessions
                { isReplied: true }    // Replied private messages become public
            ]
        };

        if (search) {
            query.$and = [
                {
                    $or: [
                        { recipientId: null },
                        { isReplied: true }
                    ]
                },
                {
                    $or: [
                        { text: { $regex: search, $options: 'i' } },
                        { mood: { $regex: search, $options: 'i' } }
                    ]
                }
            ];
            delete query.$or;
        }

        if (mood) {
            if (query.$and) {
                query.$and.push({ mood });
            } else {
                query.mood = mood;
            }
        }

        let confessions = await Confession.find(query).sort({ createdAt: -1 });

        // Sorting Logic: Simple Likes + Comments
        if (sort === 'trending') {
            confessions = confessions.map(c => {
                const totalLikes = Array.from(c.reactions?.values() || []).flat().length;
                const totalComments = c.commentCount || 0;
                return { ...c.toObject(), trendScore: totalLikes + totalComments };
            }).sort((a, b) => b.trendScore - a.trendScore);
        } else if (sort === 'most_liked') {
            confessions = confessions.sort((a, b) => {
                const count = (map) => Array.from(map.values()).flat().length;
                return count(b.reactions || new Map()) - count(a.reactions || new Map());
            });
        }

        res.json(confessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/confessions/:id (For deep linking)
app.get('/api/confessions/:id', async (req, res) => {
    try {
        const confession = await Confession.findById(req.params.id);
        if (!confession) return res.status(404).json({ message: 'Confession not found' });
        res.json(confession);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Dynamic Social Share Route
app.get('/share/:id', async (req, res) => {
    try {
        const confession = await Confession.findById(req.params.id);
        if (!confession) {
            return res.status(404).send('<h1 style="text-align:center; color:white; background:#020617; height:100vh; display:flex; align-items:center; justify-content:center; margin:0;">Confession Not Found</h1>');
        }

        // Simple HTML Escaping
        const escapeHTML = (str) => str.replace(/[&<>"']/g, (m) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[m]);

        const title = "🤫 Anonymous Confession on ConfessIt";
        const description = escapeHTML(confession.text.substring(0, 160) + (confession.text.length > 160 ? '...' : ''));
        const clientUrl = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
        const fullUrl = `${clientUrl}/?share=${confession._id}`;

        // Use a generic premium looking preview image
        const imageUrl = `https://api.dicebear.com/7.x/initials/svg?seed=Confession&backgroundColor=833ab4,fd1d1d,fcb045&fontSize=50&bold=true`;

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${fullUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${fullUrl}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="${imageUrl}">

    <!-- Redirect user to the actual app -->
    <meta http-equiv="refresh" content="0;url=${fullUrl}">
    <script>window.location.href = "${fullUrl}";</script>
</head>
<body style="background: #020617; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; margin: 0;">
    <div style="text-align: center; padding: 2rem;">
        <h2 style="font-size: 2rem; margin-bottom: 1rem;">🤫 Opening Confession...</h2>
        <p style="opacity: 0.7;">If you are not redirected, <a href="${fullUrl}" style="color: #833ab4; font-weight: bold; text-decoration: none;">click here</a>.</p>
    </div>
</body>
</html>`;
        res.header('Content-Type', 'text/html');
        res.send(html);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

// POST /api/confessions
app.post('/api/confessions', isAuth, async (req, res) => {
    const { text, mood, isAnonymous, allowComments, poll } = req.body;
    try {
        const confession = new Confession({
            text,
            mood,
            isAnonymous,
            allowComments,
            poll,
            userId: req.user._id,
            anonName: req.user.anonName,
            anonAvatar: req.user.anonAvatar
        });
        const newConfession = await confession.save();
        res.status(201).json(newConfession);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST /api/confessions/:id/react
app.post('/api/confessions/:id/react', isAuth, async (req, res) => {
    const { emoji } = req.body;
    try {
        const confession = await Confession.findById(req.params.id);
        if (!confession) return res.status(404).json({ message: 'Not found' });

        const userId = req.user._id.toString();
        const currentReactions = confession.reactions || new Map();

        // 10 likes limit per user per emoji
        const emojiUsers = currentReactions.get(emoji) || [];
        const userCount = emojiUsers.filter(id => id === userId).length;

        if (userCount < 10) {
            emojiUsers.push(userId);
            currentReactions.set(emoji, emojiUsers);
            confession.reactions = currentReactions;
            await confession.save();
        }

        res.json(confession);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT /api/confessions/:id
app.put('/api/confessions/:id', isAuth, async (req, res) => {
    const { text, mood } = req.body;
    try {
        const confession = await Confession.findById(req.params.id);
        if (!confession) return res.status(404).json({ message: 'Confession not found' });

        if (confession.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        confession.text = text || confession.text;
        confession.mood = mood || confession.mood;
        await confession.save();
        res.json(confession);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/confessions/:id
app.delete('/api/confessions/:id', isAuth, async (req, res) => {
    try {
        const confession = await Confession.findById(req.params.id);
        if (!confession) return res.status(404).json({ message: 'Confession not found' });

        const isOwner = confession.userId && confession.userId.toString() === req.user._id.toString();
        const isRecipient = confession.recipientId && confession.recipientId.toString() === req.user._id.toString();

        if (!isOwner && !isRecipient) {
            return res.status(403).json({ message: 'Not authorized to delete' });
        }

        await Confession.findByIdAndDelete(req.params.id);
        await Comment.deleteMany({ confessionId: req.params.id });
        res.json({ message: 'Confession deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Poll Voting ---
app.post('/api/confessions/:id/vote', isAuth, async (req, res) => {
    const { optionIndex } = req.body;
    try {
        const confession = await Confession.findById(req.params.id);
        if (!confession.poll) return res.status(400).json({ message: 'No poll found' });

        // Remove user's previous votes in this poll
        confession.poll.options.forEach(opt => {
            opt.votes = opt.votes.filter(uid => uid !== req.user._id.toString());
        });

        // Add new vote
        confession.poll.options[optionIndex].votes.push(req.user._id.toString());
        await confession.save();
        res.json(confession);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Comment Routes ---

app.get('/api/confessions/:id/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ confessionId: req.params.id }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/confessions/:id/comments', isAuth, async (req, res) => {
    const { text, parentCommentId } = req.body;
    const comment = new Comment({
        text,
        parentCommentId,
        confessionId: req.params.id,
        userId: req.user._id,
        anonName: req.user.anonName,
        anonAvatar: req.user.anonAvatar
    });

    try {
        const newComment = await comment.save();
        await Confession.findByIdAndUpdate(req.params.id, { $inc: { commentCount: 1 } });
        res.status(201).json(newComment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST /api/comments/:id/like
app.post('/api/comments/:id/like', isAuth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const userId = req.user._id.toString();
        const likedIndex = comment.likes.indexOf(userId);

        if (likedIndex > -1) {
            comment.likes.splice(likedIndex, 1);
        } else {
            comment.likes.push(userId);
        }

        await comment.save();
        res.json(comment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/comments/:id
app.delete('/api/comments/:id', isAuth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        if (comment.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Comment.findByIdAndDelete(req.params.id);
        await Confession.findByIdAndUpdate(comment.confessionId, { $inc: { commentCount: -1 } });
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/comments/:id/report
app.post('/api/comments/:id/report', isAuth, async (req, res) => {
    const { reason } = req.body;
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        comment.reports.push({
            userId: req.user._id,
            reason: reason || 'Inappropriate content',
            createdAt: new Date()
        });

        await comment.save();
        res.json({ message: 'Report submitted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- User Activity Routes (Bookmarks/Drafts) ---

app.post('/api/user/bookmarks/:id', isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const index = user.bookmarks.indexOf(req.params.id);
        if (index > -1) {
            user.bookmarks.splice(index, 1); // Toggle off
        } else {
            user.bookmarks.push(req.params.id); // Toggle on
        }
        await user.save();
        res.json(user.bookmarks || []);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.post('/api/user/drafts', isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.drafts.push(req.body);
        await user.save();
        res.json(user.drafts || []);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- Keep Alive Route ---
app.get('/api/ping', (req, res) => {
    res.status(200).json({ message: 'Server is awake' });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;
