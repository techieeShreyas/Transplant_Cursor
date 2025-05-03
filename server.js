const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Load environment variables
dotenv.config({ path: './src/config/config.env' });

// Import database connection
const connectDB = require('./src/config/db');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const donorRoutes = require('./src/routes/donorRoutes');
const recipientRoutes = require('./src/routes/recipientRoutes');

// Import models for genesis blocks
const Donor = require('./src/models/Donor');
const Recipient = require('./src/models/Recipient');

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions'
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    }
  })
);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/recipients', recipientRoutes);

// Frontend routes
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  
  res.render('login', { title: 'Login' });
});

app.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  
  res.render('register', { title: 'Register Hospital' });
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  res.render('dashboard', { 
    title: 'Dashboard',
    user: req.session.user
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Server error');
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Create genesis blocks if they don't exist
  try {
    await Donor.createGenesisBlock();
    await Recipient.createGenesisBlock();
    console.log('Genesis blocks verified');
  } catch (error) {
    console.error('Error creating genesis blocks:', error);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
}); 