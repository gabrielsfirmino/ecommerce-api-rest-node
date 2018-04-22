const Sequelize = require('sequelize');
const sequelize = new Sequelize('meubanco', 'root', 'root', {
  host: '35.192.115.73',
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