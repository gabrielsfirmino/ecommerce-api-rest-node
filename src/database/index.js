const mongoose = require('../database');

mongoose.connect('mongodb://localhost/ecommerce-node', {useMongoClient: true});
mongoose.Promise = global.Promise;

module.exports = mongoose;