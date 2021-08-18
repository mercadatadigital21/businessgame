const passport = require('passport')
const passportJwt = require('passport-jwt')
const { Strategy: LocalStrategy, ExtractJwt } = passportJwt;

const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

module.exports = (app) => {
  const authParams = {
    secretOrKey: process.env.LOCAL_AUTH_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  };

  const localStrategy = new LocalStrategy(authParams, (payload, done) => {
    app.database
      .knex('users')
      .where({ id: payload.id })
      .first()
      .then((user) => done(null, user ? { ...payload } : false))
      .catch(() => done(null, false));
  });

  const facebookParams = {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `http://localhost:${process.env.PORT}/auth/facebook/callback`,
  };

  const facebookStrategy = new FacebookStrategy(
    facebookParams,
    (accessToken, refreshToken, profile, done) => {
      app.database
        .knex('users')
        .where({ facebook_id: profile.id })
        .first()
        .then((user) => {
          if (!user) {
            const user = {
              facebook_id: profile.id,
              name: profile.displayName,
              email: profile.emails ? profile.emails[0].value : null,
              facebookAcessToken: accessToken,
            };
            app.database
              .knex('users')
              .insert(user)
              .then((user) => done(null, user))
              .catch((err) => {
                console.log('user erro', err);
                done(err, false);
              });
          } else {
            done(null, user);
          }
        });
    }
  );

  const googleParams = {
    clientID: process.env.GOOGLE_CONSUMER_ID,
    consumerSecret: process.env.GOOGLE_CONSUMER_SECRET,
    callbackURL: `http://localhost:${process.env.PORT}/auth/google/callback`,
  };

  const googleStrategy = new GoogleStrategy(
    googleParams,
    (accessToken, refreshToken, profile, done) => {
      app.database
        .knex('users')
        .where({ google_id: profile.id })
        .first()
        .then((user) => {
          if (!user) {
            const user = {
              google_id: profile.id,
              name: profile.displayName,
              email: profile.emails ? profile.emails[0].value : null,
              google_access_token: accessToken,
            };
            app.database
              .knex('users')
              .insert(user)
              .then((user) => done(null, user))
              .catch((err) => {
                console.log('user erro', err);
                done(err, false);
              });
          } else {
            done(null, user);
          }
        });
    }
  );

  passport.use(localStrategy);
  passport.use(facebookStrategy);
  passport.use(googleStrategy);

  return {
    authenticate: () => passport.authenticate('jwt', { session: false }),
  };
};
