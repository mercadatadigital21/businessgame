module.exports = (app) => {
  const Users = app.database.bookshelf.model('Users', {
    tableName: 'users',
  });

  return Users;
};
