var express = require('express');
var router = express.Router();
const Category = require('../models/categorySchema');
const Product = require('../models/ProductSchema')
const multer = require('multer');
const sharp = require('sharp');
const orderController = require('../controllers/orderController')
const salesController = require('../controllers/salesController')
const dashboardController = require('../controllers/dashboardController')
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')
const customerController = require('../controllers/customerController')
const offerController = require('../controllers/offerController')
const couponController = require('../controllers/couponController')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

const email = "admin@gmail.com";
const password = "123";

function requireLogin(req, res, next) {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin");
  }
}
var err_msg
router.get("/", (req, res) => {
  if (req.session.admin) {
    res.redirect("/admin/admin-panel");
  } 
  else {
    res.render("admin/admin-login", { err_msg});
    err_msg = null
  }
});

router.post("/adminsubmit", async (req, res) => {
  if (req.body.email === email && req.body.password === password) {
    req.session.admin = email;
    console.log(req.session.admin);
    res.cookie("admin", "true", { maxAge: 3600000 });
    res.redirect("/admin/admin-panel");
  } else {
    err_msg = "Invalid email or password.";
    res.redirect('/admin')
  }
});

router.get("/logout", (req, res) => {
  req.session.admin = false
  res.clearCookie("admin");
  res.redirect("/admin");
});



//----------------------------------------PRODUCT-----------------------------------------------//

router.get('/admin-panel/product', requireLogin,productController.getProduct)//----------------------GET ADMIN PRODUCT PAGE
router.get('/delete-product', requireLogin, productController.getDeleteProduct)//--------------------TO DELETE A PRODUCT FROM ADMIN PRODUCT PAGE
router.get("/block-product", requireLogin, productController.getBlockProduct)//----------------------BLOCK A PRODUCT
router.get("/unblock-product", requireLogin, productController.getUnblockProduct)//------------------UNBLOCK PRODUCT
router.get("/admin-panel/product/edit-product", requireLogin, productController.getEditproduct)//----GET EDIT PRODUCT PAGE
router.get("/admin-panel/product/add-product", requireLogin, productController.getAddProduct)//------ADD PRODUCT PAGE

