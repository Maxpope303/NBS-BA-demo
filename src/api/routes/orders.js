const express = require('express');
const router = express.Router();
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const { authenticate } = require('../middleware/auth');

// POST /api/orders - Create new order
router.post('/', authenticate, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Order must contain at least one item'
        }
      });
    }
    
    if (!shippingAddress) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Shipping address is required'
        }
      });
    }
    
    // Validate products and calculate total
    let total = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: `Product ${item.productId} not found`
          }
        });
      }
      
      if (product.quantity < item.quantity) {
        return res.status(409).json({
          error: {
            code: 'OUT_OF_STOCK',
            message: `Product ${product.name} is out of stock`
          }
        });
      }
      
      // Update product inventory
      product.quantity -= item.quantity;
      await product.save();
      
      orderItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price
      });
      
      total += product.price * item.quantity;
    }
    
    // Create order
    const order = await Order.create({
      userId: req.user.userId,
      items: orderItems,
      total,
      shippingAddress,
      paymentMethod
    });
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create order'
      }
    });
  }
});

// GET /api/orders - Get user's order history
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const maxLimit = Math.min(parseInt(limit), 100);
    const skip = (parseInt(page) - 1) * maxLimit;
    
    const [orders, total] = await Promise.all([
      Order.find({ userId: req.user.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(maxLimit)
        .select('_id total status createdAt'),
      Order.countDocuments({ userId: req.user.userId })
    ]);
    
    res.json({
      data: orders,
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
        message: 'Failed to fetch orders'
      }
    });
  }
});

// GET /api/orders/:id - Get order details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found'
        }
      });
    }
    
    // Check if user owns this order
    if (order.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Cannot view other user\'s orders'
        }
      });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch order'
      }
    });
  }
});

// PATCH /api/orders/:id/cancel - Cancel order
router.patch('/:id/cancel', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found'
        }
      });
    }
    
    // Check if user owns this order
    if (order.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Cannot cancel other user\'s orders'
        }
      });
    }
    
    // Check if order can be cancelled
    if (!order.canBeCancelled()) {
      return res.status(409).json({
        error: {
          code: 'CANNOT_CANCEL',
          message: 'Order cannot be cancelled (already shipped or delivered)'
        }
      });
    }
    
    // Restore inventory
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.quantity += item.quantity;
        await product.save();
      }
    }
    
    // Update order status
    order.status = 'cancelled';
    order.cancelledAt = Date.now();
    await order.save();
    
    res.json({
      id: order._id,
      status: order.status,
      cancelledAt: order.cancelledAt
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to cancel order'
      }
    });
  }
});

// DISCREPANCY: Extra endpoint not in documentation
// Webhook for order status updates (undocumented feature)
router.post('/webhook/status', async (req, res) => {
  try {
    const { orderId, status, timestamp } = req.body;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found'
        }
      });
    }
    
    // Update order status
    order.status = status;
    await order.save();
    
    res.status(200).json({ received: true });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to process webhook'
      }
    });
  }
});

module.exports = router;

// Made with Bob
