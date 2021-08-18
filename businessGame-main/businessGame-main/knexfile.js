const dotenv = require('dotenv')

dotenv.config()

module.exports = {
  client: 'mysql',
  connection: {
    database: process.env.DATABASE,
    port: 3306,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './database'
  },
};
