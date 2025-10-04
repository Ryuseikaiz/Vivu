// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import all the dependencies that server.js uses
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://vivu-travel-agent.vercel.app', 'https://your-domain.vercel.app']
    : ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Import routes
const authRoutes = require('../server/routes/auth');
const blogRoutes = require('../server/routes/blog');
const locationRoutes = require('../server/routes/location');
const paymentRoutes = require('../server/routes/payment');
const promoRoutes = require('../server/routes/promo');
const uploadRoutes = require('../server/routes/upload');
const facebookRoutes = require('../server/routes/facebook');

// Import middleware
const { auth, checkSubscription } = require('../server/middleware/auth');

// Import services
const TravelAgent = require('../server/services/TravelAgent');
const travelAgent = new TravelAgent();

// Rate limiting
const rateLimit = require('express-rate-limit');
const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { error: 'Too many search requests from this IP, please try again later.' }
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/facebook', facebookRoutes);

// Travel search route (copied from server.js)
const { v4: uuidv4 } = require('uuid');
const sessions = new Map();

app.post('/api/travel/search', searchLimiter, auth, checkSubscription, async (req, res) => {
  try {
    console.log('🔍 Travel search request received');
    console.log('User:', req.user?.email);
    console.log('Query:', req.body.query);
    console.log('Metadata:', req.body.metadata);

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

    console.log('📤 Returning response of', travelInfo.length, 'characters');

    res.json({
      travelInfo,
      threadId,
      usage: {
        searchCount: user.usage.searchCount,
        trialUsed: user.usage.trialUsed,
        subscriptionActive: user.isSubscriptionActive
      }
    });
  } catch (error) {
    console.error('Error processing travel query:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email route (copied from server.js)
const EmailService = require('../server/services/EmailService');
const emailService = new EmailService();

app.post('/api/travel/send-email', auth, async (req, res) => {
  try {
    const { travelInfo, threadId } = req.body;
    const user = req.user;
    
    if (!travelInfo || !user.email) {
      return res.status(400).json({ error: 'Travel info and email are required' });
    }
    
    await emailService.sendTravelPlan(user.email, user.name, travelInfo);
    
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = app;