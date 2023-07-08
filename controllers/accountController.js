const Address = require('../models/addressSchema');
const User = require('../models/userSchema');
const Order = require('../models/orderSchema');
const Wallet = require('../models/walletSchema');
const Coupon = require('../models/couponSchema')
const Usedcoupons = require('../models/usedCoupon')
exports.accountDetails = async (req, res) => {
  try {
    const loggedInUserId = req.session.user;
    console.log(loggedInUserId, "userId");

    // Retrieve the user details from the database using the logged in user ID
   ;
    const coupons = await Coupon.find()
    const user = await User.findById(loggedInUserId);
    const wallet = await Wallet.findOne({ userId: loggedInUserId });
    console.log(user,"user");
    res.render('user/account', { user: user, use: true , wallet , coupons });
  } catch (err) {
    console.log(err);
    res.render('error');
  }
};
  exports.accountAddress = async(req , res) => {
    try {
      const loggedInUserId = req.session.user;
      console.log(loggedInUserId);
    const addresses = await Address.find({ userId: loggedInUserId }).sort({ default: -1 });
    console.log("address", addresses)
   
    res.render('user/accountAddress', { user: loggedInUserId, addresses, use: true });
    } catch (err) {
      console.log(err);
      res.render('error');
    }
  };
  

  exports.accountOrders = async (req, res) => {
    try {
      const loggedInUserId = req.session.user;
      
      // Retrieve the orders for the logged-in user
      const order = await Order.find({ userId: loggedInUserId });
      const wallet = await Wallet.findOne({ userId: loggedInUserId });
      for (const orderS of order) {
        const allProductsDelivered = orderS.products.every((product) => product.deliverystatus === "delivered");
        if (allProductsDelivered) {
          // Update the deliveryStatus of the order to "Delivered" if all products are delivered
          orderS.deliverystatus = "Delivered";
          await orderS.save();
        }
        
      }
      
      res.render('user/accountOrders', { order, user: loggedInUserId,  wallet ,use: true });
    } catch (err) {
      console.log(err);
      res.render('error');
    }
  };
  
  
   
  exports.updateUser = async (req, res) => {
    try {
      const { username, email, number, gender } = req.body;
  
      // Find the user in the database and update their information
      const user = await User.findOneAndUpdate(
        { email:email }, // Specify the user to update based on a unique identifier (e.g., username)
        {username: username, number: number, gender: gender }, // Update the desired fields
        { new: true } // Return the updated user document
      );
  
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      res.redirect('/account'); // Redirect to the account page or a success page
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  }

  exports.getRewards = async (req, res) => {
    try {
      const loggedInUserId = req.session.user;
      const coupons = await Coupon.find();
      const currentDate = new Date();
      
      for (const coupon of coupons) {
        
        
        if (currentDate > coupon.expirationDate) {
          coupon.active = false;
          coupon.save();
        }
      }
      let usedCoupon = await Usedcoupons.findOne({ userId: loggedInUserId });
      const usedCouponCodes = usedCoupon ? usedCoupon.usedCoupon.map(item => item.couponCodes) : [];
      console.log(usedCouponCodes,"used codes..................😉😉😉");
      res.render('user/rewards', { coupons, user: loggedInUserId, use: true, usedCouponCodes });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  };
  
  
  // exports.cancelledFilter = async (req, res) => {
  //   try {
  //     const loggedInUserId = req.user.id;
  //     const order = await Order.find({ userId: loggedInUserId, 'products.orderstatus': 'cancelled' });
  
  //     res.json({ order, success });
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).send('Internal Server Error');
  //   }
  // };
  