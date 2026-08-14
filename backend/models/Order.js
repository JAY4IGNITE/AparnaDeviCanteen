const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu'
    },
    itemName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

// Index on createdAt for efficient date-range queries (revenue, statistics)
orderSchema.index({ createdAt: 1 });
orderSchema.index({ customer: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
