module.exports = (app) => {
  const RoomUser = app.database.bookshelf.model('RoomUser', {
    tableName: 'users_rooms',
    user() {
      return this.belongsToMany('Users', 'users_rooms', 'rooms_id', 'users_id');
    },
    room() {
      return this.belongsToMany('Rooms', 'users_rooms', 'users_id', 'rooms_id');
    },
  });

  return RoomUser
};
