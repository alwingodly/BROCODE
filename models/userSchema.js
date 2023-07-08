const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true 
  },
  email: {
     type: String, 
     required: true, 
     unique: true },
  number: { type: String, required: true },
  password: { type: String, required: true },
  gender: { type: String },
  createdAt: { type: Date, default: Date.now },
  isBlocked: { type: Boolean, default: false } // Added block status field
});

const User = mongoose.model('User', userSchema);

module.exports = User;

