const express = require('express');
const bodyParser = require('body-parser');
const router = require('./router/index');
const db = require('./models/db');
const lag = require('./log');
const cors = require('cors')
const passport = require('passport');
const AWS = require('aws-sdk');
require('./auth/passport')(db);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
app.options('*', cors())
app.use('/products', passport.authenticate('jwt', { session: false }), cors());
app.use('/users', passport.authenticate('jwt', { session: false }));

router(app, db, lag, AWS);

db.sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Express listening on port:', 3000);
  });
});