const Cart = require('../models/cartSchema');
const Address = require('../models/addressSchema');
const Order = require('../models/orderSchema');
const Wallet = require('../models/walletSchema');
const Razorpay = require("razorpay");
const mongoose = require('mongoose')
const Usedcoupons = require('../models/usedCoupon');
const Product = require('../models/ProductSchema');
const { log } = require('console');
const ObjectId = mongoose.Types.ObjectId;

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

exports.orderCartAddress = async (req, res) => {
  try {
    const loggedInUserId = req.session.user;
    const addressId = req.query.addressId;
    console.log(addressId, "ID of order address");
    const wallet = await Wallet.findOne({ userId: loggedInUserId });
    const cartItems = await Cart.find({ userId: loggedInUserId });
    
    
    console.log(wallet,"wallet management done from order");
    // Retrieve the details of the address with the provided ID
    const userAddresses = await Address.findOne({ userId: loggedInUserId });
    const addressDetails = userAddresses.addresses.find(address => address._id.toString() === addressId);
    console.log(addressDetails, "Local address");
    console.log(cartItems,"looooooooooooooooooooooooooooooooooooooooooook");

    res.render('user/order', { cartItems, user: loggedInUserId, address: addressDetails, wallet, use: true });
  } catch (err) {
    console.log(err);
    res.render('error');
  }
};


//---------------------------------------WALLET USEAGE--------------------------------------------------------//

exports.useWallet = async(req , res)=>{
  try{
       const loggedInUserId = req.session.user;
       let cartItem = await Cart.findOne({ userId: loggedInUserId });
       const wallet = await Wallet.findOne({ userId: loggedInUserId });
        
        cartItem.totalprice-=wallet.wallet
        cartItem.walletAmount = true
        await cartItem.save()
        res.status(200).json({ success: true });
  }catch (err) {
    console.log(err);
    res.render('error');
  }
}












// ------------------------------------------------------ORDER PLACED------------------------------------------------//


