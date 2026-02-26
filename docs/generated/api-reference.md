# API Reference Documentation

**Generated**: 2026-02-26T16:05:10Z  
**Source**: Automated analysis of [`src/api/routes/`](src/api/routes/)  
**Base URL**: `http://localhost:3000/api`  
**Version**: 1.0.0

## Table of Contents

1. [Authentication](#authentication)
2. [User Endpoints](#user-endpoints)
3. [Product Endpoints](#product-endpoints)
4. [Order Endpoints](#order-endpoints)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

## Authentication

This API uses JWT (JSON Web Token) based authentication. Include the token in the `Authorization` header for protected endpoints.

### Authentication Header Format

```
Authorization: Bearer <your-jwt-token>
```

### Token Acquisition

Obtain a token by calling the login endpoint. Tokens expire after 24 hours.

### Authorization Levels

- **Public**: No authentication required
- **Authenticated**: Valid JWT token required
- **Admin**: Valid JWT token with admin role required

---

## User Endpoints

### Create User

Create a new user account.

**Endpoint**: `POST /api/users`  
**Authentication**: Public  
**Source**: [`users.js:9`](src/api/routes/users.js:9)

#### Request Body

```json
{
  "email": "john.doe@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | No | User's email address (unique) |
| username | string | Yes | Username (3-30 chars, unique) |
| password | string | Yes | Password (will be hashed) |
| firstName | string | No | User's first name (max 50 chars) |
| lastName | string | No | User's last name (max 50 chars) |

#### Success Response (201 Created)

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "john.doe@example.com",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user",
  "createdAt": "2026-02-26T16:00:00.000Z",
  "updatedAt": "2026-02-26T16:00:00.000Z"
}
```

#### Error Responses

**400 Bad Request** - Missing required fields
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Username and password are required"
  }
}
```

**409 Conflict** - User already exists
```json
{
  "error": {
    "code": "USER_EXISTS",
    "message": "Email or username already exists"
  }
}
```

#### Example Usage

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "username": "johndoe",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

---

### User Login

Authenticate a user and receive a JWT token.

**Endpoint**: `POST /api/users/login`  
**Authentication**: Public  
**Source**: [`users.js:61`](src/api/routes/users.js:61)

#### Request Body

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |
| password | string | Yes | User's password |

#### Success Response (200 OK)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "lastLogin": "2026-02-26T16:00:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request** - Missing credentials
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Email and password are required"
  }
}
```

**401 Unauthorized** - Invalid credentials
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

#### Example Usage

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

---

### Get User by ID

Retrieve user profile information.

**Endpoint**: `GET /api/users/:id`  
**Authentication**: Authenticated  
**Source**: [`users.js:125`](src/api/routes/users.js:125)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | User's MongoDB ObjectId |

#### Success Response (200 OK)

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "john.doe@example.com",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user",
  "createdAt": "2026-02-26T16:00:00.000Z",
  "updatedAt": "2026-02-26T16:00:00.000Z",
  "lastLogin": "2026-02-26T16:00:00.000Z"
}
```

#### Error Responses

**401 Unauthorized** - Missing or invalid token
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid authorization header"
  }
}
```

**404 Not Found** - User not found
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```

#### Example Usage

```bash
curl -X GET http://localhost:3000/api/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Update User Profile

Update user's profile information.

**Endpoint**: `PUT /api/users/:id`  
**Authentication**: Authenticated (self-only)  
**Source**: [`users.js:150`](src/api/routes/users.js:150)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | User's MongoDB ObjectId |

#### Request Body

```json
{
  "firstName": "John",
  "lastName": "Smith"
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| firstName | string | No | Updated first name |
| lastName | string | No | Updated last name |

#### Success Response (200 OK)

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "john.doe@example.com",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Smith",
  "role": "user",
  "updatedAt": "2026-02-26T16:05:00.000Z"
}
```

#### Error Responses

**403 Forbidden** - Attempting to update another user's profile
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Cannot update other user's profile"
  }
}
```

#### Example Usage

```bash
curl -X PUT http://localhost:3000/api/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Smith"
  }'
