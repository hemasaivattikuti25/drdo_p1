const mongoose = require('mongoose');
const Product = require('../models/Product');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/config.env') });

const sampleProducts = [
  {
    name: 'Laptop Pro',
    price: 1299.99,
    description: 'High-performance laptop for professionals and creatives.',
    category: 'Electronics',
    stock: 15,
    image: '/images/laptop.jpg'
  },
  {
    name: 'Smartphone X',
    price: 799.99,
    description: 'Latest generation smartphone with a stunning display and powerful camera.',
    category: 'Electronics', 
    stock: 25,
    image: '/images/smartphone.jpg'
  },
  {
    name: 'Classic Cotton T-Shirt',
    price: 24.99,
    description: 'A comfortable and stylish 100% cotton t-shirt.',
    category: 'Clothing',
    stock: 50,
    image: '/images/tshirt.jpg'
  },
  {
    name: 'Running Shoes',
    price: 89.99,
    description: 'Lightweight and durable running shoes for all terrains.',
    category: 'Sports',
    stock: 30,
    image: '/images/shoes.jpg'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    
    const dbUri = process.env.MONGO_URI_STANDALONE;

    if (!dbUri) {
      throw new Error('MONGO_URI_STANDALONE is not defined in backend/config/config.env');
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
    const insertedProducts = await Product.insertMany(sampleProducts);
    
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

module.exports = { sampleProducts, seedDatabase };
