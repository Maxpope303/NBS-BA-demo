const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { authenticate } = require('../middleware/auth');

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  try {
    const { email, username, password, firstName, lastName } = req.body;
    
    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Username and password are required'
        }
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.status(409).json({
        error: {
          code: 'USER_EXISTS',
          message: 'Email or username already exists'
        }
      });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await User.create({
      email,
      username,
      passwordHash,
      firstName,
      lastName
    });
    
    res.status(201).json(user.toJSON());
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create user'
      }
    });
  }
});

// POST /api/users/login - User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Email and password are required'
        }
      });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }
    
    // Verify password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }
    
    // Update last login
    user.lastLogin = Date.now();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Login failed'
      }
    });
  }
});

// DISCREPANCY: Missing POST /api/users/reset-password endpoint (documented but not implemented)
// DISCREPANCY: Missing POST /api/users/reset-password/confirm endpoint (documented but not implemented)

// GET /api/users/:id - Get user by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }
    
    res.json(user.toJSON());
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch user'
      }
    });
  }
});

// PUT /api/users/:id - Update user profile
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Check if user is updating their own profile
    if (req.user.userId !== req.params.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Cannot update other user\'s profile'
        }
      });
    }
    
    const { firstName, lastName } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }
    
    res.json(user.toJSON());
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update user'
      }
    });
  }
});

module.exports = router;

// Made with Bob
