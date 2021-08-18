module.exports = (app) => {
  const Rooms = app.database.bookshelf.model('Rooms', {
    tableName: 'rooms',
    user() {
      return this.belongsToMany('Users', 'users_rooms', 'rooms_id', 'users_id').withPivot(['online'])
    },
  });

  return Rooms;
};
