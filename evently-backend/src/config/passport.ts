import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../utils/prisma';

// Validate Google OAuth environment variables
if (!process.env.GOOGLE_CLIENT_ID) {
  console.error('Error: GOOGLE_CLIENT_ID environment variable is not set');
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.error('Error: GOOGLE_CLIENT_SECRET environment variable is not set');
}
if (!process.env.GOOGLE_CALLBACK_URL) {
  console.error('Error: GOOGLE_CALLBACK_URL environment variable is not set');
}

console.log('Google OAuth Configuration:');
console.log('- Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing');
console.log('- Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing');
console.log('- Callback URL:', process.env.GOOGLE_CALLBACK_URL || 'Missing');

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_CALLBACK_URL!,
  scope: ['profile', 'email'],
  passReqToCallback: false
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Validate profile data
    if (!profile || !profile.emails || profile.emails.length === 0) {
      console.error('Google OAuth: No email found in profile');
      return done(new Error('No email found in Google profile'), false);
    }

    const email = profile.emails[0].value;
    const name = profile.displayName || profile.name?.givenName || 'Google User';
    const profileImageUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

    console.log('Google OAuth profile:', { email, name, profileImageUrl });

    // Check if user already exists
    let user = await prisma.users.findUnique({
      where: { email }
    });

    if (user) {
      console.log('Existing user found:', user.id);
      // Update profile image if it's new
      if (profileImageUrl && user.profileImageUrl !== profileImageUrl) {
        user = await prisma.users.update({
          where: { id: user.id },
          data: { profileImageUrl }
        });
      }
      return done(null, user);
    }

    // Create new user
    console.log('Creating new user for email:', email);
    user = await prisma.users.create({
      data: {
        name,
        email,
        profileImageUrl,
        // Google OAuth users don't have passwords
        password: null
      }
    });

    console.log('New user created:', user.id);
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
    const user = await prisma.users.findUnique({
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
