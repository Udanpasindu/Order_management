const Order = require('../models/Order');
const Furniture = require('../models/Furniture');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { customer, items } = req.body;
    
    // Calculate total amount and verify items exist
    let totalAmount = 0;
    const processedItems = [];
    
    for (const item of items) {
      const furniture = await Furniture.findById(item.furniture);
      
      if (!furniture) {
        return res.status(404).json({ 
          message: `Furniture item with ID ${item.furniture} not found` 
        });
      }
      
      if (!furniture.inStock) {
        return res.status(400).json({ 
          message: `${furniture.name} is currently out of stock` 
        });
      }
      
      const itemTotal = furniture.price * item.quantity;
      totalAmount += itemTotal;
      
      processedItems.push({
        furniture: item.furniture,
        quantity: item.quantity,
        price: furniture.price
      });
    }
    
    const newOrder = new Order({
      customer,
      items: processedItems,
      totalAmount,
      status: 'Pending'
    });
    
    const savedOrder = await newOrder.save();
    
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Invalid order data', error: error.message });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('items.furniture').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.furniture');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('items.furniture');
    
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Invalid order data', error: error.message });
  }
};
