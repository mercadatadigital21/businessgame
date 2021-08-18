module.exports = (app) => {
  app
    .route('/gameSave/:id')
    .put(app.middlewares.user.getUserFromHeader, app.apis.processing.gameSave)

    app
    .route('/engine')
    .post(app.middlewares.user.getUserFromHeader, app.apis.processing.engine);

  app
    .route('/rawMaterial')
    .post(
      app.middlewares.user.getUserFromHeader,
      app.apis.processing.rawMaterial
    );

  app
    .route('/shelfLife')
    .get(app.middlewares.user.getUserFromHeader, app.apis.processing.shelfLife);

  app
    .route('/production')
    .post(
      app.middlewares.user.getUserFromHeader,
      app.apis.processing.production
    );

  app
    .route('/capacityProduction')
    .post(
      app.middlewares.user.getUserFromHeader,
      app.apis.processing.capacityProduction
    );

  app
    .route('/trainingEmployees')
    .post(
      app.middlewares.user.getUserFromHeader,
      app.apis.processing.trainingEmployees
    );

  app
    .route('/maintenance')
    .post(
      app.middlewares.user.getUserFromHeader,
      app.apis.processing.maintenance
    );

  app
    .route('/sell')
    .post(app.middlewares.user.getUserFromHeader, app.apis.processing.sell);

  app
    .route('/historyGame/:id')
    .get(
      app.middlewares.user.getUserFromHeader,
      app.apis.processing.historyGame
    );

  app
    .route('/productsGet/:id')
    .get(
      app.middlewares.user.getUserFromHeader,
      app.apis.processing.productsGet
    );

  app
    .route('/freight')
    .post(app.middlewares.user.getUserFromHeader, app.apis.processing.freight);
};
