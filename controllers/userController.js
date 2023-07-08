const User = require('../models/userSchema')
const Cart = require('../models/cartSchema');
const Category = require('../models/categorySchema');
const Product = require('../models/ProductSchema')
const bcrypt = require('bcrypt');
const Wallet = require('../models/walletSchema');
const serviceSid= process.env.TWILIO_SERVICE_SID
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
//---------------------------------------------GET SIGNUP PAGE----------------------------------------//

exports.getSignup = (req, res) => {
  res.render('user/user-signup');
}

//---------------------------------------------
exports.registerUser = async (req, res) => {
  try {
    const { username, email, number, password } = req.body;
    console.log("enter to signup");

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
    
      const error = 'Email is already in use. Please choose a different email.';
      return res.render('user/user-signup', { error });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    req.session.userData = {
      username,
      email,
      number,
      password: hashedPassword
    };

    res.redirect('/verify');

  } catch (err) {
    console.error('Error saving user:', err);
    // Handle the error, e.g., render an error page or redirect to a failure page
    res.render('error', { error: 'An error occurred while saving the user.' });
  }
};
//-------------------------------------------------------------GET USER LOGIN--------------------------------------------//

exports.getUserLogin = (req, res) => {
  error = ''
  res.render('user/user-login',{error});
}

