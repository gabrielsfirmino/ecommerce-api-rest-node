const jwt = require('jsonwebtoken');
const passport = require('passport');

module.exports = (app, db) => {
  app.post('/login', function (req, res, next) {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, (err) => {
        if (err) {
          res.send(err);
        }
        const token = jwt.sign({ data: user }, 'SECRET', {
          expiresIn: 604800 // 1 week
        });
        return res.json({ user, token });
      });
    })(req, res);
  });
}

