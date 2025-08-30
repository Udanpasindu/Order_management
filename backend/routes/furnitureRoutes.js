const express = require('express');
const { getAllFurniture, getFurnitureById, createFurniture, updateFurniture, deleteFurniture, seedFurniture } = require('../controllers/furnitureController');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllFurniture);
router.get('/:id', getFurnitureById);

// Admin routes
router.post('/', adminAuth, createFurniture);
router.put('/:id', adminAuth, updateFurniture);
router.delete('/:id', adminAuth, deleteFurniture);
router.post('/seed', adminAuth, seedFurniture);

module.exports = router;
