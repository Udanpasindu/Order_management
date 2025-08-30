const Furniture = require('../models/Furniture');

// Get all furniture items
exports.getAllFurniture = async (req, res) => {
  try {
    const furniture = await Furniture.find();
    res.json(furniture);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single furniture item
exports.getFurnitureById = async (req, res) => {
  try {
    const furniture = await Furniture.findById(req.params.id);
    if (!furniture) {
      return res.status(404).json({ message: 'Furniture not found' });
    }
    res.json(furniture);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new furniture item (admin only)
exports.createFurniture = async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, inStock } = req.body;
    
    const newFurniture = new Furniture({
      name,
      description,
      price,
      category,
      imageUrl,
      inStock: inStock !== undefined ? inStock : true
    });
    
    const savedFurniture = await newFurniture.save();
    res.status(201).json(savedFurniture);
  } catch (error) {
    res.status(400).json({ message: 'Invalid furniture data', error: error.message });
  }
};

// Update a furniture item (admin only)
exports.updateFurniture = async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, inStock } = req.body;
    
    const updatedFurniture = await Furniture.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        category,
        imageUrl,
        inStock
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedFurniture) {
      return res.status(404).json({ message: 'Furniture not found' });
    }
    
    res.json(updatedFurniture);
  } catch (error) {
    res.status(400).json({ message: 'Invalid furniture data', error: error.message });
  }
};

// Delete a furniture item (admin only)
exports.deleteFurniture = async (req, res) => {
  try {
    const furniture = await Furniture.findByIdAndDelete(req.params.id);
    
    if (!furniture) {
      return res.status(404).json({ message: 'Furniture not found' });
    }
    
    res.json({ message: 'Furniture deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Seed initial furniture data
exports.seedFurniture = async (req, res) => {
  try {
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

    await Furniture.deleteMany({});
    const seeded = await Furniture.insertMany(furnitureData);
    
    res.status(201).json({ message: `Successfully seeded ${seeded.length} furniture items` });
  } catch (error) {
    res.status(500).json({ message: 'Seeding failed', error: error.message });
  }
};
