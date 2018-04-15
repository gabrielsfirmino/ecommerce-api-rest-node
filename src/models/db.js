const Sequelize = require('sequelize');
const sequelize = new Sequelize('dbshow', 'root', 'victorsilent', {
  host: 'dbshow.cupyjcdlzl8d.us-west-2.rds.amazonaws.com',
  dialect: 'mysql',
  operatorsAliases: false,
});

// Connect all the models/tables in the database to a db object,
//so everything is accessible via one object
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//Models/tables
db.users = require('./users.js')(sequelize, Sequelize);
db.products = require('./products.js')(sequelize, Sequelize);

module.exports = db;