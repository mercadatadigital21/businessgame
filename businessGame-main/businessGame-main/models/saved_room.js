module.exports = (app) => {
  const SavedRooms = app.database.bookshelf.model('SavedRooms', {
    tableName: 'saved_rooms',
    user() {
      return this.belongsTo('Users');
    },
  });
  return SavedRooms;
};
