const Product = require('../models/ProductSchema');
const Category = require('../models/categorySchema');
exports.getOffer = async(req, res) =>{
    try{
        const categories = await Category.find()
        const product = await Product.find().populate('category').populate('subcategory')
        
    res.render('admin/offer',{admin:true , product, categories})
    }
    catch(err){
        console.log(err);
        res.render('error');
    }
}
 
exports.productOffer = async (req, res) => {
  try {
    const percentage = req.body.productpercentage;
    const startDate = new Date(req.body.productstartdate);
    const endDate = new Date(req.body.productstopdate);
    const productId = req.body.product;

    console.log(req.body, "get product offer details here");

    const product = await Product.findById(productId);

    if (!product) {
      return res.render('error');
    }

    const currentDate = new Date();

    if (currentDate < startDate || currentDate > endDate) {
      return res.render('error');
    }

    product.offerStart = startDate;
    product.offerEnd = endDate;
    product.offer = true;
    const offerPrice = product.price - (product.price * percentage) / 100;
    product.offerPercentage = percentage;
    product.offerPrice = offerPrice;

    const removeOffer = () => {
      product.offer = false;
      product.offerPercentage = 0;
      product.offerStart = null;
      product.offerEnd = null;
      product.offerPrice = 0;
      product.save();
    };

    if (currentDate > endDate) {
      removeOffer();
    } else {
      setTimeout(removeOffer, endDate - currentDate);
    }

    await product.save();

    res.redirect('/admin/admin-panel/offer');
  } catch (err) {
    console.log(err);
    res.render('error');
  }
};


  exports.getRemoveOffer = async(req,res) => {
    try{
        const productId = req.query.productId
        console.log(productId);
        const product = await Product.findById(productId)
        console.log(product,"😃");
        product.offer = false;
        product.offerPercentage = 0;
        product.offerStart = null;
        product.offerEnd = null;
        product.offerPrice = 0;
        await product.save();
         res.redirect('/admin/admin-panel/offer');
    }
    catch(err){
        console.log(err);
        res.render('error');  
    }
  }


  exports.categoryOffer = async (req, res) => {
    try {
      const percentage = req.body.categorypercentage;
      const startDate = req.body.categorystartdate;
      const stopDate = req.body.categorystopdate;
      const categoryId = req.body.category;
  
      console.log(req.body, "get category offer details here");
  
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.render('error');
      }
      category.offer = true;
      category.catofferStart = startDate;
      category.catofferEnd = stopDate;
      
      category.catofferPercentage = percentage;

  console.log(category,"note😃😃😃😃");
      const products = await Product.find({ category: categoryId });
      console.log(products, "👀👀👀");
      const currentDate = new Date();
      if (currentDate < new Date(startDate) || currentDate > new Date(stopDate)) {
        return res.render('error');
      }
  
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        product.catoffer = true;
        const offerprice = (product.price * percentage) / 100;
        const offerPrice = product.price - offerprice;
        product.catofferPercentage = percentage;
        product.catofferPrice = offerPrice;
        product.catofferStart = startDate;
        product.catofferEnd = stopDate;
        await product.save();
        if (currentDate > new Date(stopDate)) {
          setTimeout(async () => {
            product.catoffer = false;
            product.catofferPrice = 0;
            product.catofferStart = null;
            product.catofferEnd = null;
            await product.save();
          }, new Date(stopDate) - currentDate);
        }
      }
  
      if (currentDate > new Date(stopDate)) {
        setTimeout(async () => {
          category.offer = false;
          category.catofferPercentage = 0;
          category.catofferStart = null;
          category.catofferEnd = null;
          await category.save();
        }, new Date(stopDate) - currentDate);
      }
  
      await category.save();
      res.redirect('/admin/admin-panel/offer');
    } catch (err) {
      console.log(err);
      res.render('error');
    }
  };
  


  exports.getCatRemoveOffer = async(req,res) => {
    try{
        const categoryId = req.query.categoryId
        console.log(categoryId);
        const category = await Category.findById(categoryId);
        category.offer = false
        category.catofferPercentage = 0;
        category.catofferStart = null;
        category.catofferEnd = null;
    
        await category.save();
        const products = await Product.find({ category: categoryId });

        for (const product of products) 
        {
        product.catoffer = false;
        product.catofferPrice = 0;
        }
        await Promise.all(products.map(product => product.save()));
         res.redirect('/admin/admin-panel/offer');
    }
    catch(err){
        console.log(err);
        res.render('error');  
    }
  }