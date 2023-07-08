const Cart = require('../models/cartSchema');
const Category = require('../models/categorySchema');
const Product = require('../models/ProductSchema')
const User = require('../models/userSchema');
const SubCategory = require('../models/subCategorySchema');
// ------------------------------------------------------------------USER SIDE-------------------------------------------------------------//


// -------------------FILTER PRODUCTS----------------- //


exports.filterProducts = async (req, res) => {
  try {
    let products = await Product.find()
      .populate('category')
      .populate('subcategory');

    const success = products.length > 0;

    // Filtering by categories
    const selectedCategories = req.query.category;
    if (selectedCategories && selectedCategories.length > 0 && !selectedCategories.includes('all')) {
      products = products.filter(product => selectedCategories.includes(product.category.category));
      console.log("filtered by category");
    }

    // Filtering by subcategories
    const selectedSubcategories = req.query.subcategory;
    if (selectedSubcategories && selectedSubcategories.length > 0 && !selectedSubcategories.includes('all')) {
      products = products.filter(product => selectedSubcategories.includes(product.subcategory.subCategory));
      console.log("filtered by subcategory");
    }

    // Filtering by flavors
    const selectedFlavors = req.query.flavor;
    if (selectedFlavors && selectedFlavors.length > 0 && !selectedFlavors.includes('all')) {
      products = products.filter(product => selectedFlavors.includes(product.flavour));
      console.log("filtered by flavor");
    }

    // Filtering by sizes
    const selectedSizes = req.query.size;
    if (selectedSizes && selectedSizes.length > 0 && !selectedSizes.includes('all')) {
      products = products.filter(product => selectedSizes.includes(product.size.toString()));
      console.log("filtered by size");
    }

    // Filtering by price range
    const selectedPriceRange = req.query.price;
    if (selectedPriceRange && selectedPriceRange.length > 0) {
      const minPrice = parseInt(selectedPriceRange[0][0]);
      const maxPrice = parseInt(selectedPriceRange[0][1]);
      products = products.filter(product => {
        const productPrice = product.price;
        return productPrice >= minPrice && productPrice <= maxPrice;
      });
    }

    const sortOption = req.query.sort;
    if (sortOption === 'price-low-to-high') {
      products.sort((a, b) => a.price - b.price);
      console.log("price ascending ordered");
    } else if (sortOption === 'price-high-to-low') {
      products.sort((a, b) => b.price - a.price);
      console.log("price descending ordered");
    } else if (sortOption === 'size-low-to-high') {
      products.sort((a, b) => a.size - b.size);
      console.log("size ascending ordered");
    } else if (sortOption === 'size-high-to-low') {
      products.sort((a, b) => b.size - a.size);
      console.log("size descending ordered");
    }

    // Filtering out blocked products
    products = products.filter(product => !product.blocked);

    res.json({ products, success });
  } catch (err) {
    console.log(err);
    res.render('error');
  }
};


    // ---------------------------------------PRODUCT DETAIL PAGE-------------------------------------------------------------//

    exports.getProductDetail = async (req, res) => {
      try {
        const productId = req.query.productId; 
        console.log(productId,"product-id")
        const product = await Product.findById(productId).populate('category').populate('subcategory'); 
        const categories = await Category.find();

        const currentDate = new Date();
        
          if(product.offer === true && currentDate > product.offerEnd){
            product.offer = false;
            product.offerPercentage = 0;
            product.offerStart = null;
            product.offerEnd = null;
            product.offerPrice = 0;
            
            product.save();
          }
          if(product.catoffer === true && currentDate > product.catofferEnd){
            product.catoffer = false
            // product.category.offer = false
            // product.category.catofferStart = null
            // product.category.catofferEnd = null
            product.catofferStart = null;
            product.catofferEnd = null;
          }
        
       for (const category of categories){
        if(category.offer === true && currentDate > category.catofferEnd){
          category.offer = false
          category.catofferStart = null
          category.catofferEnd = null
          category.save()
        }
       }


        console.log(product,"Products")
        let user = req.session.user;
        res.render('user/product-details', {
          product, 
          use: true,
          user
        });
      } catch (err) {
        console.log(err);
        res.render('error');
      }
    }

    // ----------------------------------ALL PRODUCTS-----------------------------------//

    exports.getAllProducts = async (req, res) => {
      try {
        const categories = await Category.find();
        const subcategories = await SubCategory.find();
        const products = await Product.find().populate('category').populate('subcategory');
        const currentDate = new Date();
        for(const product of products){
          if(product.offer === true && currentDate > product.offerEnd){
            product.offer = false;
            product.offerPercentage = 0;
            product.offerStart = null;
            product.offerEnd = null;
            product.offerPrice = 0;
            
            product.save();
          }
          if(product.catoffer === true && currentDate > product.catofferEnd){
            product.catoffer = false
            // product.category.offer = false
            // product.category.catofferStart = null
            // product.category.catofferEnd = null
            product.catofferStart = null;
            product.catofferEnd = null;
          }
        }
       for (const category of categories){
        if(category.offer === true && currentDate > category.catofferEnd){
          category.offer = false
          category.catofferStart = null
          category.catofferEnd = null
          category.save()
        }
       }
        let user = req.session.user;
        res.render('user/products', {
          categories,
          subcategories,
          products,
          use: true,
          user
        });
      } catch (err) {
        console.log(err);
        res.render('error');
      }
    }

    // --------------------------------SEARCH---------------------------------------//
    Product.schema.index({ productName: 'text' });
    Category.schema.index({ category: 'text' });
    SubCategory.schema.index({ subCategory: 'text' });
    
    exports.getSearch = async (req, res) => {
      try {
        const searchTerm = req.query.searchTerm;
        const categories = await Category.find();
        const subcategories = await SubCategory.find();
        let products = [];
        console.log(searchTerm);
        if (searchTerm) {
         
          const categoryResults = await Category.find({ $text: { $search: searchTerm } });
          const subCategoryResults = await SubCategory.find({ $text: { $search: searchTerm } });
          const productResults = await Product.find({ $text: { $search: searchTerm } });
    
        
          const categoryIds = categoryResults.map((category) => category._id);
          const subCategoryIds = subCategoryResults.map((subCategory) => subCategory._id);
          const productIds = productResults.map((product) => product._id);
    
        
          products = await Product.find({
            $or: [
              { category: { $in: categoryIds } },
              { subcategory: { $in: subCategoryIds } },
              { _id: { $in: productIds } }
            ]
          })
            .populate('category')
            .populate('subcategory');
        }
    
        let user = req.session.user;
        res.render('user/products', {
          categories,
          subcategories,
          products,
          searchTerm,
          user,
          use: true
        });
      } catch (err) {
        console.log(err);
        res.render('error');
      }
    }


