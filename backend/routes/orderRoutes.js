const express = require('express');
const { createOrder, getAllOrders, getOrderById, updateOrderStatus, cancelOrder, getOrdersByEmail } = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Public route
router.post('/', createOrder);

// User/Auth routes
router.get('/user/:email', auth, getOrdersByEmail);
router.get('/:id', auth, getOrderById);
router.post('/:id/cancel', cancelOrder);

// Admin routes
router.get('/', adminAuth, getAllOrders);
router.patch('/:id/status', adminAuth, updateOrderStatus);

module.exports = router;
