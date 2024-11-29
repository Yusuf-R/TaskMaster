const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/health', (req, res) => {
  const status = {
    server: '🟢 Operational',
    database: mongoose.connection.readyState === 1 ? '🟢 Connected' : '🔴 Disconnected',
    timestamp: new Date(),
    uptime: `${Math.floor(process.uptime())} seconds`
  };
  res.json(status);
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
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : '🔧 Internal Server Error'
  });
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

// Start server
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