//------------------------------------------------------------ADMIN SIDE---------------------------------------------------------------//    
//------------------------------------------------------------ADMIN SIDE---------------------------------------------------------------//    
//------------------------------------------------------------ADMIN SIDE---------------------------------------------------------------//    
//------------------------------------------------------------ADMIN SIDE---------------------------------------------------------------//    
//------------------------------------------------------------ADMIN SIDE---------------------------------------------------------------//    


exports.getProduct = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate('category', 'category') 
      .populate('subcategory', 'subCategory'); 
    res.render('admin/product', { products, admin:true });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

//-------------------DELETE PRODUCT--------------------//

exports.getDeleteProduct = async (req, res) => {
  try {
    const productId = req.query.productId;
    if(!productId){
      return res.status(404).send('id not found');
    }
    console.log("products id = ",productId)
    const product = await Product.findById(productId);
    console.log("products found");
    if (!product) {
      return res.status(404).send('Category not found');
    }
    
    await Product.findByIdAndDelete(productId);
    console.log("Product successfully deleted");
    res.redirect('/admin/admin-panel/product');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

//-------------------BLOCK PRODUCT--------------------//

exports.getBlockProduct  = async (req, res, next) => {
  try {
    const productId = req.query.productId;
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new Error("Category not found");
    }

    product.isBlocked = true;
    await product.save();

    res.redirect("/admin/admin-panel/product");
  } catch (error) {
    next(error);
  }
}

//---------------UNBLOCK PRODUCT------------------//

exports.getUnblockProduct = async (req, res, next) => {
  try {
    const productId = req.query.productId;
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new Error("product not found");
    }

    product.isBlocked = false;
    await product.save();

    res.redirect("/admin/admin-panel/product");
  } catch (error) {
    next(error);
  }
}

//-------------EDIT PRODUCT----------------------//

exports.getEditproduct = async (req, res, next) => {
  try {
    const productId = req.query.productId;
  
    const categories = await Category.find();
    const subcategories = await SubCategory.find();
    const product = await Product.findById(productId).populate('category').populate('subcategory');
    if (!product) {
      
      throw new Error("Product not found");
    }
   
    console.log(product)
    res.render("admin/editProduct", { admin: true, product,subcategories,categories });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

//-----------ADD PRODUCT------------------------//

exports.getAddProduct = async (req, res, next) => {
  try {
    const categories = await Category.find();
    const subcategories = await SubCategory.find();
    res.render('admin/addProduct', { admin: true, categories, subcategories });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}