# Developer Guide

**Generated**: 2026-02-26T16:08:24Z  
**Source**: Automated analysis of codebase  
**Target Audience**: Developers, Technical Leads  
**Version**: 1.0.0

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Setup](#project-setup)
3. [Development Workflow](#development-workflow)
4. [Common Use Cases](#common-use-cases)
5. [Code Examples](#code-examples)
6. [Best Practices](#best-practices)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## Getting Started

This guide provides practical examples and patterns for working with the e-commerce platform codebase.

### Prerequisites

- Node.js >= 18.0.0
- MongoDB instance (local or cloud)
- npm or yarn package manager
- Basic knowledge of Express.js and Mongoose

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd nationwide-demo

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

## Project Setup

### Environment Configuration

Create a `.env` file in the project root:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/nationwide-demo

# Authentication
JWT_SECRET=your-secret-key-change-in-production

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Database Setup

#### Local MongoDB

```bash
# Start MongoDB
mongod --dbpath /path/to/data

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### MongoDB Atlas (Cloud)

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Installing Dependencies

```bash
# Production dependencies
npm install

# Development dependencies (already included)
npm install --save-dev nodemon jest
```

## Development Workflow

### Running the Application

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Run tests
npm test
```

### Project Structure

```
src/
├── api/
│   ├── middleware/
│   │   └── auth.js          # Authentication middleware
│   └── routes/
│       ├── users.js         # User endpoints
│       ├── products.js      # Product endpoints
│       └── orders.js        # Order endpoints
└── models/
    ├── User.js              # User model
    ├── Product.js           # Product model
    └── Order.js             # Order model
```

### Adding New Features

#### 1. Create Model (if needed)

```javascript
// src/models/Category.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Category', CategorySchema);
```

#### 2. Create Routes

```javascript
// src/api/routes/categories.js
const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;
```

#### 3. Register Routes

```javascript
// src/server.js
const categoryRoutes = require('./api/routes/categories');
app.use('/api/categories', categoryRoutes);
```

## Common Use Cases

### User Authentication Flow

#### 1. User Registration

```javascript
// Client-side request
const response = await fetch('http://localhost:3000/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    username: 'johndoe',
    password: 'SecurePass123!',
    firstName: 'John',
    lastName: 'Doe'
  })
});

const user = await response.json();
console.log('User created:', user);
```

#### 2. User Login

```javascript
// Login request
const response = await fetch('http://localhost:3000/api/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!'
  })
});

const { token, user } = await response.json();

// Store token for subsequent requests
localStorage.setItem('authToken', token);
```

#### 3. Authenticated Requests

```javascript
// Making authenticated requests
const token = localStorage.getItem('authToken');

const response = await fetch('http://localhost:3000/api/orders', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const orders = await response.json();
```

### Product Management

#### Search Products

```javascript
// Search with filters
const response = await fetch('http://localhost:3000/api/products/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: 'laptop',
    category: 'Electronics',
    filters: {
      minPrice: 500,
      maxPrice: 2000,
      inStock: true
    },
    page: 1,
    limit: 20,
    sort: 'price',
    order: 'asc'
  })
});

const { data: products, pagination } = await response.json();
```

#### Create Product (Admin)

```javascript
// Admin creates product
const response = await fetch('http://localhost:3000/api/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Gaming Laptop',
    description: 'High-performance gaming laptop',
    price: 1299.99,
    category: 'Electronics',
    quantity: 15,
    imageUrl: 'https://example.com/laptop.jpg'
  })
});

const product = await response.json();
```

### Order Processing

#### Create Order

```javascript
// Create order with multiple items
const response = await fetch('http://localhost:3000/api/orders', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    items: [
      {
        productId: '507f1f77bcf86cd799439012',
        quantity: 2
      },
      {
        productId: '507f1f77bcf86cd799439013',
        quantity: 1
      }
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    paymentMethod: 'credit_card'
  })
});

const order = await response.json();
```

#### Cancel Order

```javascript
// Cancel order
const response = await fetch(`http://localhost:3000/api/orders/${orderId}/cancel`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const result = await response.json();
console.log('Order cancelled:', result);
```

## Code Examples

### Backend Examples

#### Custom Middleware

```javascript
// src/api/middleware/logger.js
const logger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

module.exports = logger;
```

#### Error Handling Middleware

```javascript
// src/api/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'SERVER_ERROR',
      message: err.message || 'Internal server error'
    }
  });
};

module.exports = errorHandler;
```

#### Model with Virtual Properties

```javascript
// Add virtual property to User model
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Enable virtuals in JSON
UserSchema.set('toJSON', { virtuals: true });

// Usage
const user = await User.findById(userId);
console.log(user.fullName); // "John Doe"
```

#### Complex Query Example

```javascript
// Find products with advanced filtering
const products = await Product.find({
  category: 'Electronics',
  price: { $gte: 500, $lte: 2000 },
  inStock: true
})
.sort({ price: 1 })
.limit(20)
.select('name price category imageUrl')
.lean(); // Returns plain JavaScript objects
```

#### Aggregation Pipeline

```javascript
// Get order statistics by user
const stats = await Order.aggregate([
  {
    $match: { userId: mongoose.Types.ObjectId(userId) }
  },
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      totalAmount: { $sum: '$total' }
    }
  },
  {
    $sort: { count: -1 }
  }
]);
```

#### Transaction Example

```javascript
// Create order with transaction
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Create order
  const order = await Order.create([{
    userId,
    items,
    total,
    shippingAddress
  }], { session });
  
  // Update product quantities
  for (const item of items) {
    await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { quantity: -item.quantity } },
      { session }
    );
  }
  
  await session.commitTransaction();
  return order[0];
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### Frontend Integration Examples

