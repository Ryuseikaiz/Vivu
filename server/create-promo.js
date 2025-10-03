require('dotenv').config();
const mongoose = require('mongoose');
const PromoCode = require('./models/PromoCode');
const User = require('./models/User');

async function createPromoCode() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find or create a system admin user
    let adminUser = await User.findOne({ email: 'admin@vivu.com' });
    
    if (!adminUser) {
      console.log('Creating system admin user...');
      adminUser = new User({
        email: 'admin@vivu.com',
        name: 'System Admin',
        role: 'admin',
        googleId: 'system-admin' // bypass password requirement
      });
      await adminUser.save();
      console.log('✅ System admin user created');
    } else {
      console.log('Found existing admin user');
    }

    // Check if promo code already exists
    const existingPromo = await PromoCode.findOne({ code: 'VIVUVUVI' });
    if (existingPromo) {
      console.log('⚠️  Promo code VIVUVUVI already exists!');
      console.log('Code:', existingPromo.code);
      console.log('Type:', existingPromo.type);
      console.log('Duration:', existingPromo.duration, 'months');
      console.log('Max Uses:', existingPromo.maxUses || 'Unlimited');
      console.log('Used Count:', existingPromo.usedCount);
      console.log('Active:', existingPromo.isActive);
      await mongoose.connection.close();
      return;
    }

    // Create lifetime promo code
    const promoCode = new PromoCode({
      code: 'VIVUVUVI',
      type: 'lifetime',
      duration: 999, // months
      maxUses: null, // unlimited uses
      expiresAt: null, // never expires
      usedBy: [],
      isActive: true,
      createdBy: adminUser._id
    });

    await promoCode.save();
    console.log('✅ Promo code created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Code:', promoCode.code);
    console.log('🎁 Type:', promoCode.type);
    console.log('⏱️  Duration:', promoCode.duration, 'months (LIFETIME)');
    console.log('👥 Max Uses:', promoCode.maxUses || '♾️  Unlimited');
    console.log('📅 Expires:', promoCode.expiresAt || 'Never');
    console.log('✨ Status:', promoCode.isActive ? 'Active' : 'Inactive');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('❌ Error creating promo code:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createPromoCode();
