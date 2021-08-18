const room = require('../models/room');

module.exports = (app) => {
  const { existsOrError } = app.utils.validator;

  const encryptPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  };

  const create = async (req, res) => {
    try {
      const { name, industry, users_max, lock, password } = req.body;

      const room = {
        name,
        industry,
        users_max,
        lock,
        password,
      };

      if (req.params.id) room.id = req.params.id;

      if (lock) {
        if (!password) {
          return res.status(400).send('Senha não informada!');
        }
        room.password = encryptPassword(password);
      } else {
        room.password = null;
      }

      if (!room.id) {
        try {
          existsOrError(name, 'Nome da sala não informado.');
        } catch (err) {
          return res.status(400).send(err);
        }

        // if (
        //   users_max < 1 ||
        //   users_max > 8 ||
        //   typeof users_max !== 'number' ||
        //   !Number.isInteger(users_max)
        // ) {
        //   return res
        //     .status(400)
        //     .send('Valor de usuários maximo da sala iválido!');
        // }

        try {
          await app.models.room
            .forge({
              name,
              industry,
              users_max,
              lock,
              password,
              user_id: req.user.id,
            })
            .save();
          const roomFromDB = await app.models.room
            .where({ name: room.name })
            .fetch({ require: false, withRelated: ['user'] })
            .then((room) => room.toJSON());
            
          roomFromDB.online = [];

          app.io.emit('create_room', roomFromDB);

          return res.status(200).send(roomFromDB);
        } catch (err) {
          if (err.errno === 1062) {
            return res.status(400).send('Nome de sala já existe');
          }
          console.log(err);
          res.status(500).send(err);
        }
      } else {
        try {
          const roomFromDB = await app.models.room
            .where({ id: req.params.id })
            .fetch({ require: false })
            .then((room) => room.toJSON());
          const { user_id } = roomFromDB;

          if (user_id === req.user.id) {
            roomFromDB.save(name, industry_type, lock, password, users_max, {
              method: 'update',
            });

            return res.status(200).send('Sala atualizada com sucesso!');
          }
          return res.status(400).send('Usuário sem permissão!');
        } catch (err) {
          res.status(500).send(err);
        }
      }
    } catch (err) {
      return res.status(400).send(err);
    }
  };

  const get = async (req, res) => {
    try {
      const { id } = req.user;

      if (!id) {
        const roomsFromDB = await app.models.room
          .forge()
          .fetchAll({ require: false, withRelated: ['user'] });

        if (!roomsFromDB) {
          return res.status(400).send('Sala não encontrada.');
        }
        const rooms = roomsFromDB.toJSON();
        const showRooms = rooms.map((room) => {
          room.online = room.user.filter((user) => user._pivot_online && user);
          return room;
        });
        return res.status(200).send(showRooms);
      }

      const roomsFromDB = await app.models.room
        .where({ user_id: id })
        .fetchAll({ require: false, withRelated: ['user'] });
      if (!roomsFromDB) {
        return res.status(400).send('Sala não encontrada.');
      }

      const rooms = roomsFromDB.toJSON();
      const showRooms = rooms.map((room) => {
        room.online = room.user.filter((user) => user._pivot_online && user);
        return room;
      });
      return res.status(200).send(showRooms);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  };

  const getById = async (req, res) => {
    try {
      const { id } = req.user;

      const roomFromDB = await app.models.room
        .where({ id })
        .fetch({ require: false, withRelated: ['user'] });

      const room = roomFromDB.toJSON();
      const usersON = room.user.filter((user) => user._pivot_online && user);

      room.online = usersON;

      return res.status(200).send(room);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  };

  return { create, get, getById };
};
