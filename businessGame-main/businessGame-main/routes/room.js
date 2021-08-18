module.exports = (app) => {
  app
    .route('/room')
    .post(app.middlewares.user.getUserFromHeader, app.apis.room.create)
    .get(app.middlewares.user.getUserFromHeader, app.apis.room.get);

  app
    .route('/room/:id')
    .get(app.middlewares.user.getUserFromHeader, app.apis.room.getById);
};
