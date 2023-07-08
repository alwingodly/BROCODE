const Order = require('../models/orderSchema');
const Wallet = require('../models/walletSchema');
const Category  = require('../models/categorySchema')

exports.salesReport = async(req, res)=>{
    try{
      const orders = await Order.aggregate([
        { $unwind: '$products' },
        {
          $match: {
            'products.deliverystatus': 'delivered',
            'products.orderstatus': { $ne: 'returned' }
          }
        },
        {
          $project: { 
            _id: 1,
            createdAt: 1,
            deliveryDetails: 1,
            paymentMethod: 1,
            totalAmount: 1,
            products: '$products'
          }
        }
      ]).exec();
      const categories = await Category.find()
    res.render('admin/salesReport',{admin:true , orders,  categories})
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
}

exports.salesForm = async (req, res) => {
    try {

      res.render('admin/admin-panel/sales-report');
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  }
  
  exports.getSalesReport = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      console.log(req.query);
      
      const orders = await Order.aggregate([
        { $unwind: '$products' }, 
        {
          $match: {
            'products.deliverystatus': 'delivered',
            'products.DeliveredAt': {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            },
            'products.orderstatus': { $ne: 'returned' }
          }
        },
        {
          $project: {
            _id: 1,
            createdAt: 1,
            deliveryDetails: 1,
            paymentMethod: 1,
            totalAmount: 1,
            products: '$products'
          }
        }
      ]).exec();
      
      console.log(orders);
      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  };
  
  
  