```

---

## Product Endpoints

### Search Products

Search and filter products with pagination.

**Endpoint**: `POST /api/products/search`  
**Authentication**: Public  
**Source**: [`products.js:8`](src/api/routes/products.js:8)

#### Request Body

```json
{
  "query": "laptop",
  "category": "Electronics",
  "filters": {
    "minPrice": 500,
    "maxPrice": 2000,
    "inStock": true
  },
  "page": 1,
  "limit": 20,
  "sort": "price",
  "order": "asc"
}
```

#### Request Parameters

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| query | string | No | - | Text search query |
| category | string | No | - | Filter by category |
| filters | object | No | - | Additional filters |
| filters.minPrice | number | No | - | Minimum price |
| filters.maxPrice | number | No | - | Maximum price |
| filters.inStock | boolean | No | - | Filter by stock status |
| page | number | No | 1 | Page number |
| limit | number | No | 20 | Items per page (max 100) |
| sort | string | No | createdAt | Sort field |
| order | string | No | desc | Sort order (asc/desc) |

#### Success Response (200 OK)

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Gaming Laptop",
      "description": "High-performance gaming laptop",
      "price": 1299.99,
      "category": "Electronics",
      "inStock": true,
      "quantity": 15,
      "imageUrl": "https://example.com/laptop.jpg",
      "createdAt": "2026-02-26T16:00:00.000Z",
      "updatedAt": "2026-02-26T16:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### Example Usage

```bash
curl -X POST http://localhost:3000/api/products/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "laptop",
    "category": "Electronics",
    "filters": {
      "minPrice": 500,
      "maxPrice": 2000,
      "inStock": true
    },
    "page": 1,
    "limit": 20,
    "sort": "price",
    "order": "asc"
  }'
```

---

### Get Product by ID

Retrieve detailed product information.

**Endpoint**: `GET /api/products/:id`  
**Authentication**: Public  
**Source**: [`products.js:74`](src/api/routes/products.js:74)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Product's MongoDB ObjectId |

#### Success Response (200 OK)

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Gaming Laptop",
  "description": "High-performance gaming laptop with RTX 4070",
  "price": 1299.99,
  "category": "Electronics",
  "inStock": true,
  "quantity": 15,
  "imageUrl": "https://example.com/laptop.jpg",
  "createdAt": "2026-02-26T16:00:00.000Z",
  "updatedAt": "2026-02-26T16:00:00.000Z"
}
```

#### Error Responses

**404 Not Found** - Product not found
```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found"
  }
}
```

#### Example Usage

```bash
curl -X GET http://localhost:3000/api/products/507f1f77bcf86cd799439012
```

---

### Create Product

Create a new product (admin only).

**Endpoint**: `POST /api/products`  
**Authentication**: Admin  
**Source**: [`products.js:99`](src/api/routes/products.js:99)

#### Request Body

```json
{
  "name": "Gaming Laptop",
  "description": "High-performance gaming laptop",
  "price": 1299.99,
  "category": "Electronics",
  "quantity": 15,
  "imageUrl": "https://example.com/laptop.jpg"
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Product name (1-200 chars) |
| description | string | No | Product description (max 2000 chars) |
| price | number | Yes | Product price (>= 0) |
| category | string | Yes | Category (Electronics, Clothing, Books, Home, Sports, Other) |
| quantity | number | No | Initial quantity (default: 0) |
| imageUrl | string | No | Product image URL |

#### Success Response (201 Created)

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Gaming Laptop",
  "description": "High-performance gaming laptop",
  "price": 1299.99,
  "category": "Electronics",
  "inStock": true,
  "quantity": 15,
  "imageUrl": "https://example.com/laptop.jpg",
  "createdAt": "2026-02-26T16:00:00.000Z",
  "updatedAt": "2026-02-26T16:00:00.000Z"
}
```

#### Error Responses

**400 Bad Request** - Missing required fields
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Name, price, and category are required"
  }
}
```

**403 Forbidden** - Not an admin
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Admin access required"
  }
}
```

#### Example Usage

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gaming Laptop",
    "description": "High-performance gaming laptop",
    "price": 1299.99,
    "category": "Electronics",
    "quantity": 15
  }'
