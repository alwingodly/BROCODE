const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subCategory: {
    type: String,
    required: true
  },
  isBlocked:
   { 
      type: Boolean,
       default: false 
   }
});

const SubCategory = mongoose.model('SubCategory', subCategorySchema);
module.exports = SubCategory;
