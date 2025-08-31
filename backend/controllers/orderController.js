const Order = require('../models/Order');
const Furniture = require('../models/Furniture');

// Create a new order (supports partial/selected checkout)
exports.createOrder = async (req, res) => {
  try {
    const { customer } = req.body;
    // Accept either `items` or `selectedItems` in payload
    let rawItems = Array.isArray(req.body.items)
      ? req.body.items
      : Array.isArray(req.body.selectedItems)
        ? req.body.selectedItems
        : [];

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return res.status(400).json({ message: 'No items provided for checkout' });
    }
    
    // Calculate total amount and verify items exist
    let totalAmount = 0;
    const processedItems = [];
    
    for (const item of rawItems) {
      const furnitureId = item.furniture || item._id || item.id; // allow flexible client shapes
      const quantity = Number(item.quantity) || 0;

      if (!furnitureId) {
        return res.status(400).json({ message: 'Each item must include a furniture id' });
      }

      if (!Number.isFinite(quantity) || quantity < 1) {
        return res.status(400).json({ message: 'Each item must include a valid quantity >= 1' });
      }

      const furniture = await Furniture.findById(furnitureId);
      
      if (!furniture) {
        return res.status(404).json({ 
          message: `Furniture item with ID ${furnitureId} not found` 
        });
      }
      
      if (!furniture.inStock) {
        return res.status(400).json({ 
          message: `${furniture.name} is currently out of stock` 
        });
      }
      
      const itemTotal = furniture.price * quantity;
      totalAmount += itemTotal;
      
      processedItems.push({
        furniture: furnitureId,
        quantity,
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

// Cancel an order (public, verifies by customer email)
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ message: 'Email is required to cancel an order' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify email matches the customer email on the order
    if ((order.customer?.email || '').toLowerCase() !== String(email).toLowerCase()) {
      return res.status(403).json({ message: 'Email does not match this order' });
    }

    // Only allow cancel if not already finalized
    if (['Shipped', 'Delivered', 'Cancelled'].includes(order.status)) {
      return res.status(400).json({ message: `Order cannot be cancelled when status is ${order.status}` });
    }

    order.status = 'Cancelled';
    const saved = await order.save();

    const populated = await saved.populate('items.furniture');
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to cancel order', error: error.message });
  }
};

// Get orders by customer email
exports.getOrdersByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find all orders with matching customer email (case insensitive)
    const orders = await Order.find({
      'customer.email': { $regex: new RegExp('^' + email + '$', 'i') }
    })
    .populate('items.furniture')
    .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
