require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../db/db');
const Furniture = require('../models/Furniture');

const furnitureData = [
  {
    name: 'Modern Sofa',
    description: 'A comfortable modern sofa with clean lines and durable fabric.',
    price: 899.99,
    category: 'Sofa',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
    inStock: true
  },
  {
    name: 'Wooden Dining Table',
    description: 'Solid oak dining table that seats 6 people comfortably.',
    price: 649.99,
    category: 'Table',
    imageUrl: 'https://images.unsplash.com/photo-1533090368676-1fd25485db88',
    inStock: true
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'Adjustable office chair with lumbar support and breathable mesh back.',
    price: 249.99,
    category: 'Chair',
    imageUrl: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03',
    inStock: true
  },
  {
    name: 'King Size Bed Frame',
    description: 'Modern platform bed frame with headboard, king size.',
    price: 799.99,
    category: 'Bed',
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85',
    inStock: true
  },
  {
    name: 'Bookshelf with Storage',
    description: '5-tier bookshelf with additional storage cabinets at the bottom.',
    price: 329.99,
    category: 'Bookshelf',
    imageUrl: 'https://images.unsplash.com/photo-1588095952717-d7236ce22035',
    inStock: true
  },
  {
    name: 'Accent Cabinet',
    description: 'Modern accent cabinet with glass doors and internal lighting.',
    price: 429.99,
    category: 'Cabinet',
    imageUrl: 'https://images.unsplash.com/photo-1601760561441-16420502c7e0',
    inStock: true
  }
];

(async () => {
  try {
    await connectDB();

    await Furniture.deleteMany({});
    const inserted = await Furniture.insertMany(furnitureData);

    console.log(`Seeded ${inserted.length} furniture items.`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding furniture failed:', err);
    process.exit(1);
  } finally {
    try {
      await mongoose.connection.close();
    } catch {}
  }
})();
