# BarberCraft Backend API

A single-file Node.js backend providing a complete REST API for the BarberCraft barber shop application.

## Quick Start

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

4. **Test the API:**
   ```bash
   curl http://localhost:4000/api/health
   ```

The server will automatically:
- Create a SQLite database (`data.db`)
- Set up all required tables
- Seed with demo data
- Start listening on port 4000

## Demo Credentials

- **Admin:** username=`admin`, password=`admin123`
- **User:** username=`demo`, password=`user123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Services
- `GET /api/services` - List all services
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create service (admin only)
- `PUT /api/services/:id` - Update service (admin only)
- `DELETE /api/services/:id` - Delete service (admin only)

### Staff/Barbers
- `GET /api/staff` - List staff members
- `GET /api/barbers` - List barbers (alias for staff)

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Appointments/Bookings
- `GET /api/appointments` - List appointments
- `GET /api/appointments/:id` - Get appointment details
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders/checkout` - Create order (cash payment only)

### Reviews
- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Create review

### Utility
- `GET /api/search?q=query` - Search services, staff, and products
- `GET /api/availability?date=YYYY-MM-DD&serviceId=1` - Check available time slots
- `GET /api/customers` - List customers (admin only)

## Request/Response Examples

### Register User
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "password": "password123", "email": "john@example.com", "name": "John Doe"}'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Create Appointment
```bash
curl -X POST http://localhost:4000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"service_id": 1, "date": "2024-01-20", "time": "10:00", "notes": "Regular cut"}'
```

### Create Order
```bash
curl -X POST http://localhost:4000/api/orders/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"items": [{"product_id": 1, "quantity": 2}], "shipping_address": {"street": "123 Main St", "city": "New York", "state": "NY", "zipCode": "10001"}}'
```

## Database Schema

The backend uses SQLite with the following tables:
- `users` - User accounts and authentication
- `services` - Barber services and pricing
- `staff` - Staff/barber information
- `products` - Shop products
- `appointments` - Booking appointments
- `orders` - Product orders
- `reviews` - Customer reviews

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on auth endpoints
- CORS protection
- Helmet security headers
- Input validation
- Role-based authorization

## Migration to Production Database

To migrate from SQLite to PostgreSQL/Supabase:

1. **Install PostgreSQL driver:**
   ```bash
   npm install pg
   ```

2. **Update database connection:**
   Replace the SQLite3 setup with PostgreSQL:
   ```javascript
   const { Pool } = require('pg');
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL
   });
   ```

3. **Update queries:**
   Replace SQLite-specific syntax with PostgreSQL equivalents:
   - `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`
   - `DATETIME DEFAULT CURRENT_TIMESTAMP` → `TIMESTAMP DEFAULT NOW()`

4. **Environment variables:**
   ```bash
   DATABASE_URL=postgresql://user:password@localhost:5432/barbercraft
   ```

## File Structure

```
backend/
├── special-backend.js    # Main server file
├── package.json         # Dependencies
├── .env.example        # Environment template
├── README.md           # This file
└── data.db            # SQLite database (auto-created)
```

## Development

The backend is designed as a single file for easy deployment and testing. All functionality is contained in `special-backend.js`:

- Express server setup
- Database initialization and seeding
- Authentication middleware
- All API endpoints
- Error handling

## Testing

Use the provided curl commands or import the API into Postman/Insomnia for testing. The server includes comprehensive error handling and validation.

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use a strong `JWT_SECRET`
3. Configure proper CORS origins
4. Set up SSL/HTTPS
5. Use a production database (PostgreSQL)
6. Set up proper logging
7. Configure process management (PM2)

## Support

For issues or questions, check the API responses for detailed error messages. All endpoints return JSON with appropriate HTTP status codes.