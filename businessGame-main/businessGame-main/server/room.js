import bcrypt from 'bcrypt-node';
import { models } from 'mongoose';
import { Socket } from 'socket.io';

module.exports = (app) => {
  const { authentication } = app.config.socket_auth;

  const getRooms = async (room_id) => {
    if (room_id) {
      const rooms = await app.models.room
        .where({ id: room_id })
        .fetch({ withRelated: ['user'] }, { require: false });
      return rooms;
    }
    const rooms = await app.models.room
      .forge()
      .fetchAll({ withRelated: ['user'] }, { require: false });
    return rooms;
  };

  app.io.on('connection', async (socket) => {
    socket.on('enter_room', async (data) => {
      try {
        const { token, room_id } = data;
        const user = await authentication(token);

        const roomFromDB = await getRooms(room_id);
        const room = roomFromDB.toJSON();

        const connected = {
          rooms_id: room.id,
          user_id: user.id,
        };

        const userInRoom = room.user.filter(
          (userCurr) => userCurr.id === user.id
        );

        if (userInRoom.length < 1) {
          await app.models.users_rooms
            .forge()
            .save({ ...connected, online: true }, { method: 'insert' });
        } else {
          await app.models.users_rooms
            .forge()
            .where(connected)
            .save({ online: true }, { method: 'update' });
        }
        socket.join(`${room.id}`);

        await app.models.user
          .forge()
          .where({ id: user.id })
          .save({ socket: socket.id.toString() }, { method: 'update' });

        const roomUpdated = await getRooms(room_id);
        const roomToFront = roomUpdated.toJSON();

        const usersON = roomToFront.user.filter(
          (user) => user._pivot_online && user
        );

        app.io.to(`${room.id}`).emit('enter_room_success', {
          msg: `Usuário ${user.name} entrou na sala!`,
          usersON,
        });

        roomToFront.online = usersON;

        app.io.to(`${room_id}`).emit('update_lobby', roomToFront);
        app.io.emit('update_room', roomToFront);
      } catch (err) {
        console.log(err);
      }
    });

    socket.on('kick_user', async (data) => {
      try {
        const { token, user_selected, room_id } = data;
        const user = await authentication(token);
        const roomFromDB = await getRooms(room_id);

        const { users_id } = roomFromDB.toJSON();

        if (users_id !== users.id) {
          return socket.emit('kick_room_response', {
            msg: 'Usuário sem autorização.',
          });
        }

        if (user_selected !== user.id) {
          await app.models.users_rooms
            .where({
              rooms_id: room_id,
              users_id: user_selected,
            })
            .save({ online: false }, { method: 'update' });

          const selectedFromDB = await app.models.user
            .where({ id: user_selected })
            .fetch({ require: false })
            .then((user) => user.toJSON());

          const socket_id = selectedFromDB.socket;

          const user_socket = app.io.sockets.connected[socket_id];
          if (user_socket) {
            user_socket.leave(`${room_id}`);
          }

          const roomUpdated = await getRooms(room_id);
          const roomToFront = roomUpdated.toJSON();

          const usersON = roomToFront.user.filter(
            (user) => user._pivot_online && user
          );

          roomToFront.online = usersON;

          app.io.emit('update_room', roomToFront);

          roomToFront.owner = true;

          app.io.to(`${room_id}`).emit('update_lobby', roomToFront);

          app.io
            .to(`${room_id}`)
            .emit('kick_user_sucess', { msg: 'Usuário foi removido da sala!' });
        }
      } catch (err) {
        console.log(err);
      }
    });

    socket.on('start_game', async (data) => {
      try {
        const id = data;
        const roomFromDB = await getRooms(id);
        if (roomFromDB) {
          const roomToFront = roomFromDB.toJSON();
          const userON = roomToFront.user.filter(
            (user) => user._pivot_online && user
          );

          roomToFront.online = userON;
          roomToFront.start = true;

          app.io.to(`${id}`).emit('update_lobby', roomToFront);
          app.io.emit('update_room', roomToFront);
        } else {
          return app.io
            .to(`${id}`)
            .emit('start_game_response', { msg: 'Sala inválida' });
        }
      } catch (err) {
        console.log(err);
      }
    });

    socket.on('exit_room', async (data) => {
      try {
        const { token, room_id } = data;

        const user = await authentication(token);
        await app.models.users_rooms
          .forge()
          .where({ rooms_id: room_id, users_id: user_id })
          .save({ online: false }, { method: 'update' });
        const roomFromDB = await getRooms(room_id);
        const room = roomFromDB.toJSON();

        socket.leave(`${room.id}`);

        const roomUpdated = await getRooms(room.id);
        const roomToFront = roomUpdated.toJSON();

        const usersON = roomToFront.user.filter(
          (user) => user._pivot_online && user
        );

        app.io
          .to(`${room.id}`)
          .emit('msg', { msg: `Usuário ${user.name} saiu na sala!`, usersON });

        roomToFront.online = usersON;

        app.io.emit('update_room', roomToFront);
        app.io.to(`${room_id}`).emit('update_lobby', roomToFront);
      } catch (err) {
        console.log(err);
      }
    });

    socket.on('disconnect', async () => {
      const socketID = socket.id.toString();
      const userDB = await app.models.user
        .where({ socket: socketID })
        .fetch({ require: false });
      if (userDB) {
        const user = userDB.toJSON();
        const userInRooms = await app.models.users_rooms
          .where({ users_id: user.id })
          .fetchAll({ require: false });
        const rooms = userInRooms.toJSON();
        if (rooms[0] !== null) {
          await app.models.users_rooms
            .where({ users_id: user.id })
            .save({ online: false }, { method: 'update' });
        }
      }
    });
  });
};
