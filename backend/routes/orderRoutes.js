const express = require('express');
const { createOrder, getAllOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Public route
router.post('/', createOrder);

// Admin routes
router.get('/', adminAuth, getAllOrders);
router.get('/:id', auth, getOrderById);
router.patch('/:id/status', adminAuth, updateOrderStatus);

module.exports = router;
