const Product = require('../models/ProductSchema');
const Cart = require('../models/cartSchema');
const Wallet = require('../models/walletSchema');




exports.cartload = async (req, res) => {
  try {
    const productId = req.query.productId;
    console.log(productId,"load this productId to cart");

    const product = await Product.findById(productId).populate('category').populate('subcategory');
    console.log(product,"getting the product details from product collection using productId");
  
    
    const loggedInUserId = req.session.user;
    const quantity = req.query.quantity;
    let price = 0
    console.log(quantity, "quantity");
    console.log(product.offer, typeof product.offer);
    console.log(product.catoffer, typeof product.catoffer);
   
    
    // const wallet = await Wallet.findOne({ userId: loggedInUserId });
    // let wallets
    // if(wallet){
    //  wallets = wallet.wallet
    // }
    // else{
    //   wallets = 0
    // }
    if (product.offer === true || product.catoffer === true) {
      if (product.offerPercentage > product.catofferPercentage) {
        price = product.offerPrice;
        offerEnd = product.offerEnd;
      } else {
        price = product.catofferPrice;
        offerEnd = product.catofferEnd;
      }
      cartOffer = true;
    } else {
      price = product.price;
      offerEnd = null
      cartOffer = false;
    }
    
    let cartItem = await Cart.findOne({ userId: loggedInUserId });

    if (cartItem) {
     console.log("cart item found");
      const existingProductIndex = cartItem.products.findIndex((item) => item.prodId === productId);
     
      if (existingProductIndex !== -1) {
        console.log("repeated product");
        
        cartItem.products[existingProductIndex].count += 1;
      } else {
        
        cartItem.products.push({
          prodId: productId,
          productName: product.productName,
          category: product.category.category,
          subcategory: product.subcategory.subCategory,
          flavour: product.flavour,
          stock: product.stock,
          size: product.size,
          price: product.price,
          image: product.image,
          count: quantity ,
          offerPrice:price,
          offerEnd:offerEnd,
          cartOffer: cartOffer
        });
        console.log(cartItem,"🤞🤞🤞");
      }
    } else {
      
      console.log("old user");
      const newCartItem = new Cart({
        userId: loggedInUserId,
        products: [{
          prodId: productId,
          productName: product.productName,
          category: product.category.category,
          subcategory: product.subcategory.subCategory,
          flavour: product.flavour,
          stock: product.stock,
          size: product.size,
          price: product.price,
          image: product.image,
          count: quantity ,
          offerPrice: price,
          offerEnd:offerEnd,
          cartOffer: cartOffer
          
        }],
       


      });

      cartItem = await newCartItem.save();
      console.log(cartItem,"🤞🤞🤞");
    }

   console.log("come here");
    await cartItem.save();
    console.log(cartItem,"items in cart");
   
    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.json({ success: false, error: 'Error adding product to cart' });
  }
};

  exports.cart = async (req, res) => {
    try {
      const loggedInUserId = req.session.user;
      const cart = await Cart.find({ userId: loggedInUserId });
      
      const currentDate = new Date();
   
      for (const cartItem of cart) {
        
        for (const product of cartItem.products) {
          console.log(product, "😢");
          if (product.cartOffer === true && currentDate > product.offerEnd) {
            product.cartOffer = false;
            product.offerEnd = null;
            product.offerPrice = 0;
            await cartItem.save(); 
          }
          const fetchedProduct = await Product.findById(product.prodId);
          console.log(fetchedProduct.stock,"got the current updated stock");
          product.stock = fetchedProduct.stock
          await cartItem.save();
        }
        cartItem.products = cartItem.products.filter((product) => product.stock !== 0);
      } 
      const cartItems = cart.filter((cartItem) => cartItem.products.length > 0);      
      console.log(cartItems,"these are the items in the cart")
      res.render('user/cart', { cartItems, user: loggedInUserId , use:true});
    } catch (err) {
      console.log(err);
      res.render('error');
    }
  };
  
  exports.removeCart =  async (req, res) => {
    try {
      const productId = req.query.productId;
      const loggedInUserId = req.session.user; 
  
     
      const cartItem = await Cart.findOne({ userId: loggedInUserId });
  
      if (cartItem) {
       
        const productIndex = cartItem.products.findIndex((product) => product._id.toString() === productId);
  
        if (productIndex !== -1) {
          
          cartItem.products.splice(productIndex, 1);
  
          await cartItem.save();
        }
      }
  
      res.redirect('/cart');
    } catch (err) {
      console.log(err);
      res.render('error');
    }
  }
    
  exports.postUpdateQuantity = async (req, res) => {
    try {
      const { productId, quantity } = req.body;
      console.log(req.body,"🎶");
      const updatedProduct = await Cart.findOneAndUpdate(
        { 'products._id': productId },
        { $set: { 'products.$.count': quantity} },
        { new: true }
      );
      res.json({ success: true, message: 'Quantity  updated successfully' });
    } catch (error) {
      console.error('Error updating quantity and price:', error);
      res.status(500).json({ success: false, message: 'Failed to update quantity and price' });
    }
  }