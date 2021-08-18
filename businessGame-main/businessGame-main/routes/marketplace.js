module.exports = app => {
   app
   .route('/marketplace')
   .post(app.middlewares.user.getUserFromHeader, app.apis.marketplace.marketplace)
   .post(app.middlewares.user.getUserFromHeader, app.apis.marketplace.marketing)
   .get(app.middlewares.user.getUserFromHeader, app.apis.marketplace.getProducts)
}