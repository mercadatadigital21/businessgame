module.exports = (app) => {
  app
    .route('/me')
    .get(app.middlewares.user.getUserFromHeader, app.apis.user.me);

  app
    .route('/user/:id')
    .get(app.middlewares.user.getUserFromHeader, app.apis.user.getById)
    .delete(app.middlewares.user.getUserFromHeader, app.apis.user.remove);
};
