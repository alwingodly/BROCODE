const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  deliveryDetails: {
    userName: { type: String, required: true },
    state: { type: String, required: true },
    house: { type: String, required: true },
    landmark: { type: String },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    number: { type: String, required: true },
    email: { type: String, required: true },
    type: { type: String, required: true },
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  paymentMethod: { type: String, required: true },
  products: [
    {
      name: {
        type: String,
        required: true,
      },
      prodId: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        required: true,
      },
      subcategory: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      size: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      orderstatus: {
        type: String,
      },
      deliverystatus: {
        type: String,
      },
      DeliveredAt: {
        type: Date,
        default: null,
      },
      offerPrice: {
        type: Number,
      },
      amountReturn: {
        type: Number,
        default: null
      },
      reason: {
        type: String,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  managetotal:{
    type: Number,
    
  },
  paymentstatus: {
    type: String,
    required: true,
  },
  deliverystatus: {
    type: String,
    required: true,
  },
  returnstatus: {
    type: String,
  },
  deliverySubtracted: {
    type: Boolean,
    default: false
  },
  discount: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;