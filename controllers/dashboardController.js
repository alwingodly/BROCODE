const Order = require('../models/orderSchema');
const User = require('../models/userSchema')
const Category = require('../models/categorySchema');
const Product = require('../models/ProductSchema')

exports.dashboard = async (req, res) => {

    
  
    try {
      const orders = await Order.find();
      const codOrders = await Order.aggregate([
        { $match: { paymentMethod: 'COD' } },
        { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } }
      ]);
      
      const razorpayOrders = await Order.aggregate([
        { $match: { paymentMethod: 'Razorpay' } },
        { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } }
      ]);
        
      const walletOrders = await Order.aggregate([
        { $match: { paymentMethod: 'Wallet' } },
        { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } }
      ]);


      const categoryCounts = await Category.aggregate([
        {
          $lookup: {
            from: 'orders',
            localField: 'category',
            foreignField: 'products.category',
            as: 'orders'
          }
        },
        {
          $project: {
            category: 1,
            count: {
              $sum: {
                $map: {
                  input: '$orders',
                  as: 'order',
                  in: {
                    $sum: {
                      $map: {
                        input: '$$order.products',
                        as: 'product',
                        in: {
                          $cond: [
                            { $eq: ['$$product.category', '$category'] },
                            '$$product.quantity',
                            0
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ]);
      
      const productCounts = await Product.aggregate([
        {
          $lookup: {
            from: 'orders',
            localField: 'productName',
            foreignField: 'products.name',
            as: 'orders'
          }
        },
        {
          $project: {
            productName: 1,
            image:1,
            price:1,
            category:1,
            subcategory:1,

            count: {
              $sum: {
                $map: {
                  input: '$orders',
                  as: 'order',
                  in: {
                    $size: {
                      $filter: {
                        input: '$$order.products',
                        as: 'product',
                        cond: [
                            { $eq: ['$$product.deliverystatus', 'delivered'] },
                            '$$product.quantity',
                            0
                          ]
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          $sort:
          {
          count:-1
          }
      },
        {
          $limit:1
        }
      ]);
      console.log('Category Counts:', categoryCounts);
      console.log('product Counts:', productCounts);

      const categories = categoryCounts.map(category => category.category);
      const counts = categoryCounts.map(category => category.count);

      const products = await Product.find()
      .populate('category', 'category') 
      .populate('subcategory', 'subCategory'); 


      console.log(categories ,counts);

      const codTotalAmount = codOrders.length > 0 ? codOrders[0].totalAmount : 0;
      const razorpayTotalAmount = razorpayOrders.length > 0 ? razorpayOrders[0].totalAmount : 0;
      const walletTotalAmount = walletOrders.length > 0 ? walletOrders[0].totalAmount : 0;
  
      const totalRevenue = codTotalAmount + razorpayTotalAmount+walletTotalAmount;
      console.log(totalRevenue, 'Total revenue');
  
    
      const numberOfDays = Math.ceil((Date.now() - orders[0].createdAt) / (1000 * 60 * 60 * 24));
      console.log(numberOfDays, 'Number of days');
  
 
      const dailyRevenue = totalRevenue / numberOfDays;
      console.log(dailyRevenue, 'Daily revenue');
  
      const numberOfProducts = orders.reduce((count, order) => {
        const deliveredProducts = order.products.filter(product => product.orderstatus === 'delivered');
        return count + deliveredProducts.length;
      }, 0);

      const totalCustomers = await User.countDocuments();
      console.log(totalCustomers, 'Total Number Of Users');

      const monthlyRevenue = calculateMonthlyRevenue(orders);
      console.log(monthlyRevenue, 'Monthly revenue');
      
      res.render('admin/dashboard', {
        admin: true,
        totalRevenue,
        dailyRevenue,
        numberOfProducts,
        totalCustomers,
        codTotalAmount,
        razorpayTotalAmount,
        walletTotalAmount,
        order: orders,
        monthlyRevenue,
        categories,
        counts,
        productCounts,
        products
      });
    } catch (err) {
      console.error(err);
      res.render('error');
    }
  };
  
  function calculateMonthlyRevenue(orders) {
    const monthlyRevenue = new Array(12).fill(0);
  
    orders.forEach((order) => {
      const month = order.createdAt.getMonth();
      monthlyRevenue[month] += order.totalAmount;
    });
  
    return monthlyRevenue;
  }
  // Server-side code
// exports.getCategoryCounts = async (req, res) => {
//   console.log("am here");
//   try {
//     const categoryCounts = await Category.aggregate([
//       {
//         $lookup: {
//           from: 'orders',
//           localField: 'category',
//           foreignField: 'products.category',
//           as: 'orders'
//         }
//       },
//       {
//         $project: {
//           category: 1,
//           count: {
//             $sum: {
//               $map: {
//                 input: '$orders',
//                 as: 'order',
//                 in: {
//                   $size: {
//                     $filter: {
//                       input: '$$order.products',
//                       as: 'product',
//                       cond: { $eq: ['$$product.deliverystatus', 'delivered'] }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     ]);

//     res.json(categoryCounts);
//   } catch (error) {
//     console.error('Error fetching categoryCounts:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };
