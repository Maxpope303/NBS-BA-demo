const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other']
  },
  inStock: {
    type: Boolean,
    default: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  imageUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Text search index
ProductSchema.index({ name: 'text', description: 'text' });

// Query optimization indexes
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ inStock: 1, category: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ price: 1 });

// Update the updatedAt timestamp before saving
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Automatically set inStock based on quantity
  this.inStock = this.quantity > 0;
  
  next();
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;

// Made with Bob
