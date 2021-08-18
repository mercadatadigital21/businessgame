module.exports = (app) => {
    const marketplaceSchema = new app.database.mongoose.Schema({
      createdAt: {
        type: Date,
        default: Date.now,
      },
      inventory: Array,
      faithfulness: Object,
      type: String,
      price: Number,
      userId: Number,
      roomId: Number,
      month: Number,
    });
  
    return app.database.mongoose.model('marketplace', marketplaceSchema);
  };