exports.order = async (req, res) => {
  try {
    const loggedInUserId = req.session.user;
    const addressId = req.body.addressId;
    let totalPrice = req.body.totalPrice;
    const managetotal = req.body.manageTotal;
    console.log(managetotal,"managetotal---------------------------------");
    const cart = await Cart.findOne({ userId: loggedInUserId });
    const userAddresses = await Address.findOne({ userId: loggedInUserId });
    const wallet = await Wallet.findOne({ userId: loggedInUserId });
    console.log(cart.walletAmount,"wallet amount is true or false????????????????????????????????");
      if(cart.walletAmount === true){
        wallet.wallet = 0
        await wallet.save()
        totalPrice =managetotal
      }
   
    const addressDetails = userAddresses.addresses.find(
      (address) => address._id.toString() === addressId
    );
    
    let status = req.body.paymentMethod === "COD" ? "placed" : "pending";
    
    const orderProducts = cart.products.map((product) => {
      const price = product.cartOffer === true ? product.offerPrice : product.price;
      return {
        name: product.productName,
        image: product.image[0],
        category: product.category,
        subcategory: product.subcategory,
        prodId: product.prodId,
        quantity: product.count,
        size: product.size,
        price: price,
        orderStatus: "",
        deliveryStatus: "",
      };
    });
    
    const newOrder = new Order({
      deliveryDetails: {
        userName: addressDetails.userName,
        state: addressDetails.state,
        house: addressDetails.house,
        landmark: addressDetails.landmark,
        city: addressDetails.city,
        zip: addressDetails.zip,
        number: addressDetails.number,
        email: addressDetails.email,
        type: addressDetails.type,
      },
      userId: loggedInUserId,
      paymentMethod: req.body["paymentMethod"],
      products: orderProducts,
      totalAmount: totalPrice,
      paymentstatus: status,
      deliverystatus: "not Shipped",
      returnStatus: "",
      discount: "",
      deliveryDate: null,
      returnDate: null,
      reason: "",
      discount:cart.couponDiscount,
      createdAt: new Date(),
    });

    console.log("Order saved successfully");
    let orderId = newOrder._id;
    let orderIdString = orderId.toString();
    console.log(orderIdString, "order id string");









    if (req.body["paymentMethod"] === "COD") {
      const cart = await Cart.findOne({ userId: loggedInUserId });
      console.log("COD❤❤");
      if (cart.discountCode !== null) {
        let usedCoupon = await Usedcoupons.findOne({ userId: loggedInUserId });
        if (!usedCoupon) {
          usedCoupon = new Usedcoupons({
            userId: loggedInUserId,
            usedCoupon: [{
              couponCodes: cart.discountCode
            }]
          });
        } else {
          usedCoupon.usedCoupon.push({
            couponCodes: cart.discountCode
          });
        }
        console.log(usedCoupon, "🤣🤣🤣🤣🤣🤣🤣");
        await usedCoupon.save();
      }
      

      res.json({ codSuccess: true });


      console.log("-----------------ENTER TO ORDER MANAGEMENT-------------------");
      
     const productsData = [].concat(...cart.products.map(product => ({ prodId: product.prodId, count: product.count })));
console.log(productsData, "array of productIds and counts");

const productIds = productsData.map(item => item.prodId);
console.log(productIds, "array of productIds");

const products = await Product.find({ _id: { $in: productIds } });

for (const product of products) {

  const { prodId, count } = productsData.find(item => item.prodId.toString() === product._id.toString());
  await product.save();
}

      console.log('---------------ORDER MANAGEMENT SUCCESS😘---------------------');
      await newOrder.save();
      cart.products = [];
      cart.totalprice = 0
      cart.manageTotal =0
      cart.walletAmount = false
      await cart.save();
    } 









    
    else if (req.body["paymentMethod"] === "Wallet") {
      const cart = await Cart.findOne({ userId: loggedInUserId });
      console.log(wallet.wallet, "wallet before............................");
      wallet.wallet = wallet.wallet - newOrder.totalAmount
      try {
        await wallet.save();
        console.log("wallet updated sucessfully");
      } catch (err) {
        console.error(err);
       
      }
      console.log(wallet.wallet, "wallet after...................................");
      if (cart.discountCode !== null) {
        let usedCoupon = await Usedcoupons.findOne({ userId: loggedInUserId });
        if (!usedCoupon) {
          usedCoupon = new Usedcoupons({
            userId: loggedInUserId,
            usedCoupon: [{
              couponCodes: cart.discountCode
            }]
          });
        } else {
          usedCoupon.usedCoupon.push({
            couponCodes: cart.discountCode
          });
        }
        console.log(usedCoupon, "🤣🤣🤣🤣🤣🤣🤣");
        await usedCoupon.save();
      }
      
      
      res.json({ codSuccess: true })
      console.log("-----------------ENTER TO ORDER MANAGEMENT-------------------");
     
const productsData = [].concat(...cart.products.map(product => ({ prodId: product.prodId, count: product.count })));
console.log(productsData, "array of productIds and counts");

const productIds = productsData.map(item => item.prodId);
console.log(productIds, "array of productIds");

const products = await Product.find({ _id: { $in: productIds } });

for (const product of products) {
  const { prodId, count } = productsData.find(item => item.prodId.toString() === product._id.toString());
  
  console.log("Product stock updated:", product.stock, "Count:", count);
  await product.save();
}

      console.log('---------------ORDER MANAGEMENT SUCCESS😘---------------------');
      await newOrder.save();
      cart.products = [];
      cart.totalprice = 0
      cart.manageTotal =0
      cart.totalAmount = false
      await cart.save();
    }
    else if (req.body["paymentMethod"] === "Razorpay") {
      console.log("Razorpay selected😍😍");
      console.log(newOrder._id, "id of order");
      var options = {
        amount: newOrder.totalAmount * 100,
        currency: "INR",
        receipt: orderIdString,
      };
      console.log(options);

      instance.orders.create(options, function (err, order) {
        if (err) {
          console.error(err);
          res.status(500).json({ error: "Error creating Razorpay order" });
        } else {
          console.log(order, "new order");
          res.json({ order: order, newOrder: newOrder, price: totalPrice }); // Send the order as a JSON response
        }
      });
    } else {
      console.log("Payment method not selected");
      res.status(400).json({ error: "Payment method not selected" });
    }

    for (const product of orderProducts) {
      const cartProduct = cart.products.find((item) => item.prodId === product.prodId);
      if (cartProduct) {
        cartProduct.count -= product.quantity;

        // Update the product count in the database
        const updatedProduct = await Product.findById(product.prodId);
        updatedProduct.stock -= product.quantity;
        console.log(updatedProduct, "up");
        await updatedProduct.save();
      }
    }

    // await newOrder.save();
    // cart.products = [];
    // await cart.save();

  } catch (err) {
    console.error(err);
    res.render("error");
  }
};

