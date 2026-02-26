const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const { authenticate, requireAdmin } = require('../middleware/auth');

// DISCREPANCY: Documented as GET /api/products but implemented as POST /api/products/search
// This is an API specification mismatch
router.post('/search', async (req, res) => {
  try {
    const { 
      query, 
      category, 
      filters,  // DISCREPANCY: Extra parameter not in specification
      page = 1, 
      limit = 20,
      sort = 'createdAt',
      order = 'desc'
    } = req.body;  // DISCREPANCY: Using body instead of query params
    
    const maxLimit = Math.min(parseInt(limit), 100);
    const skip = (parseInt(page) - 1) * maxLimit;
    
    // Build query
    let searchQuery = {};
    
    if (query) {
      searchQuery.$text = { $search: query };
    }
    
    if (category) {
      searchQuery.category = category;
    }
    
    if (filters) {
      // Apply additional filters
      if (filters.minPrice) searchQuery.price = { ...searchQuery.price, $gte: filters.minPrice };
      if (filters.maxPrice) searchQuery.price = { ...searchQuery.price, $lte: filters.maxPrice };
      if (filters.inStock !== undefined) searchQuery.inStock = filters.inStock;
    }
    
    // Build sort
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sort]: sortOrder };
    
    // Execute query
    const [products, total] = await Promise.all([
      Product.find(searchQuery)
        .sort(sortObj)
        .skip(skip)
        .limit(maxLimit),
      Product.countDocuments(searchQuery)
    ]);
    
    res.json({
      data: products,
      pagination: {
        page: parseInt(page),
        limit: maxLimit,
        total,
        pages: Math.ceil(total / maxLimit)
      }
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to search products'
      }
    });
  }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch product'
      }
    });
  }
});

// POST /api/products - Create new product (Admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, category, quantity, imageUrl } = req.body;
    
    if (!name || !price || !category) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Name, price, and category are required'
        }
      });
    }
    
    const product = await Product.create({
      name,
      description,
      price,
      category,
      quantity: quantity || 0,
      imageUrl
    });
    
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create product'
      }
    });
  }
});

// DISCREPANCY: Missing PUT /api/products/:id endpoint (documented but not implemented)

// DISCREPANCY: Extra endpoint not in documentation
// This is an undocumented feature
router.get('/recommendations/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }
    
    // Find similar products in same category
    const recommendations = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      inStock: true
    })
    .limit(5)
    .sort({ createdAt: -1 });
    
    res.json({
      product: product.name,
      recommendations
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch recommendations'
      }
    });
  }
});

module.exports = router;

// Made with Bob
