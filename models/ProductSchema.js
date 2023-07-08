const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName:
  {
    type: String,
    required: true
  },
  description:
  {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
    required: true
  },
  flavour:
  {
    type: String,
    required: true
  },
  stock:
  {
    type: Number,
    required: true
  },
  size:
  {
    type: Number,
    required: true
  },
  price:
  {
    type: Number,
    required: true
  },

  image: [{
    type: String
  }
  ],
  isBlocked:
  {
    type: Boolean,
    default: false
  },
  offer: {
    type: Boolean,
    default: false
  },
  catoffer: {
    type: Boolean,
    default: false
  },
  offerPrice: {
    type: Number,
    default: 0
  },
  catofferPrice: {
    type: Number,
    default: 0
  },
  offerPercentage:{
    type: Number,
    default: 0
  },
  catofferPercentage:{
    type: Number,
    default: 0
  },
  offerStart:{
    type:Date,
    default: null
  },
  offerEnd:{
    type:Date,
    default: null
  },
  catofferEnd:{
    type:Date,
    default: null
  },
  catofferStart:{
    type:Date,
    default: null
  },
  
});


const Product = mongoose.model('Product', productSchema);

module.exports = Product;