#### React Hook for Authentication

```javascript
// useAuth.js
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  
  const login = async (email, password) => {
    const response = await fetch('http://localhost:3000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('authToken', data.token);
  };
  
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };
  
  return { user, token, login, logout };
};
```

#### React Component for Product List

```javascript
// ProductList.jsx
import React, { useState, useEffect } from 'react';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch('http://localhost:3000/api/products/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'Electronics',
          page: 1,
          limit: 20
        })
      });
      
      const { data } = await response.json();
      setProducts(data);
      setLoading(false);
    };
    
    fetchProducts();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="product-grid">
      {products.map(product => (
        <div key={product._id} className="product-card">
          <img src={product.imageUrl} alt={product.name} />
          <h3>{product.name}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
};
```

## Best Practices

### Security

#### 1. Password Handling

```javascript
// GOOD: Hash passwords before storing
const bcrypt = require('bcrypt');
const passwordHash = await bcrypt.hash(password, 10);

// BAD: Never store plaintext passwords
// user.password = password; // DON'T DO THIS
```

#### 2. JWT Token Management

```javascript
// GOOD: Use environment variable for secret
const token = jwt.sign(
  { userId: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// BAD: Hardcoded secret
// const token = jwt.sign(data, 'secret123'); // DON'T DO THIS
```

#### 3. Input Validation

```javascript
// GOOD: Validate and sanitize input
const { email, username, password } = req.body;

if (!email || !username || !password) {
  return res.status(400).json({
    error: { code: 'INVALID_INPUT', message: 'Missing required fields' }
  });
}

// Validate email format
if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
  return res.status(400).json({
    error: { code: 'INVALID_EMAIL', message: 'Invalid email format' }
  });
}
```

#### 4. Authorization Checks

```javascript
// GOOD: Verify user owns resource
if (order.userId.toString() !== req.user.userId) {
  return res.status(403).json({
    error: { code: 'FORBIDDEN', message: 'Access denied' }
  });
}
```

### Performance

#### 1. Use Lean Queries

```javascript
// GOOD: Use lean() for read-only operations
const products = await Product.find({ category: 'Electronics' })
  .lean()
  .exec();

// Returns plain JavaScript objects (faster)
```

#### 2. Select Only Needed Fields

```javascript
// GOOD: Select specific fields
const users = await User.find()
  .select('username email createdAt')
  .lean();

// BAD: Fetch all fields when not needed
// const users = await User.find();
```

#### 3. Use Pagination

```javascript
// GOOD: Implement pagination
const page = parseInt(req.query.page) || 1;
const limit = Math.min(parseInt(req.query.limit) || 20, 100);
const skip = (page - 1) * limit;

const products = await Product.find()
  .skip(skip)
  .limit(limit);
```

#### 4. Index Frequently Queried Fields

```javascript
// Add indexes for common queries
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
ProductSchema.index({ category: 1, price: 1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
```

### Error Handling

#### 1. Consistent Error Format

```javascript
// GOOD: Consistent error structure
const sendError = (res, status, code, message) => {
  res.status(status).json({
    error: { code, message }
  });
};

// Usage
sendError(res, 404, 'USER_NOT_FOUND', 'User not found');
```

#### 2. Try-Catch Blocks

```javascript
// GOOD: Wrap async operations
router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Failed to create user' }
    });
  }
});
```

#### 3. Validation Before Database Operations

```javascript
// GOOD: Validate before DB operations
if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  return res.status(400).json({
    error: { code: 'INVALID_ID', message: 'Invalid ID format' }
  });
}

const user = await User.findById(req.params.id);
```

### Code Organization

#### 1. Separate Concerns

```javascript
// GOOD: Separate business logic from routes
// services/orderService.js
class OrderService {
  async createOrder(userId, items, shippingAddress) {
    // Business logic here
    const total = this.calculateTotal(items);
    return await Order.create({ userId, items, total, shippingAddress });
  }
  
  calculateTotal(items) {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
}

// routes/orders.js
const orderService = new OrderService();

router.post('/', authenticate, async (req, res) => {
  try {
    const order = await orderService.createOrder(
      req.user.userId,
      req.body.items,
      req.body.shippingAddress
    );
    res.status(201).json(order);
  } catch (error) {
    // Error handling
  }
});
```

#### 2. Use Constants

```javascript
// GOOD: Define constants
// constants/orderStatus.js
module.exports = {
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Usage
const { PENDING, CANCELLED } = require('./constants/orderStatus');
order.status = PENDING;
```

## Testing

### Unit Tests

```javascript
// tests/models/user.test.js
const User = require('../../src/models/User');
const bcrypt = require('bcrypt');

describe('User Model', () => {
  test('should hash password before saving', async () => {
    const user = new User({
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: await bcrypt.hash('password123', 10)
    });
    
    await user.save();
    expect(user.passwordHash).not.toBe('password123');
  });
  
  test('should compare passwords correctly', async () => {
    const password = 'password123';
    const user = new User({
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: await bcrypt.hash(password, 10)
    });
    
    const isValid = await user.comparePassword(password);
    expect(isValid).toBe(true);
  });
});
```

### Integration Tests

```javascript
// tests/api/users.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('User API', () => {
  test('POST /api/users should create user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.email).toBe('test@example.com');
  });
});
```

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

**Problem**: Cannot connect to MongoDB

**Solution**:
```bash
# Check MongoDB is running
mongod --version

# Verify connection string in .env
MONGODB_URI=mongodb://localhost:27017/nationwide-demo

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

#### 2. JWT Token Invalid

**Problem**: 401 Unauthorized errors

**Solution**:
```javascript
// Verify token format
Authorization: Bearer <token>

// Check JWT_SECRET matches
console.log('JWT_SECRET:', process.env.JWT_SECRET);

// Verify token hasn't expired
const decoded = jwt.decode(token);
console.log('Token expires:', new Date(decoded.exp * 1000));
```

#### 3. Validation Errors

**Problem**: 400 Bad Request with validation errors

**Solution**:
```javascript
// Check required fields
console.log('Request body:', req.body);

// Verify field types and constraints
// Example: username must be 3-30 characters
```

#### 4. CORS Errors

**Problem**: CORS policy blocking requests

**Solution**:
```javascript
// Configure CORS in server
const cors = require('cors');
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
```

### Debugging Tips

#### 1. Enable Debug Logging

```javascript
// Add to server.js
if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', true);
}
```

#### 2. Use MongoDB Compass

- Visual tool for MongoDB
- Inspect collections and documents
- Run queries and aggregations
- Download: [mongodb.com/products/compass](https://www.mongodb.com/products/compass)

#### 3. API Testing Tools

- **Postman**: Full-featured API testing
- **curl**: Command-line testing
- **Thunder Client**: VS Code extension

---

**Documentation Quality**: ✅ Complete  
**Last Updated**: 2026-02-26T16:08:24Z  
**Generated By**: Bob Documentation Generation Mode