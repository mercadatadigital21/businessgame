import axios from 'axios';
import jwt from 'jwt-simple';

module.exports = (app) => {
  const socialAuth = async (req, res) => {
    const user = {
      name: null,
      email: null,
      facebook_id: null,
    };

    const { token } = req.params;

    try {
      let tokenUrl = '';

      switch (req.query.type) {
        case 'facebook':
          tokenUrl = `https://graph.facebook.com/me?access_token=${token}&fields=id,name,email`;
          break;
        case 'google':
          tokenUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
          break;

        default:
          return res
            .status(400)
            .send('Parametro de autenticação não reconhecido');
      }

      await axios
        .get(tokenUrl)
        .then((response) => {
          user.name = response.data.name;
          user.email = response.data.email;
          if (req.query.type === 'facebook')
            user.facebook_id = response.data.id;
          if (req.query.type === 'google') user.google_id = response.data.id;
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send(err);
        });

      const userConfirm = await app.models.user
        .where({ email: user.email })
        .fetch({ require: false });

      if (userConfirm) userConfirm = userConfirm.toJSON();

      let payload = {}

      if (
        userConfirm !== null &&
        userConfirm !== undefined &&
        userConfirm.lenght >= 1
      ) {
        const now = Math.floor(Date.now() / 1000);

        payload = {
          id: userConfirm.id,
          name: userConfirm.name,
          email: userConfirm.email,
          iat: now,
        };

        res.status(200).send({
          ...payload,
          token: jwt.encode(payload, process.env.LOCAL_AUTH_SECRET),
        });
      } else {
        const newUser = await app.models.user.forge(user).save();

        const now = Math.floor(Date.now() / 1000);

        payload = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          iat: now,
        };

        res.status(200).send({
          ...payload,
          token: jwt.encode(payload, process.env.LOCAL_AUTH_SECRET),
        });
      }
    } catch (err) {
      console.log(err);
      res.status(400).send('Token inválido.');
    }
  };
  return{socialAuth}
};