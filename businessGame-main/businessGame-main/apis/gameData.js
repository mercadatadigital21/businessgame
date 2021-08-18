module.exports = (app) => {
  const game = async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { id: roomId } = req.params;
      let roomFromDB = await app.models.room.where({ id: roomId }).fetch();
      roomFromDB = roomFromDB.toJSON();
      const { month } = roomFromDB;

      let userFromDB = await app.models.coins.where({ id: userId }).find();
      userFromDB = userFromDB.toJSON();

      const purchaseInMonth =
        sum(equipmentObject) +
        sum(employeesObject) +
        sum(rawMaterialObject) +
        sum(trainingObject) +
        sum(maintenanceObject) +
        sum(freightgObject);

      const totalLost = sum(lostObject) + sum(capacityLost);
      console.log(purchaseInMonth, totalLost);

      await app.models.coins.where({ id: userId }).update({
        userId,
        roomId,
        object,
        month,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }

    try {
      const gameData = {
        userId,
        roomId,
        month,
        game: arrayToFront,
        pel,
      };   

      await app.models.coins.create(gameData);

      const conditions = { roomId };
      const update = { $inc: { expire: -1 } };

      const newGame = await app.models.gameProducts.updateMany(
        conditions,
        update
      );

      const roomLength = await app.models.gameData
        .where({
          roomId,
          month,
        })
        .find();

      let usersOnline = await app.models.room_user
        .where({ rooms_id: roomId, online: true })
        .fetchAll();

      if (usersOnline) {
        usersOnline = usersOnline.toJSON();
      } else {
        return res.status(400).send('Nenhum user on');
      }
      console.log(usersOnline.length, roomLength.length);

      if (roomLength.length === usersOnline.length) {
        app.io.to(`${roomId}`).emit('update_game', true);
        await app.models.room
          .query()
          .where({ id: roomId })
          .increment('month', 1);
        return res.status(200).send('Mês finalizado');
      }
      return res
        .status(400)
        .send(`${req.user.name} aguarde os outros jogadores`);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  };
  return { game };
};
