const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      user.isVerified = true;
      user.googleId = profile.id;
      if (!user.company?.name && profile.displayName) {
        user.name = profile.displayName;
      }
      await user.save({ validateBeforeSave: false });
    } else {
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        password: require('crypto').randomBytes(16).toString('hex'),
        googleId: profile.id,
        isVerified: true,
        company: { name: '' },
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return done(null, { user, token });
  } catch (error) {
    return done(error, null);
  }
}));

module.exports = passport;
