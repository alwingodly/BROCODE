const Address = require('../models/addressSchema');
const Cart = require('../models/cartSchema');
const Wallet = require('../models/walletSchema');
exports.address = async (req, res) => {
  try {
    console.log(req.query,"total price👀🐱");
    total = req.query.totalPrice
    const loggedInUserId = req.session.user;
    const cartItems = await Cart.find({ userId: loggedInUserId });
    // const wallet = await Wallet.findOne({ userId: loggedInUserId });
    

    for (const cartItem of cartItems) {
      cartItem.totalprice = total;
      cartItem.manageTotal = total
      cartItem.discountCode = null
      cartItem.couponDiscount = 0
      cartItem.walletAmount = false
      // console.log(cartItem.walletAmount);
      // if(wallet){
      // wallet.wallet = cartItem.walletAmount
      // await wallet.save()
      // }
      await cartItem.save();
    }
    
    // console.log(wallet,"wallet management");
    // const productId = req.query.productId
    // console.log(productId,"prod in adress");
    // Retrieve the addresses for the logged-in user
    const addresses = await Address.find({ userId: loggedInUserId }).sort({ default: -1 });
    // const product = await Product.findById(productId).populate('category').populate('subcategory'); 
    // console.log("addresses of user", addresses)
   
    res.render('user/address', { user: loggedInUserId, addresses,  use: true  }); 
    
  } catch (err) {
    console.log(err);
    res.render('error');
  }
};


let error = null
exports.addressPage = async (req, res) => {
    try {
      const loggedInUserId = req.session.user;
      account = req.query.account
      console.log(account,"account from");
      res.render('user/addAddress', { user: loggedInUserId, use: true ,error ,account});
    } catch (err) {
      console.log(err);
      res.render('error');
    }
  };
  
  exports.addressEditPage = async (req, res) => {
    try {
      const addressId = req.query.addressId;
      account = req.query.account
      console.log(account,"edit account from");
      console.log(addressId, "address id");
      const loggedInUserId = req.session.user;
      console.log(loggedInUserId);
      const userAddresses = await Address.find({ userId: loggedInUserId });
      console.log(userAddresses, "all addresses");
      if (!userAddresses) {
        // Addresses not found, handle the error or redirect to an error page
        throw new Error("User has no addresses");
      }
  
      let addressToEdit;
      for (const address of userAddresses) {
        addressToEdit = address.addresses.find((a) => a._id.toString() === addressId);
        if (addressToEdit) {
          break;
        }
      }
  
      console.log(addressToEdit, "edit this address");
      if (!addressToEdit) {
        // Address not found, handle the error or redirect to an error page
        throw new Error("Address not found");
      }
      console.log(addressToEdit.userName,"username");
      res.render("user/editAddress", { user: loggedInUserId, address: addressToEdit, error: null ,account});
    } catch (err) {
      console.log(err);
      res.render("error");
    }
  };
  
  
   





  exports.addAddress = async (req, res) => {
    try {
      const Account = req.query.account;
      console.log(Account, "address from?????");
      const loggedInUserId = req.session.user;
      if (!loggedInUserId) {
        error = "user is not logged";
        res.redirect('/addressPage');
      }
  
      // Check if the "setDefault" checkbox is selected
      const setDefault = req.body.setDefault === 'on';
      console.log(req.body);
  
      // Find the user's addresses
      const userAddresses = await Address.findOne({ userId: loggedInUserId });
  
      if (userAddresses) {
        // If the user has existing addresses
        const addresses = userAddresses.addresses;
        console.log("address", addresses);
  
        if (setDefault) {
          // Update the existing default address, if any, to false
          const existingDefaultAddress = addresses.find((address) => address.default === true);
          if (existingDefaultAddress) {
            existingDefaultAddress.default = false;
          }
        }
  
        // Create a new address object
        const newAddress = {
          userName: req.body.userName,
          state: req.body.state,
          house: req.body.address,
          landmark: req.body.landmark,
          city: req.body.city,
          zip: req.body.zip,
          number: req.body.number,
          email: req.body.email,
          type: req.body.type,
          default: setDefault,
        };
  
        // Add the new address to the array
        addresses.push(newAddress);
  
        // Save the userAddresses document
        await userAddresses.save();
  
        // Redirect to the appropriate route
        if (Account == 0) {
          res.redirect('/accountAddress');
        } else {
          // Pass the address ID as a query parameter
          res.redirect('/order?addressId=' + addresses[addresses.length - 1]._id);
        }
      } else {
        // If the user doesn't have any addresses, create a new document
        console.log("new user");
  
        const newAddress = new Address({
          userId: loggedInUserId,
          addresses: [
            {
              userName: req.body.userName,
              state: req.body.state,
              house: req.body.address,
              landmark: req.body.landmark,
              city: req.body.city,
              zip: req.body.zip,
              number: req.body.number,
              email: req.body.email,
              type: req.body.type,
              default: setDefault,
            },
          ],
        });
  
        // Save the newAddress document
        const savedAddress = await newAddress.save();
  
        // Redirect to the appropriate route
        if (Account == 0) {
          res.redirect('/accountAddress');
        } else {
          // Pass the address ID as a query parameter
          res.redirect('/order?addressId=' + savedAddress.addresses[0]._id);
        }
      }
    } catch (err) {
      console.log(err);
      res.json({ success: false, error: 'Error adding address' });
    }
  };
  


  exports.editAddress = async (req, res) => {
    try {
      const Account = req.query.account;
      console.log(Account, "edit address from?????");
      const addressId = req.query.addressId;
      const loggedInUserId = req.session.user;
      if (!loggedInUserId) {
        error = "User is not logged in";
        res.redirect('/addressPage');
      }
      const userAddresses = await Address.findOne({ userId: loggedInUserId });
      const editAddress = userAddresses.addresses.find(a => a._id.toString() === addressId);
      
      if (!editAddress) {
        // Address not found, handle the error or redirect to an error page
        throw new Error("Address not found");
      }
      
      // Check if the edited address should be set as the default address
      const setDefault = req.body.setDefault === 'on';
      
      // Update the default property for the edited address
      editAddress.default = setDefault;
      
      // If the edited address is set as default, update the previous default address
      if (setDefault) {
        const previousDefault = userAddresses.addresses.find(a => a.default);
        if (previousDefault && previousDefault._id.toString() !== addressId) {
          previousDefault.default = false;
        }
      }
      
      editAddress.userName = req.body.userName;
      editAddress.state = req.body.state;
      editAddress.house = req.body.address;
      editAddress.landmark = req.body.landmark;
      editAddress.city = req.body.city;
      editAddress.zip = req.body.zip;
      editAddress.number = req.body.number;
      editAddress.email = req.body.email;
      editAddress.type = req.body.type;
  
      console.log("Edited address:", editAddress);
      await userAddresses.save();
  
      if (Account == 0) {
        res.redirect('/accountAddress');
      } else {
        // Pass the address ID as a query parameter
        res.redirect('/address');
      }
    } catch (err) {
      console.log(err);
      res.render('error');
    }
  };
  

