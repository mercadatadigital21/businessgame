const passportJwt = require('passport-jwt');
const { ExtractJwt } = passportJwt;
const { decode } = require('jwt-simple');

const params = {
  token: ExtractJwt.fromAuthHeaderAsBearerToken(),
  authSecret: process.env.LOCAL_AUTH_SECRET,
};

module.exports = (app) => {
  const getUserFromHeader = async (req, res, next) => {
    const token = params.token(req);
    try {
      const payload = decode(token, params.authSecret);
      const userDB = await app.models.user
      .forge()
      .where({ id: payload.id })
      .fetch();
      req.user = userDB.toJSON();
      console.log(userDB)
      return next();
    } catch (e) {
      return res
        .status(400)
        .send('Erro ao autenticar o usuário ou token expirado');
        
    }
  };
  return { getUserFromHeader };
};
