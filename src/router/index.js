const routes = [
  require('./users'),
  require('./products'),
  require('./auth')
];

module.exports = function router(app, db, lag) {
  return routes.forEach((route) => {
    route(app, db, lag);
  });
};