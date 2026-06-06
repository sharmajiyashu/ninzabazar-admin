# Ninja Bazaar Admin API - Postman Collection

## Overview
This Postman collection contains all API endpoints for the Ninja Bazaar Admin Panel.

## Import Instructions
1. Open Postman
2. Click "Import" button
3. Select the `postman-collection.json` file
4. The collection will be imported with all endpoints and folders

## Environment Setup
Before testing, set up the following variables in Postman:

| Variable | Value | Description |
|----------|-------|-------------|
| `baseUrl` | `http://localhost:3000` | Base URL of the application |
| `authToken` | (empty initially) | JWT token from sign-in (auto-set after sign-in) |

## Authentication Flow

### 1. Sign In
**Endpoint:** `POST {{baseUrl}}/api/auth/signin`

Request Body:
```json
{
    "username": "admin",
    "password": "your_password"
}
```

The collection includes a test script that automatically extracts the JWT token from the response and sets the `authToken` variable.

### 2. Using Auth Token
All protected endpoints automatically use the `authToken` via Bearer authentication.

## API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signin` | Sign in to get JWT token |
| GET | `/api/auth/session` | Get current session |

### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/get` | Get all users |
| GET | `/api/get-user-by-id?id={{userId}}` | Get user by ID |
| PUT | `/api/users/update` | Update user status |

**User Status Values:** `ACTIVE`, `SUSPENDED`, `BANNED`

### Order Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/get-all-orders` | Get all orders |
| GET | `/api/get-order-details?orderId={{orderId}}` | Get order details |
| PUT | `/api/update-order-status` | Update order status |

**Order Status Values:** `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`

### Escrow Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/escrow/get` | Get all escrow payments |
| PUT | `/api/escrow/release?transactionId={{escrowId}}` | Release escrow payment |

### Seller Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/seller/profile?id={{sellerId}}` | Get seller profile(s) |
| PUT | `/api/seller/profile` | Update seller profile |
| GET | `/api/seller/document?id={{sellerId}}` | Download seller document |

### Product Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/seller/products` | Get all seller products |
| PUT | `/api/seller/products` | Update product approval |

## Testing Flow

1. **Import Collection** → Import `postman-collection.json`
2. **Set Environment** → Configure `baseUrl` variable
3. **Sign In** → Execute "Sign In" request → Token auto-saves
4. **Test Endpoints** → Use any endpoint with auth token

## Protected Routes
All API endpoints (except authentication) require a valid JWT token in the Authorization header:
```
Authorization: Bearer {{authToken}}
```

## Notes
- Some endpoints return large JSON responses with nested relationships
- The escrow release endpoint requires the escrow ID as a query parameter
- Product approval status can be set to `true` (approved) or `false` (under review)
- Seller profile updates require `isVerified` and `storeStatus` fields
