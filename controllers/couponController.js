const Coupon = require('../models/couponSchema')
const couponCode = require('coupon-code');
const Cart = require('../models/cartSchema');
const Usedcoupons = require('../models/usedCoupon')

exports.coupon = async (req, res) => {
    try{
      const coupon = await Coupon.find()
      console.log(coupon,"🤞");
        res.render("admin/coupon", { admin: true , coupon});
    }
    catch(err){
        console.error(err);
      res.render('error');
    }
  }


  
  // createCoupon route handler
exports.createCoupon = async (req, res) => {
  try {
    const priceRange = req.body.priceRange;
    const discountAmount = req.body.discountAmount;
    const expirationDate = req.body.expirationDate;
console.log(req.body,"🐱‍🚀");
    // Generate the coupon code
    const options = {
      parts: 3,
      partLen: 4,
      pattern: 'LCN',
    };
    let coupon = couponCode.generate(options);
    console.log(coupon,"😃");
  

   const coupons = new Coupon({
      couponCode: coupon,
      priceRange: priceRange,
      discountAmount: discountAmount,
      expirationDate: expirationDate,
   })
   console.log(coupons,"🐱‍👤🐱‍👤");
   await coupons.save()
  

    res.redirect("/admin/admin-panel/coupon");
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};



exports.checkCoupon = async (req, res) => {
  try {
    const couponCode = req.body.couponCode;
    const totalPrice = req.body.totalPrice;
    const loggedInUserId = req.session.user;
    console.log(req.body, "🐱‍👤");

    const coupon = await Coupon.findOne({ couponCode: couponCode });
    let cartItem = await Cart.findOne({ userId: loggedInUserId });
    let usedCoupon = await Usedcoupons.findOne({ userId: loggedInUserId });
    const usedCouponCodes = usedCoupon ? usedCoupon.usedCoupon.map(item => item.couponCodes) : [];
    
    if (coupon) {
      const priceRange = coupon.priceRange;
      
      if (totalPrice >= priceRange && !usedCouponCodes.includes(couponCode)) {
        cartItem.totalprice = totalPrice - coupon.discountAmount;
        cartItem.discountCode = couponCode;
        cartItem.couponDiscount = coupon.discountAmount;
        console.log(cartItem, "cartItem with discountCode 😎");
        await cartItem.save();
        res.status(200).json({ success: true });
      } else {
        let error = "Buy more products to apply this coupon";
        res.status(400).json({ success: false, error: error });
      }
    } else {
      let error = "Invalid Coupon";
      res.status(400).json({ success: false, error: error });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
