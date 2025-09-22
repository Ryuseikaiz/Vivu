const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const checkSubscription = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Check if user can use trial
    if (user.canUseTrial()) {
      return next();
    }
    
    // Check if subscription is active
    if (!user.isSubscriptionActive()) {
      return res.status(403).json({ 
        error: 'Subscription required',
        message: 'Bạn cần đăng ký gói subscription để sử dụng tính năng này.',
        subscriptionStatus: user.subscription.type
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { auth, checkSubscription };