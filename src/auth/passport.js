const passport = require('passport');
const passportJWT = require("passport-jwt");
const ExtractJWT = passportJWT.ExtractJwt;

const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = passportJWT.Strategy;

module.exports = function (db) {
  passport.use(new LocalStrategy({
    usernameField: 'login',
    passwordField: 'password'
  },
    function (login, password, cb) {
      return db.users.find({ where: { login, password } })
        .then(user => {
          if (!user) {
            return cb(null, false, { message: 'Incorrect login or password.' });
          }
          return cb(null, user, {
            message: 'Logged In Successfully'
          });
        })
        .catch(err => {
          return cb(err);
        });
    }
  ));

  passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'SECRET'
  },
    function (jwtPayload, cb) {
      //find the user in db if needed
      return db.users.find({ where: { id: jwtPayload.data.id } })
        .then(user => {
          return cb(null, user);
        })
        .catch(err => {
          return cb(err);
        });
    }
  ));
}