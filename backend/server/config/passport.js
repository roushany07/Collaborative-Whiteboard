import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

const configurePassport = () => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.log('⚠️ Google OAuth disabled (no client ID)');
    return;
  }

  console.log('✅ Google OAuth enabled');

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              avatar: profile.photos[0]?.value
            });
          }

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
};

export default configurePassport;