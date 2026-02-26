# API Endpoints Documentation

**Version**: 1.0.0  
**Last Updated**: 2026-02-20  
**Base URL**: `http://localhost:3000/api`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## User Endpoints

### POST /api/users
**Authentication**: Not required  
**Description**: Create a new user account

**Request Body**:
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** (201 Created):
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2026-02-25T10:30:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Email or username already exists

---

### POST /api/users/login
**Authentication**: Not required  
**Description**: Authenticate user and receive JWT token

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials

---

### POST /api/users/reset-password
**Authentication**: Not required  
**Description**: Request password reset via email

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "message": "Password reset email sent"
}
```

**Error Responses**:
- `404 Not Found`: User not found

---

### POST /api/users/reset-password/confirm
**Authentication**: Not required  
**Description**: Reset password using token

**Request Body**:
```json
{
  "token": "reset-token-here",
  "newPassword": "NewSecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "message": "Password reset successful"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid or expired token

---

### GET /api/users/:id
**Authentication**: Required  
**Description**: Get user details by ID

**Path Parameters**:
- `id` (string, required): User ID

**Response** (200 OK):
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2026-02-25T10:30:00Z",
  "lastLogin": "2026-02-25T15:45:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: User not found

---

### PUT /api/users/:id
**Authentication**: Required  
**Description**: Update user profile

**Path Parameters**:
- `id` (string, required): User ID

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Smith"
}
```

**Response** (200 OK):
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Smith",
  "updatedAt": "2026-02-25T16:00:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Cannot update other user's profile
- `404 Not Found`: User not found

---

## Product Endpoints

### GET /api/products
**Authentication**: Not required  
**Description**: Get paginated list of products

**Query Parameters**:
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20, max: 100)
- `category` (string, optional): Filter by category
- `search` (string, optional): Search in name and description
- `sort` (string, optional): Sort by field (price, name, createdAt)
- `order` (string, optional): Sort order (asc, desc)

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Wireless Mouse",
      "description": "Ergonomic wireless mouse with USB receiver",
      "price": 29.99,
      "category": "Electronics",
      "inStock": true,
      "quantity": 150,
      "imageUrl": "https://example.com/images/mouse.jpg",
      "createdAt": "2026-02-20T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

### GET /api/products/:id
**Authentication**: Not required  
**Description**: Get product details by ID

**Path Parameters**:
- `id` (string, required): Product ID

**Response** (200 OK):
```json
{
  "id": "507f1f77bcf86cd799439012",
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with USB receiver",
  "price": 29.99,
  "category": "Electronics",
  "inStock": true,
  "quantity": 150,
  "imageUrl": "https://example.com/images/mouse.jpg",
  "createdAt": "2026-02-20T10:00:00Z",
  "updatedAt": "2026-02-25T14:30:00Z"
}
```

**Error Responses**:
- `404 Not Found`: Product not found

---

### POST /api/products
**Authentication**: Required (Admin only)  
**Description**: Create a new product

**Request Body**:
```json
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with USB receiver",
  "price": 29.99,
  "category": "Electronics",
  "quantity": 150,
  "imageUrl": "https://example.com/images/mouse.jpg"
}
```

**Response** (201 Created):
```json
{
  "id": "507f1f77bcf86cd799439012",
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with USB receiver",
  "price": 29.99,
  "category": "Electronics",
  "inStock": true,
  "quantity": 150,
  "imageUrl": "https://example.com/images/mouse.jpg",
  "createdAt": "2026-02-25T16:00:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not admin
- `400 Bad Request`: Invalid product data

---

### PUT /api/products/:id
**Authentication**: Required (Admin only)  
**Description**: Update product details

**Path Parameters**:
- `id` (string, required): Product ID

**Request Body**:
```json
{
  "name": "Wireless Mouse Pro",
  "price": 34.99,
  "quantity": 200
}
```

**Response** (200 OK):
```json
{
  "id": "507f1f77bcf86cd799439012",
  "name": "Wireless Mouse Pro",
  "description": "Ergonomic wireless mouse with USB receiver",
  "price": 34.99,
  "category": "Electronics",
  "inStock": true,
  "quantity": 200,
  "updatedAt": "2026-02-25T16:30:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not admin
- `404 Not Found`: Product not found

---

## Order Endpoints

### POST /api/orders
**Authentication**: Required  
**Description**: Create a new order

**Request Body**:
```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "country": "USA"
  }
}
```

**Response** (201 Created):
```json
{
  "id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439011",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "quantity": 2,
      "price": 29.99
    }
  ],
  "total": 59.98,
  "status": "pending",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "country": "USA"
  },
  "createdAt": "2026-02-25T16:00:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token
- `400 Bad Request`: Invalid order data
- `404 Not Found`: Product not found
- `409 Conflict`: Product out of stock

---

### GET /api/orders
**Authentication**: Required  
**Description**: Get user's order history

**Query Parameters**:
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20)

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439013",
      "total": 59.98,
      "status": "delivered",
      "createdAt": "2026-02-25T16:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

---

### GET /api/orders/:id
**Authentication**: Required  
**Description**: Get order details by ID

**Path Parameters**:
- `id` (string, required): Order ID

**Response** (200 OK):
```json
{
  "id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439011",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "productName": "Wireless Mouse",
      "quantity": 2,
      "price": 29.99
    }
  ],
  "total": 59.98,
  "status": "delivered",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "country": "USA"
  },
  "createdAt": "2026-02-25T16:00:00Z",
  "updatedAt": "2026-02-26T10:00:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Cannot view other user's orders
- `404 Not Found`: Order not found

---

### PATCH /api/orders/:id/cancel
**Authentication**: Required  
**Description**: Cancel an order

**Path Parameters**:
- `id` (string, required): Order ID

**Response** (200 OK):
```json
{
  "id": "507f1f77bcf86cd799439013",
  "status": "cancelled",
  "cancelledAt": "2026-02-25T17:00:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Cannot cancel other user's orders
- `404 Not Found`: Order not found
- `409 Conflict`: Order cannot be cancelled (already shipped)

---

## Admin Endpoints

### GET /api/admin/dashboard
**Authentication**: Required (Admin only)  
**Description**: Get admin dashboard statistics

**Response** (200 OK):
```json
{
  "totalUsers": 1250,
  "totalProducts": 450,
  "totalOrders": 3200,
  "revenue": {
    "today": 1250.50,
    "thisWeek": 8750.25,
    "thisMonth": 35000.00
  },
  "recentOrders": [
    {
      "id": "507f1f77bcf86cd799439013",
      "total": 59.98,
      "status": "pending",
      "createdAt": "2026-02-25T16:00:00Z"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not admin

---

## Error Response Format

All errors follow this standard format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

## Rate Limiting

- **Unauthenticated requests**: 100 requests per 15 minutes
- **Authenticated requests**: 1000 requests per 15 minutes
- **Admin requests**: 5000 requests per 15 minutes

## Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (duplicate, out of stock, etc.)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error