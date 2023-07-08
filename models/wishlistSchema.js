const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  products: [{
    prodId: {
      type: String,
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    subcategory: {
      type: String,
      required: true
    },
    flavour: {
      type: String,
      required: true
    },
    stock: {
      type: Number,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    image: [{
      type: String
    }]
  }]
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
