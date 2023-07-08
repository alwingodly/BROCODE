const Category = require('../models/categorySchema');
const SubCategory = require('../models/subCategorySchema');
const Product = require('../models/ProductSchema')



exports.getAddCategory = async (req, res) => {
    try {
      const categories = await Category.find(); // Assuming you have a Category model
  
      res.render('admin/category', { categories , admin: true ,error: null});
      error = ""
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }

//--------------------DELETE CATEGORY--------------------//

exports.getDeleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.query;
    console.log("category id = ", categoryId);
    // Check if the category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).send('Category not found');
    }

    // Delete the category
    await Category.findByIdAndDelete(categoryId);
    console.log("category delete");

    // Delete all associated subcategories
    await SubCategory.deleteMany({ category: categoryId });
 
  // Delete all associated subcategories
     await Product.deleteMany({ category: categoryId });
  

    res.redirect('/admin/admin-panel/product/add-category');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

//----------------------EDIT CATEGORY-----------------//

exports.getEditCategory = async (req, res, next) => {
  try {
    const categoryId = req.query.categoryId;
    const category = await Category.findById(categoryId);
    res.render('admin/editCategory', { admin: true, category });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

//---------------------BLOCK CATEGORY-----------------//

exports.getBlockCategory = async (req, res, next) => {
  try {
    const categoryId = req.query.categoryId;
    const category = await Category.findById(categoryId);
    
    if (!category) {
      throw new Error("Category not found");
    }

    category.isBlocked = true;
    await category.save();

    res.redirect("/admin/admin-panel/product/add-category");
  } catch (error) {
    next(error);
  }
}

//================UNBLOCK CATEGORY------------------------//

exports.getUnblockCategory = async (req, res, next) => {
  try {
    const categoryId = req.query.categoryId;
    const category = await Category.findById(categoryId);
    
    if (!category) {
      throw new Error("Category not found");
    }

    category.isBlocked = false;
    await category.save();

    res.redirect("/admin/admin-panel/product/add-category");
  } catch (error) {
    next(error);
  }
}

//--------------------ADD SUBCATEGORY----------------//

exports.getAddSubcategory = async (req, res, next) => {
  try {
    const categories = await Category.find({ isBlocked: { $ne: true } }).lean(); // Fetch categories where isBlocked is not true
    const subcategories = await SubCategory.find().populate('category').lean();
    res.render('admin/subcategory', { categories, subcategories, admin: true });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

exports.postAddSubcategory = async (req, res) => {
  try {
    const { category, subCategory } = req.body;
    const categoryDocument = await Category.findById(category); // Find category by its ID
    if (!categoryDocument) {
      return res.status(404).send('Category not found');
    }
    const newSubCategory = await SubCategory.create({
      category: categoryDocument._id,
      subCategory
    });
    res.redirect('/admin/admin-panel/product/add-subcategory');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

//--------------------DELETE SUBCATEGORY-----------------//

exports.getDeleteSubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.query;
    // Check if the category exists
    const subcategory = await SubCategory.findById(subcategoryId);
    if (!subcategory) {
      return res.status(404).send('SubCategory not found');
    }

    // Delete the category
    await SubCategory.findByIdAndDelete(subcategoryId);

    res.redirect('/admin/admin-panel/product/add-subcategory');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}