```

---

### Get Product Recommendations

Get product recommendations based on a product.

**Endpoint**: `GET /api/products/recommendations/:id`  
**Authentication**: Public  
**Source**: [`products.js:136`](src/api/routes/products.js:136)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Product's MongoDB ObjectId |

#### Success Response (200 OK)

```json
{
  "product": "Gaming Laptop",
  "recommendations": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Gaming Mouse",
      "price": 79.99,
      "category": "Electronics",
      "inStock": true
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Mechanical Keyboard",
      "price": 149.99,
      "category": "Electronics",
      "inStock": true
    }
  ]
}
```

#### Example Usage

```bash
curl -X GET http://localhost:3000/api/products/recommendations/507f1f77bcf86cd799439012
```

---

## Order Endpoints

### Create Order

Create a new order with items.

**Endpoint**: `POST /api/orders`  
**Authentication**: Authenticated  
**Source**: [`orders.js:8`](src/api/routes/orders.js:8)

#### Request Body

```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "quantity": 2
    },
    {
      "productId": "507f1f77bcf86cd799439013",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card"
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| items | array | Yes | Array of order items (min 1) |
| items[].productId | string | Yes | Product's MongoDB ObjectId |
| items[].quantity | number | Yes | Quantity to order (min 1) |
| shippingAddress | object | Yes | Shipping address |
| shippingAddress.street | string | Yes | Street address (max 200 chars) |
| shippingAddress.city | string | Yes | City (max 100 chars) |
| shippingAddress.state | string | Yes | State/Province (max 100 chars) |
| shippingAddress.zipCode | string | Yes | Postal code (max 20 chars) |
| shippingAddress.country | string | Yes | Country (max 100 chars) |
| paymentMethod | string | No | Payment method (credit_card, debit_card, paypal) |

#### Success Response (201 Created)

```json
{
  "_id": "507f1f77bcf86cd799439015",
  "userId": "507f1f77bcf86cd799439011",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "productName": "Gaming Laptop",
      "quantity": 2,
      "price": 1299.99
    }
  ],
  "total": 2599.98,
  "status": "pending",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card",
  "createdAt": "2026-02-26T16:00:00.000Z",
  "updatedAt": "2026-02-26T16:00:00.000Z"
}
```

#### Error Responses

**400 Bad Request** - Invalid input
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Order must contain at least one item"
  }
}
```

**404 Not Found** - Product not found
```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product 507f1f77bcf86cd799439012 not found"
  }
}
```

**409 Conflict** - Out of stock
```json
{
  "error": {
    "code": "OUT_OF_STOCK",
    "message": "Product Gaming Laptop is out of stock"
  }
}
```

#### Example Usage

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "507f1f77bcf86cd799439012",
        "quantity": 2
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "paymentMethod": "credit_card"
  }'
```

---

### Get Order History

Retrieve user's order history with pagination.

**Endpoint**: `GET /api/orders`  
**Authentication**: Authenticated  
**Source**: [`orders.js:90`](src/api/routes/orders.js:90)

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number |
| limit | number | No | 20 | Items per page (max 100) |

#### Success Response (200 OK)

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "total": 2599.98,
      "status": "delivered",
      "createdAt": "2026-02-26T16:00:00.000Z"
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

#### Example Usage

```bash
curl -X GET "http://localhost:3000/api/orders?page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Get Order Details

Retrieve detailed information about a specific order.

**Endpoint**: `GET /api/orders/:id`  
**Authentication**: Authenticated (owner only)  
**Source**: [`orders.js:126`](src/api/routes/orders.js:126)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Order's MongoDB ObjectId |

#### Success Response (200 OK)

```json
{
  "_id": "507f1f77bcf86cd799439015",
  "userId": "507f1f77bcf86cd799439011",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "productName": "Gaming Laptop",
      "quantity": 2,
      "price": 1299.99
    }
  ],
  "total": 2599.98,
  "status": "delivered",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card",
  "trackingNumber": "1Z999AA10123456784",
  "createdAt": "2026-02-26T16:00:00.000Z",
  "updatedAt": "2026-02-26T16:05:00.000Z"
}
```

#### Error Responses

**403 Forbidden** - Not order owner
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Cannot view other user's orders"
  }
}
```

**404 Not Found** - Order not found
```json
{
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order not found"
  }
}
```

#### Example Usage

```bash
curl -X GET http://localhost:3000/api/orders/507f1f77bcf86cd799439015 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Cancel Order

Cancel a pending or paid order.

**Endpoint**: `PATCH /api/orders/:id/cancel`  
**Authentication**: Authenticated (owner only)  
**Source**: [`orders.js:161`](src/api/routes/orders.js:161)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Order's MongoDB ObjectId |

#### Success Response (200 OK)

```json
{
  "id": "507f1f77bcf86cd799439015",
  "status": "cancelled",
  "cancelledAt": "2026-02-26T16:05:00.000Z"
}
```

#### Error Responses

**403 Forbidden** - Not order owner
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Cannot cancel other user's orders"
  }
}
```