router.post("/admin-panel/product/edit-product", requireLogin, upload.array("image", 3), async (req, res, next) => {
  try {
    console.log(req.body);
    const productId = req.body.productId; 
    const product = await Product.findById(productId);
    const existingImages = product.image;
    console.log(existingImages, "images");

    let uploadedImages = req.files.map(file => file.filename);
    if (!product) {
      
      throw new Error("Product not found");
    }
    if (uploadedImages === null || uploadedImages.length === 0) {
      uploadedImages = existingImages;
    }
    console.log(uploadedImages, "---------------------------------------------");
    // Update the product data with the submitted form data
    product.productName = req.body.productName;
    product.description = req.body.description;
    product.category = req.body.category;
    product.subcategory = req.body.subcategory;
    product.flavour = req.body.flavour;
    product.stock = req.body.stock;
    product.size = req.body.size;
    product.price = req.body.price;
    product.image = uploadedImages;

   
    await product.save();

    
    res.redirect("/admin/admin-panel/product");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});



router.post('/admin-panel/product/add-product', requireLogin, upload.array('image', 3), async (req, res, next) => {
  try {
    // Check if any files were uploaded
    if (!req.files || req.files.length === 0) {
      throw new Error('No files uploaded');
    }
    // Extract the filenames of the uploaded images
    const uploadedImages = req.files.map(file => file.filename);

    console.log(req.body);
    console.log(uploadedImages);

    const newProduct = new Product({
      productName: req.body.productName,
      description: req.body.description,
      category: req.body.category,
      subcategory: req.body.subcategory,
      flavour: req.body.flavour,
      stock: req.body.stock,
      size: req.body.size,
      price: req.body.price,
      image: uploadedImages,
    });

    await newProduct.save();

    res.redirect('/admin/admin-panel/product');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



//------------------------------------------------CATEGORY------------------------------------------------------//


router.get('/admin-panel/product/add-category',requireLogin,categoryController.getAddCategory)//--------------------TO ADD CATEGORY
router.get('/delete-category', categoryController.getDeleteCategory)//----------------------------------------------TO DELETE CATEGORY
router.get('/admin-panel/product/add-category/edit-category', requireLogin,categoryController.getEditCategory)//----EDIT CATEGORY PAGE
router.get("/block-category", requireLogin, categoryController.getBlockCategory)//----------------------------------BLOCK CATEGORY  
router.get("/unblock-category", requireLogin, categoryController.getUnblockCategory)//------------------------------UNBLOCK CATEGORY

// ----------------ADD CATEGORY----------------//


router.post('/admin-panel/product/add-category', upload.array('categoryImage', 3), async (req, res) => {
  try {
    const { category } = req.body;
    const uploadedImages = req.files.map(file => file.filename);
    if (!req.files || req.files.length === 0) {
      throw new Error('No files uploaded');
    }
    
    // Check if the category name already exists
    const existingCategory = await Category.findOne({ category });
    if (existingCategory) {
      const categories = await Category.find();
      res.render('admin/category', { admin: true,categories,error: 'Category name already exists' });
      return;
    }
    
    console.log(category);
    console.log(uploadedImages);
    
    const newCategory = await Category.create({ category, categoryImage: uploadedImages });
    res.redirect('/admin/admin-panel/product/add-category');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



// POST route to update the category
router.post('/admin-panel/product/add-category/edit-category', requireLogin, upload.array('categoryImage', 3), async (req, res, next)=> {
  try {
    const categoryId = req.query.categoryId;
    const category = await Category.findById(categoryId);
    const existingImages = category.categoryImage;
    console.log(existingImages, "images");
    
    if (!category) {
      throw new Error('Category not found');
    }

    let uploadedImages = req.files.map(file => file.filename);
    if (uploadedImages === null || uploadedImages.length === 0) {
      uploadedImages = existingImages;
    }
    category.category = req.body.categoryName;
    category.categoryImage = uploadedImages;

    await category.save();

    res.redirect('/admin/admin-panel/product/add-category');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


//---------------------------------------SUB CATEGORY---------------------------------//

router.get("/admin-panel/product/add-subcategory", requireLogin, categoryController.getAddSubcategory)//-----------ADD SUBCATEGORY PAGE
router.post('/admin-panel/product/add-subcategory', categoryController.postAddSubcategory)//-----------------------ADD SUBCATEGORY TO THE DATABASE
router.get('/delete-subcategory', categoryController.getDeleteSubcategory)//---------------------------------------GET DELETE SUBCATEGORY

//-----------------------------------------CUSTOMER------------------------------------//

router.get("/admin-panel/coustomer", requireLogin, customerController.getCustomer)//-------------------------------GET CUSTOMER PAGE
router.post("/admin-panel/coustomer/:customerId/block", requireLogin, customerController.postBlockCustomer)//------BLOCK A CUSTOMER
router.post("/admin-panel/coustomer/:customerId/unblock", requireLogin, customerController.postUnblockCustomer)//--UNBLOCK CUSTOMER
router.post("/admin-panel/coustomer/:customerId/delete", requireLogin, customerController.postDeleteCustomer)//----DELETE CUSTOMER

//--------------------------------------ORDER-------------------------------------------//

router.get('/admin-panel/order', requireLogin, orderController.orderDetails)
router.post('/orderstatus', requireLogin, orderController.orderStatus)

//-------------------------------------COUPON-------------------------------------------//

router.get("/admin-panel/coupon", requireLogin, couponController.coupon)
router.post("/createCoupon", requireLogin, couponController.createCoupon)


//------------------------------------SALES REPORT------------------------------------//

router.get('/admin-panel/sales-report',requireLogin,salesController.salesReport)
router.get('/sales-form',requireLogin,salesController.salesForm)
router.get('/sales-report/search', salesController.getSalesReport);

//--------------------------------------DASHBOARD-------------------------------------/?

router.get("/admin-panel", requireLogin, dashboardController.dashboard) 

//----------------------------------------OFFER---------------------------------------//
router.get("/admin-panel/offer", requireLogin, offerController.getOffer)
router.post('/productOffer',requireLogin, offerController.productOffer )
router.get('/removeOffer',requireLogin,offerController.getRemoveOffer)
router.post('/categoryOffer',requireLogin, offerController.categoryOffer )
router.get('/removeCatOffer',requireLogin,offerController.getCatRemoveOffer)
// Export the router
module.exports = router;

