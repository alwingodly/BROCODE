const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true,
  },
  categoryImage: [{
    type: String
  }],
  isBlocked: {
    type: Boolean,
    default: false
  },
  offer: {
    type: Boolean,
    default: false
  },
  catofferPercentage:{
    type: Number,
    default: 0
  },
  catofferStart:{
    type:Date,
    default: null
  },
  catofferEnd:{
    type:Date,
    default: null
  }
});


const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
