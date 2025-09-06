# BarberCraft API Contract

## Base URL
```
http://localhost:4000/api
```

## Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format
All responses are JSON with consistent structure:

**Success Response:**
```json
{
  "data": "response_data",
  "message": "optional_message"
}
```

**Error Response:**
```json
{
  "error": "error_message"
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "username": "string (required)",
  "password": "string (required, min 6 chars)",
  "email": "string (optional)",
  "name": "string (optional)",
  "role": "USER|ADMIN (optional, default: USER)"
}
```

**Response (201):**
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "username": "john",
    "role": "USER"
  }
}
```

#### POST /auth/login
Authenticate user and get access token.

**Request:**
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "username": "john",
    "role": "USER"
  }
}
```

#### GET /auth/me
Get current user information (requires auth).

**Response (200):**
```json
{
  "id": 1,
  "username": "john",
  "email": "john@example.com",
  "role": "USER",
  "name": "John Doe"
}
```

### Services

#### GET /services
List all services.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Signature Cut",
    "description": "Our flagship haircut service...",
    "price": 65.00,
    "duration": 45,
    "category": "Haircut",
    "image": "https://...",
    "featured": 1,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET /services/:id
Get service details.

**Response (200):**
```json
{
  "id": 1,
  "name": "Signature Cut",
  "description": "Our flagship haircut service...",
  "price": 65.00,
  "duration": 45,
  "category": "Haircut",
  "image": "https://...",
  "featured": 1,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

#### POST /services (Admin only)
Create a new service.

**Request:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "price": "number (required)",
  "duration": "number (required, minutes)",
  "category": "string (optional)",
  "image": "string (optional)",
  "featured": "boolean (optional)"
}
```

### Staff/Barbers

#### GET /staff
List all staff members.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Marcus Johnson",
    "title": "Master Barber & Owner",
    "bio": "With over 15 years of experience...",
    "avatar": "https://...",
    "specialties": ["Classic Cuts", "Beard Styling"],
    "rating": 4.9,
    "years_experience": 15,
    "featured": 1,
    "working_hours": {
      "monday": {"start": "09:00", "end": "18:00"},
      "tuesday": {"start": "09:00", "end": "18:00"}
    }
  }
]
```

#### GET /barbers
Alias for /staff with frontend-compatible format.

### Products

#### GET /products
List all products.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Premium Hold Pomade",
    "description": "Water-based pomade...",
    "price": 28.00,
    "category": "Pomade",
    "brand": "Gentleman's Choice",
    "image": "https://...",
    "in_stock": 1,
    "stock_count": 24,
    "rating": 4.8,
    "review_count": 156,
    "featured": 1
  }
]
```

### Appointments

#### GET /appointments (Auth required)
List user's appointments (or all if admin).

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 2,
    "service_id": 1,
    "staff_id": 1,
    "date": "2024-01-20",
    "time": "10:00",
    "status": "confirmed",
    "notes": "Regular cut",
    "total_price": 65.00,
    "created_at": "2024-01-15T10:00:00.000Z",
    "service_name": "Signature Cut",
    "staff_name": "Marcus Johnson",
    "username": "john"
  }
]
```

#### POST /appointments (Auth required)
Create a new appointment.

**Request:**
```json
{
  "service_id": "number (required)",
  "staff_id": "number (optional)",
  "date": "string (required, YYYY-MM-DD)",
  "time": "string (required, HH:MM)",
  "notes": "string (optional)"
}
```

**Response (201):**
```json
{
  "id": 1,
  "user_id": 2,
  "service_id": 1,
  "staff_id": 1,
  "date": "2024-01-20",
  "time": "10:00",
  "status": "confirmed",
  "notes": "Regular cut",
  "total_price": 65.00,
  "created_at": "2024-01-15T10:00:00.000Z"
}
```

#### PUT /appointments/:id (Auth required)
Update an appointment.

**Request:**
```json
{
  "service_id": "number (optional)",
  "staff_id": "number (optional)",
  "date": "string (optional)",
  "time": "string (optional)",
  "notes": "string (optional)",
  "status": "string (optional)"
}
```

### Orders

#### GET /orders (Auth required)
List user's orders (or all if admin).

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 2,
    "items": [
      {
        "product_id": 1,
        "quantity": 2,
        "price": 28.00
      }
    ],
    "status": "pending_cash",
    "total_amount": 56.00,
    "payment_method": "cash",
    "shipping_address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    },
    "created_at": "2024-01-15T10:00:00.000Z"
  }
]
```

#### POST /orders/checkout (Auth required)
Create a new order with cash payment.

**Request:**
```json
{
  "items": [
    {
      "product_id": "number (required)",
      "quantity": "number (required)"
    }
  ],
  "shipping_address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string"
  }
}
```

### Reviews

#### GET /reviews
List all reviews.

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 2,
    "customer_name": "John S.",
    "customer_avatar": "https://...",
    "rating": 5,
    "comment": "Marcus gave me the best haircut...",
    "service_id": 1,
    "staff_id": 1,
    "created_at": "2024-01-15T10:00:00.000Z",
    "service_name": "Signature Cut",
    "staff_name": "Marcus Johnson"
  }
]
```

#### POST /reviews (Auth required)
Create a new review.

**Request:**
```json
{
  "rating": "number (required, 1-5)",
  "comment": "string (optional)",
  "service_id": "number (optional)",
  "staff_id": "number (optional)"
}
```

### Utility Endpoints

#### GET /search?q=query
Search services, staff, and products.

**Response (200):**
```json
{
  "services": [...],
  "barbers": [...],
  "products": [...]
}
```

#### GET /availability?date=YYYY-MM-DD&serviceId=1&barberId=1
Check available time slots.

**Response (200):**
```json
["09:00", "09:30", "10:00", "10:30", "11:00"]
```

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limits

- Auth endpoints: 5 requests per 15 minutes per IP
- General endpoints: 100 requests per 15 minutes per IP