  
import knex from 'knex';
import config from '../knexfile';
import bookshelf from 'bookshelf';
import mongoose from 'mongoose';

const knexInstance = knex(config);
const bookInstance = bookshelf(knexInstance);

mongoose.connect(process.env.DATABASE_MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log('MongoDB runing...'))
.catch((err) =>  console.log(err))


module.exports = {
  knex: knexInstance,
  bookshelf: bookInstance,
  mongoose
};