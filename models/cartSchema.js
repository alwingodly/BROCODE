const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
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
    orderstatus: {
      type: String
    },
    deliverystatus: {
      type: String
    },
    image: [{
      type: String
    }],
    count: {
      type: Number,
      default: 0
    },
    offerPrice: {
      type: Number,
      default: 0
    },
    offerEnd: {
      type: Date,
      default: null
    },
    cartOffer: {
      type: Boolean,
      default: false
    }
  }],
  totalprice: {
    type: Number
  },
  discountCode:{
    type:String
  },
  couponDiscount:{
    type:Number,
    default: 0
  },
  walletAmount:{
    type:Boolean,
    default: false
  },
  manageTotal:{
    type: Number
  }
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
