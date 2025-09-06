# BarberCraft API - cURL Cheatsheet

## Setup
```bash
export API_BASE="http://localhost:4000/api"
export TOKEN="your_jwt_token_here"
```

## Authentication

### Register Admin User
```bash
curl -X POST $API_BASE/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "email": "admin@barbercraft.com",
    "name": "Admin User",
    "role": "ADMIN"
  }'
```

### Register Regular User
```bash
curl -X POST $API_BASE/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "password123",
    "email": "john@example.com",
    "name": "John Doe"
  }'
```

### Login
```bash
curl -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Get Current User
```bash
curl -X GET $API_BASE/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## Services

### List Services
```bash
curl -X GET $API_BASE/services
```

### Get Service Details
```bash
curl -X GET $API_BASE/services/1
```

### Create Service (Admin)
```bash
curl -X POST $API_BASE/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Premium Cut",
    "description": "Luxury haircut experience",
    "price": 85.00,
    "duration": 60,
    "category": "Haircut",
    "featured": true
  }'
```

### Update Service (Admin)
```bash
curl -X PUT $API_BASE/services/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Updated Service Name",
    "price": 70.00
  }'
```

### Delete Service (Admin)
```bash
curl -X DELETE $API_BASE/services/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Staff/Barbers

### List Staff
```bash
curl -X GET $API_BASE/staff
```

### List Barbers (Frontend Compatible)
```bash
curl -X GET $API_BASE/barbers
```

## Products

### List Products
```bash
curl -X GET $API_BASE/products
```

### Get Product Details
```bash
curl -X GET $API_BASE/products/1
```

### Create Product (Admin)
```bash
curl -X POST $API_BASE/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Luxury Pomade",
    "description": "Premium styling pomade",
    "price": 35.00,
    "category": "Pomade",
    "brand": "BarberCraft Pro",
    "featured": true
  }'
```

## Appointments

### List Appointments
```bash
curl -X GET $API_BASE/appointments \
  -H "Authorization: Bearer $TOKEN"
```

### Create Appointment
```bash
curl -X POST $API_BASE/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "service_id": 1,
    "staff_id": 1,
    "date": "2024-01-25",
    "time": "10:00",
    "notes": "Regular customer, prefers scissors"
  }'
```

### Update Appointment
```bash
curl -X PUT $API_BASE/appointments/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "date": "2024-01-26",
    "time": "11:00",
    "notes": "Rescheduled appointment"
  }'
```

### Cancel Appointment
```bash
curl -X PUT $API_BASE/appointments/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "cancelled"
  }'
```

### Delete Appointment
```bash
curl -X DELETE $API_BASE/appointments/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Orders

### List Orders
```bash
curl -X GET $API_BASE/orders \
  -H "Authorization: Bearer $TOKEN"
```

### Create Order (Cash Payment)
```bash
curl -X POST $API_BASE/orders/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [
      {
        "product_id": 1,
        "quantity": 2
      },
      {
        "product_id": 2,
        "quantity": 1
      }
    ],
    "shipping_address": {
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    }
  }'
```

## Reviews

### List Reviews
```bash
curl -X GET $API_BASE/reviews
```

### Create Review
```bash
curl -X POST $API_BASE/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "rating": 5,
    "comment": "Excellent service! Marcus did an amazing job.",
    "service_id": 1,
    "staff_id": 1
  }'
```

## Utility Endpoints

### Health Check
```bash
curl -X GET $API_BASE/health
```

### Search
```bash
curl -X GET "$API_BASE/search?q=haircut"
```

### Check Availability
```bash
curl -X GET "$API_BASE/availability?date=2024-01-25&serviceId=1&barberId=1"
```

### List Customers (Admin)
```bash
curl -X GET $API_BASE/customers \
  -H "Authorization: Bearer $TOKEN"
```

## Testing Flow

### Complete User Journey
```bash
# 1. Register user
REGISTER_RESPONSE=$(curl -s -X POST $API_BASE/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "test123", "name": "Test User"}')

# 2. Extract token
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')

# 3. List services
curl -X GET $API_BASE/services

# 4. Create appointment
curl -X POST $API_BASE/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "service_id": 1,
    "date": "2024-01-25",
    "time": "14:00"
  }'

# 5. List user appointments
curl -X GET $API_BASE/appointments \
  -H "Authorization: Bearer $TOKEN"

# 6. Create order
curl -X POST $API_BASE/orders/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [{"product_id": 1, "quantity": 1}]
  }'
```

## Error Testing

### Invalid Credentials
```bash
curl -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "invalid", "password": "wrong"}'
```

### Missing Authorization
```bash
curl -X GET $API_BASE/appointments
```

### Invalid Data
```bash
curl -X POST $API_BASE/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"service_id": "invalid"}'
```

## Batch Operations

### Create Multiple Services (Admin)
```bash
for service in "Basic Cut:25:30" "Deluxe Cut:45:45" "Beard Trim:20:20"; do
  IFS=':' read -r name price duration <<< "$service"
  curl -X POST $API_BASE/services \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"name\": \"$name\", \"price\": $price, \"duration\": $duration}"
done
```

### Check Multiple Time Slots
```bash
for time in "09:00" "10:00" "11:00" "14:00" "15:00"; do
  echo "Checking availability for $time"
  curl -s -X GET "$API_BASE/availability?date=2024-01-25&serviceId=1" | jq ".[] | select(. == \"$time\")"
done
```