// -----------------------------------------------------VARIFY PAYMENT-----------------------------------------------//


exports.verifyPayment = async (req, res) => {
  const loggedInUserId = req.session.user;
  console.log(req.body.price);
  const newOrder = {};
  for (const key in req.body) {
    if (key.startsWith('newOrder[')) {
      const nestedKeys = key.slice('newOrder['.length, -1).split('][');
      let currentObject = newOrder;
      for (let i = 0; i < nestedKeys.length - 1; i++) {
        if (!currentObject[nestedKeys[i]]) {
          currentObject[nestedKeys[i]] = {};
        }
        currentObject = currentObject[nestedKeys[i]];
      }
      currentObject[nestedKeys[nestedKeys.length - 1]] = req.body[key];
    }
  }
  console.log(newOrder, "--------------------------------------------------------------------------------------------");
  try {
    const cart = await Cart.findOne({ userId: loggedInUserId });
    const orderProducts = cart.products.map((product) => {
      const price = product.cartOffer === true ? product.offerPrice : product.price;
      return {
        name: product.productName,
        image: product.image[0],
        category: product.category,
        subcategory: product.subcategory,
        prodId: product.prodId,
        quantity: product.count,
        size: product.size,
        price: price,
        orderStatus: "",
        deliveryStatus: "",
      };
    });
    

    const newoder = new Order({
      deliveryDetails: {
        userName: newOrder.deliveryDetails.userName,
        state: newOrder.deliveryDetails.state,
        house: newOrder.deliveryDetails.house,
        landmark: newOrder.deliveryDetails.landmark,
        city: newOrder.deliveryDetails.city,
        zip: newOrder.deliveryDetails.zip,
        number: newOrder.deliveryDetails.number,
        email: newOrder.deliveryDetails.email,
        type: newOrder.deliveryDetails.type
      },
      userId: newOrder.userId,
      paymentMethod: newOrder.paymentMethod,
      products: orderProducts,
      totalAmount: newOrder.totalAmount,
      paymentstatus: newOrder.paymentstatus,
      deliverystatus: newOrder.deliverystatus,
      deliverySubtracted: newOrder.deliverySubtracted,
      discount: newOrder.discount,
      deliveryDate: newOrder.deliveryDate,
      returnDate: newOrder.returnDate,
      reason: newOrder.reason,
      discount: newOrder.discount,
      createdAt: newOrder.createdAt
    });
    console.log(newoder, "😉😉😉😉😉😉😉😉😉😉😉");
    let details = req.body;
    console.log(details, "detail");
    const crypto = require("crypto");
    let hmac = crypto.createHmac("sha256", "jcjoEs8uH8MNudasaIC3fq1D");
    hmac.update(
      details['payment[razorpay_order_id]'] + "|" + details['payment[razorpay_payment_id]']
    );
    hmac = hmac.digest("hex");
    console.log(hmac, "hmac value");
    let orderResponse = details['order[receipt]']
    console.log(orderResponse, "order-response 2");
    let orderObjId = new ObjectId(orderResponse);
    console.log(orderObjId, "1");
    let price = req.body.price * 100
    console.log(price);
    console.log(details['order[amount]']);
    if (hmac === details['payment[razorpay_signature]'] && details['order[amount]'] == price) {
      const cart = await Cart.findOne({ userId: loggedInUserId });
      
      if (cart.discountCode !== null) {
        let usedCoupon = await Usedcoupons.findOne({ userId: loggedInUserId });
        if (!usedCoupon) {
          usedCoupon = new Usedcoupons({
            userId: loggedInUserId,
            usedCoupon: [{
              couponCodes: cart.discountCode
            }]
          });
        } else {
          usedCoupon.usedCoupon.push({
            couponCodes: cart.discountCode
          });
        }
        console.log(usedCoupon, "🤣🤣🤣🤣🤣🤣🤣");
        await usedCoupon.save();
      }
      


      const productsData = [].concat(...cart.products.map(product => ({ prodId: product.prodId, count: product.count })));
      console.log(productsData, "array of productIds and counts");
      
      const productIds = productsData.map(item => item.prodId);
      console.log(productIds, "array of productIds");
      
      const products = await Product.find({ _id: { $in: productIds } });
      
      for (const product of products) {
        const { prodId, count } = productsData.find(item => item.prodId.toString() === product._id.toString());
        product.stock -= count;
        console.log("Product stock updated:", product.stock, "Count:", count);
        await product.save();
      }
      
      console.log('---------------ORDER MANAGEMENT SUCCESS😘---------------------');
      await newoder.save();
      cart.products = [];
      cart.totalprice = 0
      cart.manageTotal =0
      cart.walletAmount = false
      await cart.save();
      await Order.updateOne(
        { _id: orderObjId },
        {
          $set: {
            paymentstatus: "placed",
          },
        }
      );

      console.log("payment is successful");

      res.json({ status: true });
    } else {
      await Order.updateOne(
        { _id: orderObjId },
        {
          $set: {
            paymentstatus: "failed",
          },
        }
      );
      console.log("payment is failed");
      res.json({ status: false, errMsg: "" });
    }
  } catch (error) {
    console.log(error, "error");
  }
};



