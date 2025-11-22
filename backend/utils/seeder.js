const mongoose = require('mongoose');
const Product = require('../models/productModel');
const path = require('path');
const products = require('../data/products.json');
require('dotenv').config({ path: path.join(__dirname, '../config/config.env') });

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    
    const mode = process.env.MONGO_DEFAULT_MODE || 'standalone';
    const dbUri = mode === 'replica' ? process.env.MONGO_URI_REPLICA : process.env.MONGO_URI_STANDALONE;

    if (!dbUri) {
      throw new Error(`MONGO_URI_${mode.toUpperCase()} is not defined in backend/config/config.env`);
    }

    console.log(`🔗 Connecting to database: ${dbUri}`);
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Database connected for seeding.');
    
    console.log('🗑️  Clearing existing products...');
    await Product.deleteMany({});
    
    console.log('📦 Inserting sample products...');
    const insertedProducts = await Product.insertMany(products);
    
    console.log(`✅ Successfully seeded ${insertedProducts.length} products!`);
    
    // Verify the data
    const count = await Product.countDocuments();
    console.log(`📊 Total products in database: ${count}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    // Disconnect from the database
    await mongoose.disconnect();
    console.log('👋 Disconnected from database. Seeding complete.');
    process.exit(0);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
