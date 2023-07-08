const User = require('../models/userSchema');

//----------------CUSTOMER PAGE----------------//

exports.getCustomer = async (req, res, next) => {
    try {
      const customers = await User.find();
      res.render("admin/coustomer", { admin: true, customers });
    } catch (error) {
      next(error);
    }
  }

//------------------BLOCK CUSTOMER--------------//

exports.postBlockCustomer = async (req, res, next) => {
    try {
      const customerId = req.params.customerId;
      await User.findByIdAndUpdate(customerId, { isBlocked: true });
      res.redirect("/admin/admin-panel/coustomer"); 
    } catch (error) {
      next(error);
    }
  }

//------------------UNBLOCK CUSTOMER--------------//

  exports.postUnblockCustomer = async (req, res, next) => {
    try {
      const customerId = req.params.customerId;
      await User.findByIdAndUpdate(customerId, { isBlocked: false });
      res.redirect("/admin/admin-panel/coustomer");
    } catch (error) {
      next(error);
    }
  }
  
//------------------DELETE CUSTOMER--------------//

  exports.postDeleteCustomer = async (req, res, next) => {
    try {
      const customerId = req.params.customerId;
      await User.findByIdAndRemove(customerId);
      res.redirect("/admin/admin-panel/coustomer");
    } catch (error) {
      next(error);
    }
  }