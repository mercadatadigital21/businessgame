module.exports = app => {
    app
    .route('/consumerMarket')
    .post(app.middlewares.user.getUserFromHeader, app.apis.consumerMarket.populationConsumption)
    .post(app.middlewares.user.getUserFromHeader, app.apis.consumerMarket.investmentMedia)
    .post(app.middlewares.user.getUserFromHeader, app.apis.consumerMarket.faithfulnessUser)
}