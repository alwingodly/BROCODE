const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const addressController = require('../controllers/addressController');
const cartController = require('../controllers/cartController')
const productController = require('../controllers/productController')
const wishlistController = require('../controllers/wishlistController')
const accountController = require('../controllers/accountController')
const orderController = require('../controllers/orderController')
const couponController = require('../controllers/couponController')
const User = require('../models/userSchema');

function checkSessionExpiration(req, res, next) {
  if (!req.session.user) {
    res.redirect('/');
  } else { 
    next();
  }
}
const checkBlockedUser = async (req, res, next) => {
  try {
    if (req.session && req.session.user) {
    
      const user = await User.findById(req.session.user._id);
     
      if (user.isBlocked) {
     
        req.session.user = null;
        return res.redirect('/');
      }
    }
    
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
router.use(checkBlockedUser);

const checkSession = (req, res, next) => {
  if (req.session && req.session.user) {
    if (req.path === '/usersignup' || req.path === '/userlogin') {
      console.log('resdirect')
      return res.redirect('/');
    }
  }

  console.log("session-checked")
  next();
};


//-----------------------------USER-------------------------------------------//

router.get('/usersignup',checkSession,userController.getSignup)//--------------------------GET SIGNUP PAGE
router.post('/usersignup', userController.registerUser)//----------------------------------FOR SIGNUP
router.get('/userlogin', checkSession ,userController.getUserLogin)//----------------------FOR LOGIN PAGE
router.post('/userlogin',userController.loginUser)//---------------------------------------FOR LOGIN
router.get('/emailId', userController.getEmailId)//----------------------------------------PAGE TO GET EMAILID
router.post('/forgot-password', userController.forgotPassword)//---------------------------TO GENERATE OTP FOR FORGOTPASSWORD
router.post('/verify-pass', userController.postForgotpasswordVerify)//---------------------VERIFY OTP FOR FORGOTPASSWORD
router.get('/new-password', userController.newPassword)//----------------------------------NEW PASSWORD PAGE
router.post('/new-pass', userController.postNewPassword)//---------------------------------NEW PASSWORD SAVED AND UPDATE SESSION
router.get('/verify', userController.getVerify)//------------------------------------------OTP IS GENERATED HERE
router.post('/verify', userController.postVerify)//----------------------------------------OTP IS VALIDATED HERE
router.get('/', checkSession,  userController.getHome)//-----------------------------------GET HOME PAGE
router.get("/logout", userController.logout)//---------------------------------------------LOGOUT

// ----------------------------PRODUCTS---------------------------------------//

router.get('/filter', productController.filterProducts)//-----------------------------------FILTER THE PRODUCTS
router.get('/product-details', checkSession,productController.getProductDetail)//-----------SHOW INDIVIDUAL PRODUCT DETAIL
router.get('/allproducts', checkSession, productController.getAllProducts)//----------------SHOW ALL PRODUCT
router.get('/search', productController.getSearch)//----------------------------------------TO SEARCH PRODUCTS

// --------------------CART----------------------//

router.get('/cartload', cartController.cartload)//-------------------------------------------TO LOAD ITEM TO CART DATABASE
router.get('/cart', cartController.cart)//---------------------------------------------------TO DISPLAY CART ITEMS TO THE PAGE
router.get('/removeCart', cartController.removeCart)//---------------------------------------TO REMOVE THE CART ITEMS
router.post('/updateQuantity', cartController.postUpdateQuantity)//--------------------------UPDATE THE QUANTITY OF A CART

// ----------------------------WISHLIST-------------------------------------//

router.get('/wishload', wishlistController.wishload)//---------------------------------------TO LOAD WISH ITEMS TO DATABASE
router.get('/wishlist', wishlistController.wishlist)//---------------------------------------TO SHOW THE WISHLST ITEMS TO PAGE
router.get('/removeWishlist', wishlistController.removeWishlist)//---------------------------TO REMOVE THE WISHLIST

// ------------------------------ADDRESS--------------------------//

router.get('/address',checkSession,checkSessionExpiration, addressController.address)//-----------------------------GET THE ADDRESS PAGE AFTER CART
router.get('/addressPage',checkSession,checkSessionExpiration, addressController.addressPage)//---------------------PAGE OF THE ADDRESS TO ADD NEW ADDRESS
router.post('/addaddress',checkSession,checkSessionExpiration,addressController.addAddress)//-----------------------SAVE THE ADDRESS IN THE DATABASE AND MOVE TO CHECKOUT
router.get('/addressEditPage',checkSession,checkSessionExpiration, addressController.addressEditPage)//-------------USED TO EDIT THE CURREST ADDRESS
router.post('/editaddress',checkSession,checkSessionExpiration,addressController.editAddress)//---------------------SAVE THE DITED ADDRESS DETAIL
router.get('/setdefault',checkSession,checkSessionExpiration,addressController.setDefaultAddress)//-----------------TO SET THE DESIRED ADDRESS DEFAULT

// -----------------------------ACCOUNT---------------------------//

router.get('/account',checkSession, checkSessionExpiration,accountController.accountDetails) //----------------------GET TO USER PROFILE PAGE
router.get('/accountAddress',checkSession,checkSessionExpiration, accountController.accountAddress)//----------------GET TO ADDRESS PAGE OF USER
router.get('/accountOrders',checkSession,checkSessionExpiration, accountController.accountOrders)//------------------GET TO ORDER PAGE OF USER
router.get('/deleteaddress',checkSession,checkSessionExpiration,addressController.deleteAddress)//-------------------TO DELETE THE ADDRESS IN THE ADDRES PAGE OF USER
router.post('/updateuser',checkSession,checkSessionExpiration,accountController.updateUser)//------------------------TO UPDATE THE USER PROFILE
router.get('/rewards',checkSession,checkSessionExpiration,accountController.getRewards)//----------------------------REWARDS
// --------------------------------ORDERS----------------------------//

router.get('/order',checkSession,checkSessionExpiration, orderController.orderCartAddress)//-------------------------ORDER PAGE CONTAINING PAYMENT DETAILS AND ALL
router.post('/orderprocess',checkSession,checkSessionExpiration, orderController.order)//----------------------------PAYMENT WORKING
router.get('/cancelproduct',checkSession,checkSessionExpiration, orderController.cancelProduct)//--------------------TO CANCEL THE PRODUCT WE ORDERD
router.get('/returnproduct',checkSession,checkSessionExpiration, orderController.returnProduct)//--------------------TO RETURNED THE PRODUCT WE ORDERED
router.post('/verify-payment',checkSession,checkSessionExpiration,orderController.verifyPayment)//-------------------TO VERIFY THE PAYMENT
router.get('/invoices',checkSession,checkSessionExpiration,orderController.invoice)//--------------------------------TO TAKE INVOICE DETAILS
router.get('/useWallet',checkSession,checkSessionExpiration,orderController.useWallet)//-----------------------------TO REDUCE THE WALLET AMOUNT

//-----------------------------------COUPON----------------------------//

router.post('/checkCoupon',checkSession,checkSessionExpiration,couponController.checkCoupon)


module.exports = router;
