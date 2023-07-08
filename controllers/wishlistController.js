const Product = require('../models/ProductSchema');
const Wishlist = require('../models/wishlistSchema');

exports.wishload = async (req, res) => {
    try {
      const productId = req.query.productId;
      const product = await Product.findById(productId).populate('category').populate('subcategory');
      const loggedInUserId = req.session.user; 
      console.log(loggedInUserId);
      if(product.offer === true || product.catoffer === true){
        if(product.offerPercentage > product.catofferPercentage){
          price = product.offerPrice
        }else{
          price = product.catofferPrice
        }
        
      }
      else{
        price = product.price
      }
      let wishlistItem = await Wishlist.findOne({ userId: loggedInUserId });
      
      if (wishlistItem) {
        
        wishlistItem.products.push({
          prodId:productId,
          productName: product.productName,
          category: product.category.category,
          subcategory: product.subcategory.subCategory,
          flavour: product.flavour,
          stock: product.stock,
          size: product.size,
          price: price,
          image: product.image
       
        });
        console.log("wishlist updated");
      } else {
       
        const newWishlistItem = new Wishlist({
          userId: loggedInUserId,
          products: [{
            prodId:productId,
            productName: product.productName,
            category: product.category.category,
            subcategory: product.subcategory.subCategory,
            flavour: product.flavour,
            stock: product.stock,
            size: product.size,
            price: price,
            image: product.image
    
          }]
        });
        console.log("new user in wishlist");
        wishlistItem = await newWishlistItem.save();
      }
  
     
      await wishlistItem.save();
  
      res.json({ success: true });
      
    } catch (err) {
      console.log(err);
      res.render('error');
    }
  };
  
  exports.wishlist = async (req, res) => {
    try {
      const loggedInUserId = req.session.user; 
      console.log("One moree")
   
      const wishlistItems = await Wishlist.find({ userId: loggedInUserId });
      console.log(wishlistItems.length, "Wishlist Items");
      res.render('user/wishlist', { wishlistItems, user: loggedInUserId , use:true});
    } catch (err) {
      console.log(err);
      res.render('error');
    }
  };

  exports.removeWishlist = async (req, res) => {
    try {
      const productId = req.query.productId;
      const loggedInUserId = req.session.user;
     
   
      const wishlistItem = await Wishlist.findOne({ userId: loggedInUserId });
  
      if (wishlistItem) {
       
        const wishlistIndex = wishlistItem.products.findIndex((product) => product._id.toString() === productId);
  
        if (wishlistIndex !== -1) {
         
          wishlistItem.products.splice(wishlistIndex, 1);
  
          
          await wishlistItem.save();
  
        
          res.redirect('/wishlist')
        } else {
          
          res.status(404).json({ message: 'Product not found in wishlist' });
        }
      } else {
        
        res.status(404).json({ message: 'Wishlist not found for the user' });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  