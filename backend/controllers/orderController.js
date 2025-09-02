const Order = require('../models/Order');
const Furniture = require('../models/Furniture');
const Vehicle = require('../models/Vehicle');
const PDFDocument = require('pdfkit');
const fs = require('fs');

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
    const orders = await Order.find()
      .populate('items.furniture')
      .populate('vehicle')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.furniture')
      .populate('vehicle');
    
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
    
    // Get the order before update to check if it has a vehicle assigned
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // If order is being cancelled and has a vehicle, make the vehicle available again
    if (status === 'Cancelled' && order.vehicle) {
      await Vehicle.findByIdAndUpdate(
        order.vehicle,
        { isAvailable: true }
      );
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
    .populate('items.furniture')
    .populate('vehicle');
    
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

    // Check if order is older than 3 days
    const orderDate = new Date(order.createdAt);
    const currentDate = new Date();
    const differenceInTime = currentDate.getTime() - orderDate.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    
    if (differenceInDays > 3) {
      return res.status(400).json({ message: 'Orders cannot be cancelled after three days of placement' });
    }

    // If order has a vehicle, make the vehicle available again
    if (order.vehicle) {
      await Vehicle.findByIdAndUpdate(
        order.vehicle,
        { isAvailable: true }
      );
    }

    order.status = 'Cancelled';
    const saved = await order.save();

    const populated = await saved.populate(['items.furniture', 'vehicle']);
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
    .populate('vehicle')
    .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Assign vehicle to order (admin only)
exports.assignVehicle = async (req, res) => {
  try {
    const { vehicleId, deliveryNotes } = req.body;
    
    if (!vehicleId) {
      return res.status(400).json({ message: 'Vehicle ID is required' });
    }
    
    // Check if vehicle exists and is available
    const vehicle = await Vehicle.findById(vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    if (!vehicle.isAvailable) {
      return res.status(400).json({ message: 'This vehicle is not available' });
    }
    
    // Find the order and check if it already has a vehicle
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // If order already has a vehicle assigned, make that one available again
    if (order.vehicle) {
      await Vehicle.findByIdAndUpdate(
        order.vehicle,
        { isAvailable: true }
      );
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        vehicle: vehicleId,
        deliveryNotes: deliveryNotes || ''
      },
      { new: true, runValidators: true }
    )
    .populate('items.furniture')
    .populate('vehicle');
    
    // Mark vehicle as unavailable when assigned to an order
    vehicle.isAvailable = false;
    await vehicle.save();
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

// Unassign vehicle from order (admin only)
exports.unassignVehicle = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // If order has no vehicle assigned, return error
    if (!order.vehicle) {
      return res.status(400).json({ message: 'No vehicle assigned to this order' });
    }
    
    // Make the vehicle available again
    await Vehicle.findByIdAndUpdate(
      order.vehicle,
      { isAvailable: true }
    );
    
    // Remove vehicle from order
    order.vehicle = null;
    order.deliveryNotes = '';
    await order.save();
    
    const updatedOrder = await Order.findById(req.params.id)
      .populate('items.furniture')
      .populate('vehicle');
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Failed to unassign vehicle', error: error.message });
  }
};

// Generate PDF report of orders
exports.generateOrdersReport = async (req, res) => {
  const doc = new PDFDocument();
  
  try {
    const { query } = req.query;
    let orders;
    
    // Handle errors in the response stream
    doc.on('error', (err) => {
      console.error('Error in PDF generation:', err);
      // Only send error if headers haven't been sent
      if (!res.headersSent) {
        res.status(500).json({ message: 'PDF generation failed', error: err.message });
      }
    });

    // Set response headers before any potential errors
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=orders-report-${Date.now()}.pdf`);
    
    // Pipe the PDF to the response with error handling
    doc.pipe(res);
    
    // Get orders (with error handling)
    try {
      if (query?.trim()) {
        const queryConditions = [
          { 'customer.email': { $regex: query, $options: 'i' } },
          { 'customer.name': { $regex: query, $options: 'i' } },
          { 'customer.phone': { $regex: query, $options: 'i' } }
        ];
        
        // Add ID search if query looks like an ObjectId
        if (/^[0-9a-fA-F]{24}$/.test(query)) {
          queryConditions.unshift({ _id: query });
        }
        
        orders = await Order.find({ $or: queryConditions })
          .populate('items.furniture')
          .populate('vehicle')
          .sort({ createdAt: -1 });
      } else {
        orders = await Order.find()
          .populate('items.furniture')
          .populate('vehicle')
          .sort({ createdAt: -1 });
      }
    } catch (err) {
      throw new Error(`Failed to fetch orders: ${err.message}`);
    }

    // Generate PDF content
    doc.fontSize(20).text('Orders Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Add summary section
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    doc.fontSize(12)
      .text(`Total Orders: ${orders.length}`)
      .moveDown()
      .text('Status Summary:')
      .text(Object.entries(statusCounts)
        .map(([status, count]) => `${status}: ${count}`)
        .join('    '))
      .moveDown()
      .text(`Total Revenue: $${totalAmount.toFixed(2)}`)
      .moveDown(2);

    // Add orders detail section
    if (orders.length > 0) {
      doc.fontSize(14).text('Order Details', { underline: true }).moveDown();

      orders.forEach((order, index) => {
        // Order details will be added below
      });
    }
    
    doc.moveDown();
    doc.text(`Status Summary:`, { continued: true }).text(`  Pending: ${statusCounts.Pending}`, { continued: true })
      .text(`  Processing: ${statusCounts.Processing}`, { continued: true })
      .text(`  Shipped: ${statusCounts.Shipped}`, { continued: true })
      .text(`  Delivered: ${statusCounts.Delivered}`, { continued: true })
      .text(`  Cancelled: ${statusCounts.Cancelled}`);
    
    doc.moveDown();
    doc.text(`Total Revenue: $${totalAmount.toFixed(2)}`);
    
    doc.moveDown();
    doc.moveDown();
    
    // Add orders table
    if (orders.length > 0) {
      // Add orders to the report
      doc.fontSize(14).text('Order Details', {
        underline: true
      });
      doc.moveDown();
      
      orders.forEach((order, index) => {
        // Add a page break every 3 orders to avoid overflow
        if (index > 0 && index % 3 === 0) {
          doc.addPage();
        }
        
        doc.fontSize(12).text(`Order ID: ${order._id}`, {
          underline: true
        });
        
        doc.fontSize(10).text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
        doc.text(`Customer: ${order.customer.name} (${order.customer.email})`);
        doc.text(`Status: ${order.status}`);
        doc.text(`Total Amount: $${order.totalAmount.toFixed(2)}`);
        
        // List items
        doc.moveDown(0.5);
        doc.text('Items:', { underline: true });
        
        order.items.forEach(item => {
          const furnitureName = item.furniture ? item.furniture.name : 'Unknown Item';
          doc.text(`- ${furnitureName} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`);
        });
        
        // Add delivery details if available
        if (order.vehicle) {
          doc.moveDown(0.5);
          doc.text('Delivery Vehicle:', { underline: true });
          doc.text(`${order.vehicle.vehicleName} (${order.vehicle.vehicleNumber})`);
          doc.text(`Driver: ${order.vehicle.driverName}, Contact: ${order.vehicle.driverContact}`);
        }
        
        // Add separator between orders
        if (index < orders.length - 1) {
          doc.moveDown();
          doc.strokeColor('#aaaaaa').lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
          doc.moveDown();
        }
      });
    } else {
      doc.fontSize(12).text('No orders found matching the criteria.');
    }
    
    // End the document
    doc.end();
    
  } catch (error) {
    console.error('Error generating PDF report:', error);
    res.status(500).json({ 
      message: 'Failed to generate orders report', 
      error: error.message 
    });
  }
};

// Search orders by ID or customer email (admin only)
exports.searchOrders = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.json([]);
    }
    
    let orders = [];
    
    // Check if query could be an ObjectId (24 hex characters)
    if (/^[0-9a-fA-F]{24}$/.test(query)) {
      try {
        // Search by order ID
        const orderById = await Order.findById(query)
          .populate('items.furniture')
          .populate('vehicle');
        
        if (orderById) {
          orders = [orderById];
        }
      } catch (err) {
        // Invalid ObjectId format or not found - continue to other search methods
        console.log('Not a valid ObjectId or order not found, continuing to other search methods');
      }
    }
    
    // If no orders found by ID, search by customer email (partial match)
    if (orders.length === 0) {
      orders = await Order.find({
        'customer.email': { $regex: query, $options: 'i' }
      })
        .populate('items.furniture')
        .populate('vehicle')
        .limit(50) // Limit results for performance
        .sort({ createdAt: -1 });
    }
    
    // If still no orders, try to search by customer name
    if (orders.length === 0) {
      orders = await Order.find({
        'customer.name': { $regex: query, $options: 'i' }
      })
        .populate('items.furniture')
        .populate('vehicle')
        .limit(50) // Limit results for performance
        .sort({ createdAt: -1 });
    }
    
    // If still no results, try searching by phone number
    if (orders.length === 0) {
      orders = await Order.find({
        'customer.phone': { $regex: query, $options: 'i' }
      })
        .populate('items.furniture')
        .populate('vehicle')
        .limit(50)
        .sort({ createdAt: -1 });
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error during search', error: error.message });
  }
};
