const express = require('express');
const { 
  createOrder, 
  getAllOrders, 
  getOrderById, 
  updateOrderStatus, 
  cancelOrder, 
  getOrdersByEmail, 
  assignVehicle,
  unassignVehicle,
  generateOrdersReport,
  searchOrders
} = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Public route
router.post('/', createOrder);

// Search and report routes - must be before /:id routes to avoid conflicts
router.get('/search', auth, adminAuth, searchOrders);
router.get('/report', adminAuth, generateOrdersReport);

// User/Auth routes
router.get('/user/:email', auth, getOrdersByEmail);
router.get('/:id', auth, getOrderById);
router.post('/:id/cancel', cancelOrder);

// Admin routes
router.get('/', adminAuth, getAllOrders);
router.patch('/:id/status', adminAuth, updateOrderStatus);
router.patch('/:id/assign-vehicle', adminAuth, assignVehicle);
router.delete('/:id/unassign-vehicle', adminAuth, unassignVehicle);

module.exports = router;
