const express = require('express');
const bodyParser = require('body-parser');
const router = require('./router/index');
const db = require('./models/db');

const passport = require('passport');
require('./auth/passport')(db);

const app = express();

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', "Origin, X-Request-Width, Content-Type, Accept");
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/products', passport.authenticate('jwt', { session: false }));

router(app, db);

db.sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Express listening on port:', 3000);
  });
});