exports.cancelProduct = async (req, res) => {
  try {
    const productId = req.query.productId;
    const orderId = req.query.orderId;
    const loggedInUserId = req.session.user;
    const orders = await Order.find({ userId: loggedInUserId });
    console.log(productId, "product");


    const order = orders.find((order) => order._id.toString() === String(orderId));
    console.log(order, "this order found in user's order database 😍");
    if (!order) {
      console.log("error in your logic😒");
    }
    else {
      const product = order.products.find((product) => product.prodId.toString() === String(productId));
      if (product) {

        console.log("------------------ENTER TO CANCEL ORDER MANAGEMENT SECTION-----------------");

        const prodId = product.prodId
        const Prod = await Product.findById(prodId);
        console.log( Prod.stock,"stock BEFORE cancel order management👀");
        Prod.stock = Prod.stock + product.quantity
        console.log( Prod.stock,"stock AFTER cancel order management👀");
        await Prod.save()

        console.log("------------------ENTER TO CANCEL PRODUCT REQUEST SECTION-----------------");
       
        console.log(product, "product to be cancelled");
        product.orderstatus = "cancelled";
        console.log(product.orderstatus, "--------------------->");

        const allProductsCancelled = order.products.every((product) => product.orderstatus === "cancelled");
        if (allProductsCancelled) {

          order.deliverystatus = "cancelled";
        }
        try {
          await order.save();
          console.log(order, "updated order after cancelled")
          console.log("Order saved successfully");
        } catch (error) {
          console.error("Error saving order:", error);
          throw error;
        }

      }


    }
    return res.redirect('/accountOrders');

  } catch (err) {
    console.log(err);
    res.render('error');
  }
};