//--------------------------------------------------------------POST USER LOGIN---------------------------------------------//
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("enter to login");

  try {

    const user = await User.findOne({ email });

    if (!user) {
  
      return res.render('user/user-login', { error: 'Invalid email or password' });
    }

    if (user.isBlocked) {

      return res.render('user/user-login', { error: 'Your account has been blocked. Please contact support.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
     
      return res.render('user/user-login', { error: 'Invalid email or password' });
    }
    req.session.user = user;
    console.log(req.session.user, "user session");

    res.redirect('/');
  } catch (err) {
    console.error('Error during user login:', err);
    
    res.render('error');
  }
};
//------------------------------------------------------------HOME----------------------------------------------------------------//
exports.getHome = async (req, res) => {
  try {
    let user = null;
    if (req.session && req.session.user) {
      user = req.session.user;
    }
    const loggedInUserId = req.session.user;
    // const cartItems = await Cart.find({ userId: loggedInUserId });
    // const wallet = await Wallet.findOne({ userId: loggedInUserId });
    // if(cartItems && wallet){
    //   for (const cartItem of cartItems) {
    //     if(cartItem.walletAmount!==0)
    //     console.log(cartItem.walletAmount);
    //     if(wallet){
    //     wallet.wallet = cartItem.walletAmount
    //     await wallet.save()
    //     }
    //     await cartItem.save();
    //   }
      
    // }else{
    //   console.log("nothing");
    // }
   
    // Set a cookie
    // res.cookie('myCookie', 'cookieValue', { maxAge: 3600000});

    const categories = await Category.find();
    const products = await Product.find().populate('category').populate('subcategory');
    const currentDate = new Date();
        for(const product of products){
          if(product.offer === true && currentDate > product.offerEnd){
            product.offer = false;
            product.offerPercentage = 0;
            product.offerStart = null;
            product.offerEnd = null;
            product.offerPrice = 0;
            product.catofferStart = null;
            product.catofferEnd = null;
            product.save();
          }
          if(product.catoffer === true && currentDate > product.category.catofferEnd){
            product.catoffer = false;
            product.category.offer = false
            product.category.catofferStart = null
            product.category.catofferEnd = null
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
      
    res.render('user/home', { categories, products, user, use: true });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}


// ----------------------------------------------------------FORGOT PASSWORD SECTION----------------------------------------------//

exports.forgotPassword = async (req, res) => {

  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (user) {
      if (!user.isBlocked) {
    const number = user.number;
    console.log("USER-NUMBER"+number)
    client.verify.v2.services(serviceSid)
   .verifications
   .create({
    to:'+91'+number,
    channel:'sms'
   })
   .then((verification)=>{
    console.log(verification.sid,"the otp is generated ")
    //  res.render('user/otp',{other:true,number,otpErr :req.session.otpErr })
   })
    
    res.render('user/forgot-password', {number , email});
  } else {
    res.status(403).send('User is blocked');
  }
  }
} catch (err) {
    console.error('Error generating OTP:', err);
    // Handle the error, e.g., render an error page or redirect to a failure page
    
  }
}

// ------------------------------------------EMAIL REQUIRED FOR FORGOTPASSWORD-------------------------------//

exports.getEmailId = (req, res) => {
  try{
    res.render('user/emailId');
  }
  catch(err){
    console.error("error to this page", err)
    res.render('error', { error: 'An error occurred while rendering' });
  }
}
//-----------------------------------------NEW PASSWORD PAGE-------------------------------------------------//
exports.newPassword =  (req, res) => {
  res.render('user/new-password');
}
//-------------------------------------------NEW PASSWORD SAVED----------------------------------------------//
exports.postNewPassword = async (req, res) => {
  const email = req.query.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email });

    if (user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password =  hashedPassword;
      await user.save();
      req.session.user = user
      res.redirect('/')
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}
//------------------------------------------OTP IS GENERATED HERE----------------------------------------------//
exports.getVerify = async (req, res) => {
  try {

    const number = req.session.userData.number;
    console.log(number)
    client.verify.v2.services(serviceSid)
   .verifications
   .create({
    to:'+91'+number,
    channel:'sms'
   })
   .then((verification)=>{
    console.log(verification.sid,"the otp is generated ")
    //  res.render('user/otp',{other:true,number,otpErr :req.session.otpErr })
   })
    
    res.render('user/OTP', {number: req.session.userData.number});

  } catch (err) {
    console.error('Error generating OTP:', err);
    // Handle the error, e.g., render an error page or redirect to a failure page
    res.render('error', { error: 'An error occurred while generating OTP.' });
  }
}

// --------------------------------------------------OTP VALIDATION IS DONE HERE----------------------------------------//

exports.postVerify = async (req, res) => {
  const otp= req.body.otp;
  const number = req.query.number;
  console.log(number)
  console.log(otp);
  client.verify.v2.services(serviceSid)
  .verificationChecks
  .create({
    to:'+91'+number,
    code: otp
  })
  .then( async (verification)=>{
    console.log("GET VARIFICATION");
    console.log(verification,"otp verification status")
    if(verification.valid === true){
      console.log("otp valid")
      const { username, email, number, password } = req.session.userData;
      console.log(req.session.userData.number);
      const newUser = new User({
        username,
        email,
        number,
        password,
      });
      await newUser.save();
      req.session.user = newUser;
      res.redirect('/');
    }
    else{
      res.render('user/OTP', { email: req.session.userData.email, error: 'Invalid OTP. Please try again.' });
    }
  })
  .catch((error)=>{
    console.log(error)
  })
}

//-------------------------------------------------------LOGOUT--------------------------------------------//

exports.logout = (req, res) => {
  req.session.user = false
  res.clearCookie('/')
  res.redirect("/");
}

//-------------------------------

exports.postForgotpasswordVerify = async (req, res) => {
  const otp= req.body.otp;
  const number = req.query.number;
  console.log(number)
  console.log(otp);
  client.verify.v2.services(serviceSid)
  .verificationChecks
  .create({
    to:'+91'+number,
    code: otp
  })
  .then( async (verification)=>{
    console.log(verification,"otp verification status")
    if(verification.valid === true){
      console.log("otp vlid")
      console.log(req.query.email)
      email = req.query.email;
      res.render('user/new-password',{email});
    }
    else{
      res.render('user/forgot-password', { email, error: 'Invalid OTP. Please try again.' });
    }
  })
  .catch((error)=>{
    console.log(error)
  })
}

