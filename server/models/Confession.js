const mongoose = require('mongoose');

const PollOptionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    votes: { type: [String], default: [] } // Array of User IDs
});

const ConfessionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    mood: {
        type: String,
        enum: ['NGL', 'Study', 'Relationship', 'Family', 'Friends', 'Feelings', 'Personal Thoughts', 'Career', 'Mental Health', 'College', 'Others'],
        default: 'NGL'
    },
    // Cached anon info from the user at the time of posting
    anonName: String,
    anonAvatar: String,

    isAnonymous: {
        type: Boolean,
        default: true
    },
    allowComments: {
        type: Boolean,
        default: true
    },

    // Reactions: Map of emoji -> [userIds]
    // Using a map allows any emoji and "one reaction per user" logic
    reactions: {
        type: Map,
        of: [String],
        default: new Map()
    },

    poll: {
        question: String,
        options: [PollOptionSchema]
    },

    commentCount: {
        type: Number,
        default: 0
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function () { return !this.recipientId; } // Only required if not a private message
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    isRead: {
        type: Boolean,
        default: false
    },
    recipientReply: {
        type: String,
        default: null
    },
    isReplied: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual for engagement score (used for trending)
ConfessionSchema.virtual('engagementScore').get(function () {
    let totalLikes = 0;
    this.reactions.forEach((users) => {
        totalLikes += users.length;
    });
    return totalLikes + this.commentCount;
});

module.exports = mongoose.model('Confession', ConfessionSchema);
