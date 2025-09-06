const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const SALT_ROUNDS = 12;

// Database setup
const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later.' }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

// Initialize database tables
function initializeDatabase() {
  const schema = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'USER' CHECK(role IN ('USER', 'ADMIN')),
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Services table
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      duration INTEGER NOT NULL, -- in minutes
      category TEXT DEFAULT 'Haircut',
      image TEXT,
      featured BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Staff/Barbers table
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      title TEXT,
      bio TEXT,
      avatar TEXT,
      specialties TEXT, -- JSON array as string
      rating DECIMAL(3,2) DEFAULT 4.5,
      years_experience INTEGER DEFAULT 0,
      featured BOOLEAN DEFAULT 0,
      working_hours TEXT, -- JSON object as string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Products table
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      category TEXT DEFAULT 'Tools',
      brand TEXT DEFAULT 'BarberCraft',
      image TEXT,
      in_stock BOOLEAN DEFAULT 1,
      stock_count INTEGER DEFAULT 10,
      rating DECIMAL(3,2) DEFAULT 4.5,
      review_count INTEGER DEFAULT 0,
      featured BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Appointments/Bookings table
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      staff_id INTEGER,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'pending', 'completed', 'cancelled')),
      notes TEXT,
      total_price DECIMAL(10,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (service_id) REFERENCES services (id),
      FOREIGN KEY (staff_id) REFERENCES staff (id)
    );

    -- Orders table
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      items TEXT NOT NULL, -- JSON array as string
      status TEXT DEFAULT 'pending_cash' CHECK(status IN ('pending_cash', 'confirmed_cash', 'processing', 'shipped', 'delivered', 'cancelled')),
      total_amount DECIMAL(10,2) NOT NULL,
      payment_method TEXT DEFAULT 'cash',
      shipping_address TEXT, -- JSON object as string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    -- Reviews table
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      customer_name TEXT,
      customer_avatar TEXT,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      service_id INTEGER,
      staff_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (service_id) REFERENCES services (id),
      FOREIGN KEY (staff_id) REFERENCES staff (id)
    );
  `;

  db.exec(schema, (err) => {
    if (err) {
      console.error('Error creating database schema:', err);
    } else {
      console.log('✅ Database schema initialized');
      seedDatabase();
    }
  });
}

// Seed database with initial data
function seedDatabase() {
  // Check if data already exists
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (err || row.count > 0) return;

    console.log('🌱 Seeding database with initial data...');

    // Seed users
    const adminPassword = bcrypt.hashSync('admin123', SALT_ROUNDS);
    const userPassword = bcrypt.hashSync('user123', SALT_ROUNDS);

    db.run(`INSERT INTO users (username, email, password_hash, role, name) VALUES 
      ('admin', 'admin@barbercraft.com', ?, 'ADMIN', 'Admin User'),
      ('demo', 'demo@barbercraft.com', ?, 'USER', 'Demo User')`,
      [adminPassword, userPassword]);

    // Seed services
    const services = [
      ['Signature Cut', 'Our flagship haircut service featuring consultation, precision cutting, and styling with premium products.', 65.00, 45, 'Haircut', 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg', 1],
      ['Beard Trim & Shape', 'Professional beard trimming and shaping to complement your facial structure.', 35.00, 30, 'Beard', 'https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg', 1],
      ['Hot Towel Shave', 'Traditional hot towel shave with pre-shave oil, lather, and aftercare treatment.', 55.00, 40, 'Shave', 'https://images.pexels.com/photos/3618162/pexels-photo-3618162.jpeg', 1],
      ['Buzz Cut', 'Clean, precise buzz cut with your choice of guard length.', 25.00, 20, 'Haircut', 'https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg', 0],
      ['Hair Wash & Style', 'Professional wash with premium products and styling.', 45.00, 35, 'Styling', 'https://images.pexels.com/photos/1570810/pexels-photo-1570810.jpeg', 0]
    ];

    const serviceStmt = db.prepare('INSERT INTO services (name, description, price, duration, category, image, featured) VALUES (?, ?, ?, ?, ?, ?, ?)');
    services.forEach(service => serviceStmt.run(service));
    serviceStmt.finalize();

    // Seed staff
    const staff = [
      ['Marcus Johnson', 'Master Barber & Owner', 'With over 15 years of experience, Marcus specializes in classic cuts and modern styling techniques.', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg', JSON.stringify(['Classic Cuts', 'Beard Styling', 'Hot Towel Shaves']), 4.9, 15, 1, JSON.stringify({
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
        wednesday: { start: '09:00', end: '18:00' },
        thursday: { start: '09:00', end: '18:00' },
        friday: { start: '09:00', end: '19:00' },
        saturday: { start: '08:00', end: '17:00' },
        sunday: null
      })],
      ['David Chen', 'Senior Barber', 'David brings precision and artistry to every cut, specializing in modern fades and contemporary styles.', 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg', JSON.stringify(['Modern Fades', 'Precision Cuts', 'Hair Styling']), 4.8, 8, 1, JSON.stringify({
        monday: null,
        tuesday: { start: '10:00', end: '19:00' },
        wednesday: { start: '10:00', end: '19:00' },
        thursday: { start: '10:00', end: '19:00' },
        friday: { start: '10:00', end: '19:00' },
        saturday: { start: '09:00', end: '18:00' },
        sunday: { start: '10:00', end: '16:00' }
      })]
    ];

    const staffStmt = db.prepare('INSERT INTO staff (name, title, bio, avatar, specialties, rating, years_experience, featured, working_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    staff.forEach(member => staffStmt.run(member));
    staffStmt.finalize();

    // Seed products
    const products = [
      ['Premium Hold Pomade', 'Water-based pomade with strong hold and natural shine. Perfect for classic and modern styles.', 28.00, 'Pomade', 'Gentleman\'s Choice', 'https://images.pexels.com/photos/3618110/pexels-photo-3618110.jpeg', 1, 24, 4.8, 156, 1],
      ['Matte Clay Texture', 'Medium hold styling clay with matte finish. Ideal for textured, natural-looking styles.', 32.00, 'Clay', 'Urban Barber', 'https://images.pexels.com/photos/3618164/pexels-photo-3618164.jpeg', 1, 18, 4.6, 89, 1],
      ['Daily Strength Shampoo', 'Gentle daily shampoo that cleanses and strengthens hair without stripping natural oils.', 24.00, 'Shampoo', 'Classic Care', 'https://images.pexels.com/photos/3618067/pexels-photo-3618067.jpeg', 1, 32, 4.5, 203, 0],
      ['Premium Beard Oil', 'Nourishing blend of oils to soften, condition, and add shine to your beard.', 22.00, 'Beard Care', 'Beard Master', 'https://images.pexels.com/photos/3618162/pexels-photo-3618162.jpeg', 1, 28, 4.9, 124, 1]
    ];

    const productStmt = db.prepare('INSERT INTO products (name, description, price, category, brand, image, in_stock, stock_count, rating, review_count, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    products.forEach(product => productStmt.run(product));
    productStmt.finalize();

    // Seed reviews
    const reviews = [
      [2, 'John S.', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg', 5, 'Marcus gave me the best haircut I\'ve had in years. Attention to detail is incredible, and the atmosphere is perfect. Highly recommend!', 1, 1],
      [2, 'Michael J.', null, 5, 'The hot towel shave experience was amazing. Very relaxing and professional service. Will definitely be back.', 3, 1],
      [2, 'David W.', null, 4, 'Great fade by David! He really knows modern styles and gave me exactly what I was looking for.', null, 2]
    ];

    const reviewStmt = db.prepare('INSERT INTO reviews (user_id, customer_name, customer_avatar, rating, comment, service_id, staff_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
    reviews.forEach(review => reviewStmt.run(review));
    reviewStmt.finalize();

    console.log('✅ Database seeded successfully');
    console.log('📝 Demo credentials:');
    console.log('   Admin: username=admin, password=admin123');
    console.log('   User:  username=demo, password=user123');
  });
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Admin middleware
function requireAdmin(req, res, next) {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Utility functions
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, email, name, role = 'USER' } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    db.run(
      'INSERT INTO users (username, email, password_hash, role, name) VALUES (?, ?, ?, ?, ?)',
      [username, email, passwordHash, role, name],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username already exists' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }

        const user = { id: this.lastID, username, role, name };
        const token = generateToken(user);

        res.status(201).json({
          token,
          user: { id: user.id, username: user.username, role: user.role }
        });
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    db.get(
      'SELECT * FROM users WHERE username = ?',
      [username],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Login failed' });
        }

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user);
        res.json({
          token,
          user: { id: user.id, username: user.username, role: user.role }
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, username, email, role, name FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    }
  );
});

// Services endpoints
app.get('/api/services', (req, res) => {
  db.all('SELECT * FROM services ORDER BY featured DESC, name ASC', (err, services) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch services' });
    }
    res.json(services);
  });
});

app.get('/api/services/:id', (req, res) => {
  db.get('SELECT * FROM services WHERE id = ?', [req.params.id], (err, service) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch service' });
    }
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  });
});

app.post('/api/services', authenticateToken, requireAdmin, (req, res) => {
  const { name, description, price, duration, category, image, featured } = req.body;

  if (!name || !price || !duration) {
    return res.status(400).json({ error: 'Name, price, and duration are required' });
  }

  db.run(
    'INSERT INTO services (name, description, price, duration, category, image, featured) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, description, price, duration, category, image, featured ? 1 : 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create service' });
      }
      
      db.get('SELECT * FROM services WHERE id = ?', [this.lastID], (err, service) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch created service' });
        }
        res.status(201).json(service);
      });
    }
  );
});

app.put('/api/services/:id', authenticateToken, requireAdmin, (req, res) => {
  const { name, description, price, duration, category, image, featured } = req.body;
  
  db.run(
    'UPDATE services SET name = ?, description = ?, price = ?, duration = ?, category = ?, image = ?, featured = ? WHERE id = ?',
    [name, description, price, duration, category, image, featured ? 1 : 0, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update service' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Service not found' });
      }
      
      db.get('SELECT * FROM services WHERE id = ?', [req.params.id], (err, service) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch updated service' });
        }
        res.json(service);
      });
    }
  );
});

app.delete('/api/services/:id', authenticateToken, requireAdmin, (req, res) => {
  db.run('DELETE FROM services WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete service' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  });
});

// Staff endpoints
app.get('/api/staff', (req, res) => {
  db.all('SELECT * FROM staff ORDER BY featured DESC, name ASC', (err, staff) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch staff' });
    }
    
    // Parse JSON fields
    const parsedStaff = staff.map(member => ({
      ...member,
      specialties: JSON.parse(member.specialties || '[]'),
      working_hours: JSON.parse(member.working_hours || '{}')
    }));
    
    res.json(parsedStaff);
  });
});

app.get('/api/barbers', (req, res) => {
  // Alias for staff endpoint for frontend compatibility
  db.all('SELECT * FROM staff ORDER BY featured DESC, name ASC', (err, staff) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch barbers' });
    }
    
    // Transform to match frontend expectations
    const barbers = staff.map(member => ({
      id: `barber_${member.id}`,
      name: member.name,
      title: member.title,
      bio: member.bio,
      avatar: member.avatar,
      specialties: JSON.parse(member.specialties || '[]'),
      rating: member.rating,
      yearsExperience: member.years_experience,
      featured: Boolean(member.featured),
      workingHours: JSON.parse(member.working_hours || '{}')
    }));
    
    res.json(barbers);
  });
});

// Products endpoints
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY featured DESC, name ASC', (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    res.json(products);
  });
});

app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch product' });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });
});

app.post('/api/products', authenticateToken, requireAdmin, (req, res) => {
  const { name, description, price, category, brand, image, in_stock, stock_count, featured } = req.body;

  if (!name || !description || !price) {
    return res.status(400).json({ error: 'Name, description, and price are required' });
  }

  db.run(
    'INSERT INTO products (name, description, price, category, brand, image, in_stock, stock_count, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [name, description, price, category || 'Tools', brand || 'BarberCraft', image, in_stock !== false ? 1 : 0, stock_count || 10, featured ? 1 : 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create product' });
      }
      
      db.get('SELECT * FROM products WHERE id = ?', [this.lastID], (err, product) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch created product' });
        }
        res.status(201).json(product);
      });
    }
  );
});

app.put('/api/products/:id', authenticateToken, requireAdmin, (req, res) => {
  const { name, description, price, category, brand, image, in_stock, stock_count, featured } = req.body;
  
  db.run(
    'UPDATE products SET name = ?, description = ?, price = ?, category = ?, brand = ?, image = ?, in_stock = ?, stock_count = ?, featured = ? WHERE id = ?',
    [name, description, price, category, brand, image, in_stock ? 1 : 0, stock_count, featured ? 1 : 0, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update product' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, product) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch updated product' });
        }
        res.json(product);
      });
    }
  );
});

app.delete('/api/products/:id', authenticateToken, requireAdmin, (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete product' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

// Appointments/Bookings endpoints
app.get('/api/appointments', authenticateToken, (req, res) => {
  let query = `
    SELECT a.*, s.name as service_name, s.price as service_price, s.duration as service_duration,
           st.name as staff_name, u.username, u.name as user_name
    FROM appointments a
    LEFT JOIN services s ON a.service_id = s.id
    LEFT JOIN staff st ON a.staff_id = st.id
    LEFT JOIN users u ON a.user_id = u.id
  `;
  let params = [];

  if (req.user.role !== 'ADMIN') {
    query += ' WHERE a.user_id = ?';
    params.push(req.user.id);
  }

  query += ' ORDER BY a.date DESC, a.time DESC';

  db.all(query, params, (err, appointments) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch appointments' });
    }
    res.json(appointments);
  });
});

app.get('/api/appointments/:id', authenticateToken, (req, res) => {
  let query = `
    SELECT a.*, s.name as service_name, s.price as service_price, s.duration as service_duration,
           st.name as staff_name, u.username, u.name as user_name
    FROM appointments a
    LEFT JOIN services s ON a.service_id = s.id
    LEFT JOIN staff st ON a.staff_id = st.id
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.id = ?
  `;
  let params = [req.params.id];

  if (req.user.role !== 'ADMIN') {
    query += ' AND a.user_id = ?';
    params.push(req.user.id);
  }

  db.get(query, params, (err, appointment) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch appointment' });
    }
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment);
  });
});

app.post('/api/appointments', authenticateToken, (req, res) => {
  const { service_id, staff_id, date, time, notes } = req.body;
  const user_id = req.user.id;

  if (!service_id || !date || !time) {
    return res.status(400).json({ error: 'Service, date, and time are required' });
  }

  // Check if time slot is already booked
  db.get(
    'SELECT id FROM appointments WHERE date = ? AND time = ? AND (staff_id = ? OR staff_id IS NULL) AND status != "cancelled"',
    [date, time, staff_id],
    (err, existing) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to check availability' });
      }
      if (existing) {
        return res.status(400).json({ error: 'This time slot is already booked' });
      }

      // Get service price
      db.get('SELECT price FROM services WHERE id = ?', [service_id], (err, service) => {
        if (err || !service) {
          return res.status(400).json({ error: 'Invalid service' });
        }

        db.run(
          'INSERT INTO appointments (user_id, service_id, staff_id, date, time, notes, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [user_id, service_id, staff_id, date, time, notes, service.price, 'confirmed'],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to create appointment' });
            }
            
            db.get(
              `SELECT a.*, s.name as service_name, s.price as service_price, s.duration as service_duration,
                      st.name as staff_name, u.username, u.name as user_name
               FROM appointments a
               LEFT JOIN services s ON a.service_id = s.id
               LEFT JOIN staff st ON a.staff_id = st.id
               LEFT JOIN users u ON a.user_id = u.id
               WHERE a.id = ?`,
              [this.lastID],
              (err, appointment) => {
                if (err) {
                  return res.status(500).json({ error: 'Failed to fetch created appointment' });
                }
                res.status(201).json(appointment);
              }
            );
          }
        );
      });
    }
  );
});

app.put('/api/appointments/:id', authenticateToken, (req, res) => {
  const { service_id, staff_id, date, time, notes, status } = req.body;
  let query = 'UPDATE appointments SET ';
  let params = [];
  let updates = [];

  if (service_id !== undefined) {
    updates.push('service_id = ?');
    params.push(service_id);
  }
  if (staff_id !== undefined) {
    updates.push('staff_id = ?');
    params.push(staff_id);
  }
  if (date !== undefined) {
    updates.push('date = ?');
    params.push(date);
  }
  if (time !== undefined) {
    updates.push('time = ?');
    params.push(time);
  }
  if (notes !== undefined) {
    updates.push('notes = ?');
    params.push(notes);
  }
  if (status !== undefined) {
    updates.push('status = ?');
    params.push(status);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  query += updates.join(', ') + ' WHERE id = ?';
  params.push(req.params.id);

  if (req.user.role !== 'ADMIN') {
    query += ' AND user_id = ?';
    params.push(req.user.id);
  }

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update appointment' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found or access denied' });
    }
    
    db.get(
      `SELECT a.*, s.name as service_name, s.price as service_price, s.duration as service_duration,
              st.name as staff_name, u.username, u.name as user_name
       FROM appointments a
       LEFT JOIN services s ON a.service_id = s.id
       LEFT JOIN staff st ON a.staff_id = st.id
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.id = ?`,
      [req.params.id],
      (err, appointment) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch updated appointment' });
        }
        res.json(appointment);
      }
    );
  });
});

app.delete('/api/appointments/:id', authenticateToken, (req, res) => {
  let query = 'DELETE FROM appointments WHERE id = ?';
  let params = [req.params.id];

  if (req.user.role !== 'ADMIN') {
    query += ' AND user_id = ?';
    params.push(req.user.id);
  }

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete appointment' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found or access denied' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  });
});

// Legacy bookings endpoints for compatibility
app.get('/api/bookings', authenticateToken, (req, res) => {
  // Redirect to appointments endpoint
  req.url = '/api/appointments';
  app._router.handle(req, res);
});

// Orders endpoints
app.get('/api/orders', authenticateToken, (req, res) => {
  let query = 'SELECT * FROM orders';
  let params = [];

  if (req.user.role !== 'ADMIN') {
    query += ' WHERE user_id = ?';
    params.push(req.user.id);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, orders) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
    
    // Parse JSON fields
    const parsedOrders = orders.map(order => ({
      ...order,
      items: JSON.parse(order.items || '[]'),
      shipping_address: order.shipping_address ? JSON.parse(order.shipping_address) : null
    }));
    
    res.json(parsedOrders);
  });
});

app.post('/api/orders/checkout', authenticateToken, (req, res) => {
  const { items, shipping_address } = req.body;
  const user_id = req.user.id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items are required' });
  }

  // Calculate total amount
  let total_amount = 0;
  const itemPromises = items.map(item => {
    return new Promise((resolve, reject) => {
      db.get('SELECT price FROM products WHERE id = ?', [item.product_id || item.id], (err, product) => {
        if (err || !product) {
          reject(new Error(`Invalid product: ${item.product_id || item.id}`));
        } else {
          total_amount += product.price * (item.quantity || 1);
          resolve({
            product_id: item.product_id || item.id,
            quantity: item.quantity || 1,
            price: product.price
          });
        }
      });
    });
  });

  Promise.all(itemPromises)
    .then(validatedItems => {
      db.run(
        'INSERT INTO orders (user_id, items, status, total_amount, payment_method, shipping_address) VALUES (?, ?, ?, ?, ?, ?)',
        [user_id, JSON.stringify(validatedItems), 'pending_cash', total_amount, 'cash', shipping_address ? JSON.stringify(shipping_address) : null],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create order' });
          }
          
          db.get('SELECT * FROM orders WHERE id = ?', [this.lastID], (err, order) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to fetch created order' });
            }
            
            const parsedOrder = {
              ...order,
              items: JSON.parse(order.items),
              shipping_address: order.shipping_address ? JSON.parse(order.shipping_address) : null
            };
            
            res.status(201).json({
              order: parsedOrder,
              message: 'Order created successfully. Payment method: Cash on delivery.'
            });
          });
        }
      );
    })
    .catch(error => {
      res.status(400).json({ error: error.message });
    });
});

// Reviews endpoints
app.get('/api/reviews', (req, res) => {
  db.all(
    `SELECT r.*, u.username, u.name as user_name, s.name as service_name, st.name as staff_name
     FROM reviews r
     LEFT JOIN users u ON r.user_id = u.id
     LEFT JOIN services s ON r.service_id = s.id
     LEFT JOIN staff st ON r.staff_id = st.id
     ORDER BY r.created_at DESC`,
    (err, reviews) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch reviews' });
      }
      res.json(reviews);
    }
  );
});

app.post('/api/reviews', authenticateToken, (req, res) => {
  const { rating, comment, service_id, staff_id } = req.body;
  const user_id = req.user.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  // Get user info for the review
  db.get('SELECT username, name FROM users WHERE id = ?', [user_id], (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'Invalid user' });
    }

    db.run(
      'INSERT INTO reviews (user_id, customer_name, rating, comment, service_id, staff_id) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, user.name || user.username, rating, comment, service_id, staff_id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create review' });
        }
        
        db.get(
          `SELECT r.*, u.username, u.name as user_name, s.name as service_name, st.name as staff_name
           FROM reviews r
           LEFT JOIN users u ON r.user_id = u.id
           LEFT JOIN services s ON r.service_id = s.id
           LEFT JOIN staff st ON r.staff_id = st.id
           WHERE r.id = ?`,
          [this.lastID],
          (err, review) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to fetch created review' });
            }
            res.status(201).json(review);
          }
        );
      }
    );
  });
});

// Customers endpoint for compatibility
app.get('/api/customers', authenticateToken, requireAdmin, (req, res) => {
  db.all(
    'SELECT id, username, email, name, created_at FROM users WHERE role = "USER" ORDER BY created_at DESC',
    (err, customers) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch customers' });
      }
      res.json(customers);
    }
  );
});

// Search endpoint
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Search query required' });
  }

  const searchTerm = `%${q}%`;
  
  Promise.all([
    new Promise((resolve, reject) => {
      db.all('SELECT * FROM services WHERE name LIKE ? OR description LIKE ?', [searchTerm, searchTerm], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    }),
    new Promise((resolve, reject) => {
      db.all('SELECT * FROM staff WHERE name LIKE ? OR bio LIKE ?', [searchTerm, searchTerm], (err, results) => {
        if (err) reject(err);
        else resolve(results.map(member => ({
          id: `barber_${member.id}`,
          name: member.name,
          title: member.title,
          bio: member.bio,
          avatar: member.avatar,
          specialties: JSON.parse(member.specialties || '[]'),
          rating: member.rating,
          yearsExperience: member.years_experience,
          featured: Boolean(member.featured),
          workingHours: JSON.parse(member.working_hours || '{}')
        })));
      });
    }),
    new Promise((resolve, reject) => {
      db.all('SELECT * FROM products WHERE name LIKE ? OR description LIKE ?', [searchTerm, searchTerm], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    })
  ])
  .then(([services, barbers, products]) => {
    res.json({ services, barbers, products });
  })
  .catch(error => {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  });
});

// Availability endpoint
app.get('/api/availability', (req, res) => {
  const { date, serviceId, barberId } = req.query;
  
  if (!date || !serviceId) {
    return res.status(400).json({ error: 'Date and serviceId are required' });
  }

  // Generate time slots (9 AM to 7 PM, 30-minute intervals)
  const timeSlots = [];
  for (let hour = 9; hour < 19; hour++) {
    for (let minute of [0, 30]) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(time);
    }
  }

  // Check which slots are already booked
  let query = 'SELECT time FROM appointments WHERE date = ? AND status != "cancelled"';
  let params = [date];

  if (barberId) {
    query += ' AND staff_id = ?';
    params.push(barberId);
  }

  db.all(query, params, (err, bookedSlots) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to check availability' });
    }

    const bookedTimes = bookedSlots.map(slot => slot.time);
    const availableSlots = timeSlots.filter(time => !bookedTimes.includes(time));

    res.json(availableSlots);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
function startServer() {
  initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 BarberCraft API Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📚 Database: ${dbPath}`);
    console.log('');
    console.log('🔐 Demo Credentials:');
    console.log('   Admin: username=admin, password=admin123');
    console.log('   User:  username=demo, password=user123');
    console.log('');
    console.log('📋 Available endpoints:');
    console.log('   GET  /api/health');
    console.log('   POST /api/auth/register');
    console.log('   POST /api/auth/login');
    console.log('   GET  /api/auth/me');
    console.log('   GET  /api/services');
    console.log('   GET  /api/staff');
    console.log('   GET  /api/barbers');
    console.log('   GET  /api/products');
    console.log('   GET  /api/appointments');
    console.log('   POST /api/appointments');
    console.log('   GET  /api/orders');
    console.log('   POST /api/orders/checkout');
    console.log('   GET  /api/reviews');
    console.log('   GET  /api/search');
    console.log('   GET  /api/availability');
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
});

startServer();

module.exports = app;