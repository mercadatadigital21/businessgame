module.exports = (app) => {
  app.route('/signup').post(app.apis.auth.signup);

  app.route('/signin').post(app.apis.auth.signin);
};
