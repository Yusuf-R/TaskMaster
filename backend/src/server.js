const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Security middleware
app.use(helmet()); // Adds various HTTP headers for security

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // default 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // default 100 requests per windowMs
  message: {
    status: 429,
    message: '❌ Too many requests, please try again later.'
  }
});

// Apply rate limiting to all routes
app.use(limiter);

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL.split(',') // Support multiple origins
    : ['http://localhost:5500', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Trust proxy - needed for secure cookies in production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Welcome route
app.get('/', (req, res) => {
  res.json({ 
    message: '👋 Welcome to TaskMaster API',
    status: '✨ Server is running',
    docs: '📚 Visit /api-docs for documentation',
    health: '💓 Check /health for server status'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
    status: 500 
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', status: 404 });
});

// Database connection with retry mechanism
const connectDB = async (retryCount = 5) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Database Status: Connected successfully');
    console.log(`🗄️  Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ Database Connection Error:', error.message);
    
    if (retryCount > 0) {
      console.log(`🔄 Retrying connection... (${retryCount} attempts remaining)`);
      setTimeout(() => connectDB(retryCount - 1), 5000);
    } else {
      console.error('❌ Failed to connect to database after multiple attempts');
      process.exit(1);
    }
  }
};

// Monitor database connection
mongoose.connection.on('connected', () => {
  console.log('🌟 Database connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Database Error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Database disconnected');
});

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during database disconnection:', err.message);
    process.exit(1);
  }
});

// Initialize database connection
connectDB();

// Export for Vercel
module.exports = app;

// Start server if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`
🚀 Server Status: Online
🌍 Environment: ${process.env.NODE_ENV}
🔗 URL: http://localhost:${PORT}
📝 API Documentation: http://localhost:${PORT}/api-docs
❤️  Health Check: http://localhost:${PORT}/health
    `);
  });
}