exports.deleteAddress = async (req, res) => {
  try {
    const addressId = req.query.addressId;
    console.log("address id want to delete"+ this.address);
    const loggedInUserId = req.session.user;
    if (!loggedInUserId) {
      error = "User is not logged in";
      res.redirect('/addressPage');
    }
    // get the array of address of the user
    const userAddresses = await Address.findOne({ userId: loggedInUserId });
    if (!userAddresses) {
      // User addresses not found, handle the error or redirect to an error page
      throw new Error("User addresses not found");
    }
    // Find the index of the address to be deleted
    const addressIndex = userAddresses.addresses.findIndex(address => address._id.toString() === addressId);

    if (addressIndex === -1) {
      // Address not found, handle the error or redirect to an error page
      throw new Error("Address not found");
    }

    // Remove the address from the addresses array
    userAddresses.addresses.splice(addressIndex, 1);

    // Save the updated userAddresses object
    await userAddresses.save();

    res.redirect('/accountAddress');
  } catch (err) {
    console.log(err);
    res.render('error');
  }
};


exports.setDefaultAddress = async (req, res) => {
  try {
    const addressId = req.query.addressId;
    console.log(addressId);
    const loggedInUserId = req.session.user;
    if (!loggedInUserId) {
      error = "User is not logged in";
      res.redirect('/addressPage');
    }
  
    const userAddresses = await Address.findOne({ userId: loggedInUserId });
    console.log(userAddresses,"userrrrrrrrr");
    
    const addressToSetAsDefault = userAddresses.addresses.find(address => address._id.toString() === addressId);
    console.log(addressToSetAsDefault,"uuuuuuuuuuuuuuuuuuuu");
    if (!addressToSetAsDefault) {
  
      throw new Error("Address not found");
    }
    
    addressToSetAsDefault.default = true;
    
  
    userAddresses.addresses.forEach(address => {
      if (address._id.toString() !== addressId) {
        address.default = false;
      }
      console.log("set false");
    });
    

    await userAddresses.save();

    res.redirect('/accountAddress');
  } catch (err) {
    console.log(err);
    res.render('error');
  }
};

