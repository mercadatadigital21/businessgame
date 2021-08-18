module.exports = app => {
    const coinSchema = new app.database.mongoose.Schema({
        coins: Number,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        game: Object,
        pel: Array,
        userId: Number,
        roomId: Number,
        month: Number,
        progress: Date
      });

      return app.database.mongoose.model('Coin', coinSchema);
}
