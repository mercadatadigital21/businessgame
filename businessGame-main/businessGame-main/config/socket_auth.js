module.exports = (app) => {
  const authentication = async (data) => {
    try {
      const payload = decode(data, process.env.LOCAL_AUTH_SECRET);
      const userDB = await app.models.user
        .forge()
        .where({ id: payload.id })
        .fetch({ columns: ['id', 'name'] })
        .then((user) => user.toJSON());

      if (!userDB) return 'Usuário inválido.';

      return userDB;
    } catch (err) {
      console.log(err);
      return 'Erro ao autenticar o usuário ou token expirado.';
    }
  };

  return { authentication };
};
