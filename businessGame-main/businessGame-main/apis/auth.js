import jwt from 'jwt-simple';
import bcrypt from 'bcrypt-node';

module.exports = (app) => {
  const { existsOrError, equalsOrError } = app.utils.validator;
  
  const encryptPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  };

  const signin = async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).send('Informe email e senha.');
      }

      const userFromDB = await app.models.user
        .where({ email })
        .fetch({ require: false });
      const user = userFromDB.toJSON();

      if (!user) return res.status(400).send('Usuário não encontrado');

      const isMatch = bcrypt.compareSync(password.toString(), user.password);

      if (!isMatch) return res.status(400).send('Email ou senha inválidos');

      const now = Math.floor(Date.now() / 1000);

      const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        iat: now,
      };

      try {
        return res.json({
          ...payload,
          token: jwt.encode(payload, process.env.LOCAL_AUTH_SECRET),
        });
      } catch (e) {
        console.log(e);
        return res.status(500).send();
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send();
    }
  };

  const signup = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    const { id } = req.query;
    
    try {
      if (!id) {
        existsOrError(name, 'Nome não informado.');
        existsOrError(email, 'E-mail não informado.');

        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const match = re.test(email.toLowerCase());

        if (!match) {
          return res.status(400).send('E-mail inválido!');
        }
        existsOrError(password, 'Senha não informada.');
        existsOrError(confirmPassword, 'Confirmação de senha não informada.');
      } else {
        if (password) {
          equalsOrError(password, confirmPassword, 'Senhas não conferem.');
        }
      }
    } catch (err) {
      return res.status(400).send(err);
    }

    try {
      if (id) {
        await app.models.user
          .where({ id })
          .save({ name, email, password: encryptPassword(password) });
      } else {
        await app.models.user
          .forge({ id })
          .save({ name, email, password: encryptPassword(password)} );
      }
      return res.status(200).send('Usuário cadastrado.');
    } catch (err) {
      console.log(err);
      if (err === 1062) return res.status(400).send('Usuário já cadastrado.');
      return res.status(500).send();
    }
  };

  return { signin, signup };
};