**409 Conflict** - Cannot cancel
```json
{
  "error": {
    "code": "CANNOT_CANCEL",
    "message": "Order cannot be cancelled (already shipped or delivered)"
  }
}
```

#### Business Rules

- Only orders with status `pending` or `paid` can be cancelled
- Cancelling an order restores product inventory
- Cancellation timestamp is automatically recorded

#### Example Usage

```bash
curl -X PATCH http://localhost:3000/api/orders/507f1f77bcf86cd799439015/cancel \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Order Status Webhook

Internal webhook for order status updates.

**Endpoint**: `POST /api/orders/webhook/status`  
**Authentication**: Internal  
**Source**: [`orders.js:225`](src/api/routes/orders.js:225)

#### Request Body

```json
{
  "orderId": "507f1f77bcf86cd799439015",
  "status": "shipped",
  "timestamp": "2026-02-26T16:00:00.000Z"
}
```

#### Success Response (200 OK)

```json
{
  "received": true
}
```

#### Note

This endpoint is intended for internal use by shipping/fulfillment systems.

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_INPUT | 400 | Missing or invalid request parameters |
| UNAUTHORIZED | 401 | Missing or invalid authentication token |
| INVALID_CREDENTIALS | 401 | Invalid email/password combination |
| INVALID_TOKEN | 401 | Expired or malformed JWT token |
| FORBIDDEN | 403 | Insufficient permissions for action |
| USER_NOT_FOUND | 404 | User does not exist |
| PRODUCT_NOT_FOUND | 404 | Product does not exist |
| ORDER_NOT_FOUND | 404 | Order does not exist |
| USER_EXISTS | 409 | Email or username already registered |
| OUT_OF_STOCK | 409 | Product inventory insufficient |
| CANNOT_CANCEL | 409 | Order cannot be cancelled |
| SERVER_ERROR | 500 | Internal server error |

### Error Response Examples

#### 400 Bad Request
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Username and password are required"
  }
}
```

#### 401 Unauthorized
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid authorization header"
  }
}
```

#### 403 Forbidden
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Admin access required"
  }
}
```

#### 404 Not Found
```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found"
  }
}
```

#### 500 Internal Server Error
```json
{
  "error": {
    "code": "SERVER_ERROR",
    "message": "Failed to create order"
  }
}
```

## Rate Limiting

Currently, no rate limiting is implemented. For production deployment, consider implementing:

- **Per-IP rate limiting**: 100 requests per minute
- **Per-user rate limiting**: 1000 requests per hour
- **Burst allowance**: 20 requests per second

## API Coverage Summary

### Implemented Endpoints

| Category | Endpoint | Method | Auth | Status |
|----------|----------|--------|------|--------|
| Users | `/api/users` | POST | Public | ✅ Implemented |
| Users | `/api/users/login` | POST | Public | ✅ Implemented |
| Users | `/api/users/:id` | GET | Authenticated | ✅ Implemented |
| Users | `/api/users/:id` | PUT | Authenticated | ✅ Implemented |
| Products | `/api/products/search` | POST | Public | ✅ Implemented |
| Products | `/api/products/:id` | GET | Public | ✅ Implemented |
| Products | `/api/products` | POST | Admin | ✅ Implemented |
| Products | `/api/products/recommendations/:id` | GET | Public | ✅ Implemented |
| Orders | `/api/orders` | POST | Authenticated | ✅ Implemented |
| Orders | `/api/orders` | GET | Authenticated | ✅ Implemented |
| Orders | `/api/orders/:id` | GET | Authenticated | ✅ Implemented |
| Orders | `/api/orders/:id/cancel` | PATCH | Authenticated | ✅ Implemented |
| Orders | `/api/orders/webhook/status` | POST | Internal | ✅ Implemented |

**Total Endpoints**: 13  
**Coverage**: 100% of implemented routes documented

---

**Documentation Quality**: ✅ Complete  
**Last Updated**: 2026-02-26T16:05:10Z  
**Generated By**: Bob Documentation Generation Mode