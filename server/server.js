const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Stricter rate limiting for travel search
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 search requests per minute
  message: 'Too many search requests, please try again later.'
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-travel-agent', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.log('Continuing without MongoDB - some features may not work');
});

// Import services
const TravelAgent = require('./services/TravelAgent');
const EmailService = require('./services/EmailService');

// Import middleware
const { auth, checkSubscription } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const locationRoutes = require('./routes/location');
const blogRoutes = require('./routes/blog');

// Initialize services
const travelAgent = new TravelAgent();
const emailService = new EmailService();

// Store for session data (in production, use Redis or database)
const sessions = new Map();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/blog', blogRoutes);

// Protected travel routes
app.post('/api/travel/search', searchLimiter, auth, checkSubscription, async (req, res) => {
  try {
    const { query, metadata = {} } = req.body;
    const user = req.user;
    
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const threadId = uuidv4();
    
    // Use trial if available
    if (user.canUseTrial()) {
      user.useTrial();
      await user.save();
    } else {
      // Update usage count for subscribed users
      user.usage.searchCount += 1;
      user.usage.lastSearchDate = new Date();
      await user.save();
    }
    
    // Process travel query using AI agent
    const travelInfo = await travelAgent.processQuery(query, threadId, metadata);
    
    // Store session data
    sessions.set(threadId, {
      query,
      metadata,
      travelInfo,
      timestamp: new Date(),
      userId: user._id
    });

    res.json({
      travelInfo,
      threadId,
      usage: {
        searchCount: user.usage.searchCount,
        trialUsed: user.usage.trialUsed,
        subscriptionActive: user.isSubscriptionActive()
      }
    });
  } catch (error) {
    console.error('Error processing travel query:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/travel/send-email', auth, async (req, res) => {
  try {
    const { senderEmail, receiverEmail, subject, threadId } = req.body;
    
    if (!senderEmail || !receiverEmail || !subject || !threadId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Get session data
    const sessionData = sessions.get(threadId);
    if (!sessionData) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Verify session belongs to user
    if (sessionData.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Send email
    await emailService.sendTravelEmail({
      from: senderEmail,
      to: receiverEmail,
      subject,
      travelInfo: sessionData.travelInfo
    });

    // Clean up session
    sessions.delete(threadId);

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Clean up old sessions (run every hour)
setInterval(() => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  for (const [threadId, session] of sessions.entries()) {
    if (session.timestamp < oneHourAgo) {
      sessions.delete(threadId);
    }
  }
}, 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});