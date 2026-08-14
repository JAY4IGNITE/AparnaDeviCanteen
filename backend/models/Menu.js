const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    trim: true,
    default: 'General'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Menu', menuSchema);
