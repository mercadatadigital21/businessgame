exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('name').notNull();
      table.string('password').notNull();
      table.string('email').unique().notNull();
      table.enu('role', ['Super_Admin', 'Admin', 'User']);
      table.datetime('created_at').defaultTo(knex.fn.now());

      table.string('facebook_id');
      table.string('google_id');

      table.timestamp('deletedAt');
    }),

    knex.schema.createTable('rooms', (table) => {
      table.increments('id').primary();
      table.string('name').unique();
      table.integer('week').defaultTo(1);
      table.integer('month').defaultTo(1)

      table.integer('users_max').unsigned().defaultTo()

      table.boolean('lock').defaultTo(false);
      table.string('password');

      table.integer('user_id').unsigned();
      table.foreign('user_id').references('users.id');
    }),

    knex.schema.createTable('users_rooms', (table) => {
      table.increments('id').primary();

      table.integer('rooms_id').unsigned();
      table.foreign('rooms_id').references('id').inTable('rooms');

      table.integer('users_id').unsigned();
      table.foreign('users_id').references('id').inTable('users');

      table.boolean('online').defaultTo(false);
      table.string('socket');
      table.timestamp('offline_at');
    }),

    knex.schema.createTable('products', table => {
      table.increments('id').primary()

      table.boolean('rawMaterial').defaultTo(8000)
    })
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTable('users'),
    knex.schema.dropTable('rooms'),
    knex.schema.dropTable('users_rooms'),
    knex.schema.dropTable('products')
  ]);
};
