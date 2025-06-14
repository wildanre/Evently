import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../utils/prisma';

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_CALLBACK_URL!
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: profile.emails![0].value }
    });

    if (user) {
      // User exists, return user
      return done(null, user);
    }

    // Create new user
    user = await prisma.user.create({
      data: {
        name: profile.displayName,
        email: profile.emails![0].value,
        profileImageUrl: profile.photos![0].value,
        // Google OAuth users don't have passwords
        password: null
      }
    });

    return done(null, user);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, false);
  }
}));

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        profileImageUrl: true,
        bio: true
      }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
