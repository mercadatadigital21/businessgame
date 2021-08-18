module.exports = (app) => {
    const productsSchema = new app.database.mongoose.Schema({
      createdAt: {
        type: Date,
        default: Date.now,
      },
      object: Array,
      type: String,
      remaining: Number,
      price: Number,
      expire: Number,
      userId: Number,
      roomId: Number,
      month: Number,
    });
  
    return app.database.mongoose.model('products', productsSchema);
  };
  