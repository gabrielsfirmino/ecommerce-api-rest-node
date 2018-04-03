const routes = [
  require('./users'),
  require('./products')
];

module.exports = function router(app, db) {
  return routes.forEach((route) => {
    route(app, db);
  });
};