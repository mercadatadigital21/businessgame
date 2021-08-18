module.exports = (app) => {
  const { existsOrError } = app.utils.validator;

  const me = async (req, res) => {
    try {
      const { id } = req.user;

      const userFromDB = await app.models.user.where({ id }).fetch();
      const roomFromDB = await app.models.room
        .where({ users_id: id })
        .fetchAll({ require: false });
      const room = roomFromDB ? roomFromDB.toJSON() : false;

      const user = userFromDB.toJSON();
      user.room = room;

      return res.status(200).send(user);
    } catch (err) {
      console.log(err);
      return res.status(500).send();
    }
  };

  const getById = async (req, res) => {
    const { id } = req.params;

    try {
      let getUserFromDB = await app.models.user
        .where({ id })
        .fetchAll({ require: false });

      getUserFromDB = getUserFromDB.toJSON();

      return res.status(200).send(getUserFromDB);
    } catch (err) {
      console.log(err);
      return res.status(500).send();
    }
  };

  const remove = async (req, res) => {
    try {
      const { id } = req.user;

      const userFromBD = await app.models.user.where({ id }).fetch();
      if (userFromBD.deleteAt !== null)
        return res.status(200).send('Usuário já deletado.');

      const update = await app.models.user
        .where({ id })
        .update({ deleteAt: new Date() });
      existsOrError(update, 'Usuário não encontrado.');

      return res.status(200).send('Usuário deletado com sucesso.');
    } catch (err) {
      console.log(err);
      return res.status(500).send();
    }
  };

  return { me, getById, remove };
};
