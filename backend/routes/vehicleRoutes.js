const express = require('express');
const { 
  getAllVehicles, 
  getVehicleById, 
  createVehicle, 
  updateVehicle, 
  deleteVehicle,
  toggleVehicleAvailability
} = require('../controllers/vehicleController');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);

// Admin routes
router.post('/', adminAuth, createVehicle);
router.put('/:id', adminAuth, updateVehicle);
router.delete('/:id', adminAuth, deleteVehicle);
router.patch('/:id/toggle-availability', adminAuth, toggleVehicleAvailability);

module.exports = router;
