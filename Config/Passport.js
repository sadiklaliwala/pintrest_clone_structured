const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { Passport } = require('passport');
const User = require('../Models/UserSchema');
const FacebookStrategy = require('passport-facebook').Strategy;

module.exports = (passport) => {


passport.use(new FacebookStrategy(
    {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.CALLBACK_URL + '/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'emails'] // request email explicitly
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails && profile.emails[0] && profile.emails[0].value;
            // 1) try to find by facebookId
            let user = await User.findOne({ facebookId: profile.id });
            if (user) return done(null, user);

            // 2) try to find by email -> merge/link
            if (email) {
                user = await User.findOne({ email });
                if (user) {
                    user.facebookId = profile.id;
                    if (!user.name) user.name = profile.displayName;
                    await user.save();
                    return done(null, user);
                }
            }

            // 3) create new user
            const newUser = await User.create({
                facebookId: profile.id,
                email: email || undefined,
                name: profile.displayName
            });
            return done(null, newUser);

        } catch (err) {
            return done(err, null);
        }
    }
));


    // Continue With Google 
    passport.use(new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL+'/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails && profile.emails[0] && profile.emails[0].value;
                // 1) try to find by googleId
                let user = await User.findOne({ googleId: profile.id });
                if (user) return done(null, user);

                // 2) try to find by email -> merge/link
                if (email) {
                    user = await User.findOne({ email });
                    if (user) {
                        user.googleId = profile.id;
                        if (!user.name) user.name = profile.displayName;
                        await user.save();
                        return done(null, user);
                    }
                }

                // 3) create new user
                const newUser = await User.create({
                    googleId: profile.id,
                    email: email || undefined,
                    name: profile.displayName
                });
                return done(null, newUser);

            } catch (err) {
                return done(err, null);
            }
        }//Async Funtion Closed
    )); // google Stretegy Closed

    // GitHub
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL+'/auth/github/callback',
        scope: ['user:email']
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // GitHub may not return primary email in profile.emails; ensure you fetch it
                const email = profile.emails && profile.emails[0] && profile.emails[0].value;

                // find with github id 
                let user = await User.findOne({ githubId: profile.id });
                if (user) return done(null, user);

                //not find then find by email
                if (email) {
                    user = await User.findOne({ email });
                    if (user) {
                        user.githubId = profile.id;
                        if (!user.name) user.name = profile.displayName || profile.username;
                        await user.save();
                        return done(null, user);
                    }
                }

                //create new first time user
                const newUser = await User.create({
                    githubId: profile.id,
                    email: email || undefined,
                    name: profile.displayName || profile.username
                });
                return done(null, newUser);
            } catch (err) {
                return done(err, null);
            }
        }
    ));

    // These are optional for sessions — we're using JWTs, but Passport requires these if sessions are enabled

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });//github closed
} // moduel Exports closed