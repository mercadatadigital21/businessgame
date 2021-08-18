import config from 'config';

module.exports = (app) => {
  const sum = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);
  const save = async (req, res) => {
    const { id } = req.user;
    const { industry } = req.body;

    try {
      const savedRoomDB = await app.models.saved_room
        .forge()
        .save({ users_id: id, industry });

      const savedRoom = savedRoomDB.toJSON() || null;

      return res.status(200).send(savedRoom);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  };

  const get = async (req, res) => {
    try {
      const { id: userId } = req.user;

      let savedRoomsDB = await app.models.room
        .where({ owner_id: userId, users_max: 1 })
        .fetchAll({ require: false });

      savedRoomsDB = savedRoomsDB.toJSON();

      if (savedRoomsDB.length <= 1)
        return res.status(400).send('Sem jogos salvos.');

      let coinsToFront = Number;

      const coins = await app.models.gameData.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: { roomId: '$roomId' },
            total: { $sum: '$coins' },
          },
        },
      ]);

      savedRoomsDB.forEach(async (element) => {
        let type = await app.models.users_rooms
          .where({
            rooms_id: element.id,
            users_id: userId,
          })
          .fetch();

        type = type.toJSON();

        for (let j = 0; j < coins.length; j++) {
          if (element.id === coins[j]._id.roomId) {
            if (coins[j].total > 0) {
              element.coins = coins[j].total + coinsToFront;
            }
          } else {
            element.coins = coinsToFront;
          }
        }
      });

      return res.status(200).send(savedRoomsDB);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  };

  const getById = async (req, res) => {
    const { id: userId } = req.user;
    const { id: roomId } = req.params;

    try {
      let savedRoomDB = await app.models.room
        .where({ id: roomId })
        .fetch({ require: false });

      if (savedRoomDB) {
        savedRoomDB = savedRoomDB.toJSON();
      } else {
        return res.status(400).send('Não têm salas');
      }
      let coinsToFront = Number;

      let usersOnline = await app.models.users_rooms
        .where({ rooms_id: roomId, online: true })
        .fetchAll({ require: false });
      usersOnline = usersOnline.toJSON();

      let coins = await app.models.gameData.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: { roomId: '$roomId' },
            total: { $sum: '$coins' },
          },
        },
      ]);

      let type = await app.models.room_user
        .where({
          rooms_id: roomId,
          users_id: userId,
        })
        .fetch({ require: false });

      if (!type) {
        type = await app.models.room_user
          .forge()
          .save(
            { users_id: userId, rooms_id: roomId, online: true },
            { method: 'insert' }
          );
      }

      type = type.toJSON();

      for (let j = 0; j < coins.length; j++) {
        if (savedRoomDB.id === coins[j]._id.roomId) {
          if (coins[j].total === 0) {
            coins = coinsToFront;
          } else {
            coins = coins[j].total + coinsToFront;
          }
        }
      }

      if (typeof coins === 'object') {
        coins = coinsToFront;
      }
      // console.log(savedRoomDB, coins, usersOnline.length);

      const frontObject = {
        ...savedRoomDB,
        coins,
        length: usersOnline.length,
      };

      return res.status(200).send(frontObject);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  };

  return { save, get, getById }
};