exports.returnProduct = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const productId = req.query.productId;
    const loggedInUserId = req.session.user;
    const orders = await Order.find({ userId: loggedInUserId });
    const order = orders.find((order) => order._id.toString() === String(orderId))
   
    if (orders.length === 0) {
      return res.render('error', { message: 'No orders found for the user.' });
    }

      const product = order.products.find((product) => product.prodId.toString() === String(productId));
      
      if (product) {

        console.log("------------------ENTER TO RETURN ORDER MANAGEMENT SECTION-----------------");

        const prodId = product.prodId
        const Prod = await Product.findById(prodId);
        console.log( Prod.stock,"stock BEFORE return order management👀");
        Prod.stock = Prod.stock + product.quantity
        console.log( Prod.stock,"stock AFTER return order management👀");
        await Prod.save()

        console.log("------------------ENTER TO PROUDCT RETURN REQUEST SECTION-----------------");

        console.log("the product to be returned is found");
        product.orderstatus = "returned"
        console.log(product.orderstatus);
        await order.save();
      }
   
    return res.redirect('/accountOrders');
  } catch (err) {
    console.log(err);
    res.render('error');
  }
};

exports.invoice = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const order = await Order.findById(orderId);
  
    if (order) {
      const deliveredProduct = order.products.find(product => product.deliverystatus === 'delivered');
      console.log(order,deliveredProduct);
      if (deliveredProduct) {
        res.json({ order, product: deliveredProduct });
      } else {
        res.status(404).json({ message: 'No delivered product found.' });
      }
    } else {
      res.status(404).json({ message: 'Order not found.' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};






// --------------------------------------------------- ADMIN SIDE -----------------------------------------------//
// --------------------------------------------------- ADMIN SIDE -----------------------------------------------//
// --------------------------------------------------- ADMIN SIDE -----------------------------------------------//
// --------------------------------------------------- ADMIN SIDE -----------------------------------------------//


exports.orderDetails = async (req, res) => {
  try {

    const order = await Order.find();
    // console.log(order);

    res.render('admin/order', { order, admin: true });
  } catch (err) {
    console.log(err);
    res.render('error');
  }
};

// exports.orderStatus = async (req, res) => {
//   try {
//     const orderId = req.query.orderId;
//     const productId = req.query.productId;
//     const deliveryStatus = req.body.deliveryStatus;

//     const order = await Order.findById(orderId);
//     const product = order.products.find((product) => product.prodId.toString() === productId);

//     // Update the delivery status of the product
//     product.deliverystatus = deliveryStatus;

//     // Set DeliveredAt to current time if deliveryStatus is 'delivered'
//     if (deliveryStatus === 'delivered') {
//       product.DeliveredAt = new Date();
//     }

//     // Save the updated order
//     await order.save();

//     res.redirect('/admin/admin-panel/order');
//   } catch (err) {
//     console.log(err);
//     res.render('error');
//   }
// };




exports.orderStatus = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const productId = req.query.productId;
    const deliveryStatus = req.body.deliveryStatus;
    console.log(deliveryStatus, "cancelled or returned");
    const order = await Order.findById(orderId).populate('userId');
    const product = order.products.find((product) => product.prodId.toString() === productId);

    
    product.deliverystatus = deliveryStatus;

    if (deliveryStatus === 'delivered') {
      product.DeliveredAt = new Date();
      product.orderstatus = 'delivered'
    }

    if (deliveryStatus === 'returned' || deliveryStatus === 'cancelled') {
      console.log("-------------------------------ENTER-------------------------------");
      product.deliverystatus = "finished"

      if (order.paymentMethod === 'COD' && deliveryStatus === 'cancelled') {
        console.log(order.paymentMethod, "---------------------------------------------------->");
        console.log(deliveryStatus, "---------------------------------------------------->");
        product.orderstatus = deliveryStatus;
        const productAmount = product.quantity * product.price;
        product.quantity = 0;
        product.price = 0;

        order.totalAmount -= productAmount;
        console.log(order.totalAmount, "total updated from adminside");
        if (order.deliverySubtracted === false && order.totalAmount <= 100) {
          order.totalAmount -= 3;
          order.deliverySubtracted = true;
          console.log(order.totalAmount, "subtract delivery");
        }

      }


      else if ((order.paymentMethod === 'COD' || order.paymentMethod === 'Razorpay' || order.paymentMethod === 'Wallet') && deliveryStatus === 'returned') {
        console.log(order.paymentMethod, "---------------------------------------------------->");
        console.log(deliveryStatus, "---------------------------------------------------->");
        product.orderstatus = deliveryStatus;
        const productAmount = product.quantity * product.price;
        product.quantity = 0;
        product.price = 0;

      
       
        console.log(order.totalAmount, "total updated from adminside");
        if (!order.deliverySubtracted && order.totalAmount <= 100) {
          order.totalAmount -= 3;
          order.deliverySubtracted = true;
          
        }
      
        order.totalAmount -= productAmount;
        console.log(order.totalAmount, "subtract (delivery + product cost)");
        
        let wallet = await Wallet.findOne({ userId: order.userId });

        if (!wallet) {
          
          wallet = new Wallet({
            userId: order.userId,
            wallet: 0

          });
          console.log("new wallet created");
        }
        console.log(wallet,"wallet before update");
        console.log(productAmount, "amount to add with wallet");
        wallet.wallet += productAmount;
        // let cartItem = await Cart.findOne({ userId: order.userId });
        // if(cartItem){
        //   for(const cart of cartItem){
        //     if (cart.walletAmount>0){
        //       cart.walletAmount = wallet.wallet
        //       console.log(cart,"----------------------------------------CART WALLET AMMOUNT UPDATED BY RETURNED--------------------------------------");
        //     }
        //   }

        //   await cartItem.save()
        // }
        console.log("updated wallet amount 🎉🎉🎉🎉🎉", wallet.wallet);
     
        await wallet.save();
        product.amountReturn =  wallet.wallet
        console.log( product.amountReturn,"returned amount🙌");
      }


      else if (deliveryStatus === 'cancelled' && (order.paymentMethod === 'Razorpay' || order.paymentMethod === 'Wallet')) {
        console.log(order.paymentMethod, "---------------------------------------------------->");
        console.log(deliveryStatus, "---------------------------------------------------->");
        product.orderstatus = deliveryStatus;
        const productAmount = product.quantity * product.price;
        console.log(product.quantity ,"*" ,product.price);
        console.log(productAmount,"minus this from total amount");
        product.quantity = 0;
        product.price = 0;

        
        let delivery = 0
        console.log(order.totalAmount, "total updated from adminside");
        console.log(productAmount,"minus this from total amount");
        if (!order.deliverySubtracted && order.totalAmount <= 100) {
          order.totalAmount -= 3;
          order.deliverySubtracted = true;
          delivery = 3
          console.log("enter delivery substract");
        }
        order.totalAmount -= productAmount;
        console.log(order.totalAmount, "subtract (delivery + product cost)");
        let wallet = await Wallet.findOne({ userId: order.userId });

        if (!wallet) {

          wallet = new Wallet({
            userId: order.userId,
            wallet: 0
          });
        }
        console.log(wallet,"wallet before update");
        console.log(productAmount,"+",delivery, "amount to add with wallet");
        wallet.wallet += (productAmount + delivery);
        // let cartItem = await Cart.findOne({ userId: order.userId });
        // if(cartItem){
        //   for(const cart of cartItem){
        //     if (cart.walletAmount>0){
        //     cart.walletAmount = wallet.wallet
        //     console.log(cart,"----------------------------------------CART WALLET AMMOUNT UPDATED BY CANCELLED--------------------------------------");
        //   }
        // }
        //   await cartItem.save()
        // }
        console.log("updated wallet amount 🎉🎉🎉🎉🎉", wallet.wallet);
   
        await wallet.save();
        product.amountReturn =  wallet.wallet
        console.log( product.amountReturn,"returned amount🙌");
      }
    }

    await order.save();

    res.redirect('/admin/admin-panel/order');
  } catch (err) {
    console.log(err);
    res.render('error');
  }
};
