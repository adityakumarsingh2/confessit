const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const User = require('../models/User');

const ADJECTIVES = ['Silent', 'Brave', 'Hidden', 'Mystic', 'Quiet', 'Wandering', 'Secret', 'Lonesome', 'Ancient', 'Golden'];
const NOUNS = ['Soul', 'Heart', 'Shadow', 'Echo', 'Whisper', 'Spirit', 'Dreamer', 'Voyager', 'Phantom', 'Oracle'];

function generateAnonName() {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(Math.random() * 100);
    return `${adj}${noun}${num}`;
}

function generateAnonAvatar() {
    // Using DiceBear for modern, reliable avatars
    return `https://api.dicebear.com/7.x/pixel-art-neutral/svg?seed=${Math.random().toString(36).substring(7)}`;
}

console.log(' [DEBUG] Passport Google Strategy Init');
console.log(' [DEBUG] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Present' : 'MISSING');
console.log(' [DEBUG] CALLBACK_URL:', process.env.CALLBACK_URL);

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    proxy: true
},
    async function (accessToken, refreshToken, profile, done) {
        try {
            console.log('Google Auth callback triggered for:', profile.id);
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {
                const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
                if (!email) {
                    return done(new Error('Email is required but not provided by Google.'), null);
                }

                user = new User({
                    googleId: profile.id,
                    email: email,
                    name: profile.displayName || profile.name?.givenName + ' ' + (profile.name?.familyName || '') || 'Anonymous',
                    picture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
                    anonName: generateAnonName(),
                    anonAvatar: generateAnonAvatar()
                });
                await user.save();
                console.log('New user created:', user.anonName);
            }

            return done(null, user);
        } catch (err) {
            console.error('Error in Google Strategy:', err);
            return done(err, null);
        }
    }
));


