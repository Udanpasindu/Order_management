const Vehicle = require('../models/Vehicle');

// Get all vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single vehicle
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new vehicle (admin only)
exports.createVehicle = async (req, res) => {
  try {
    const { 
      vehicleName, 
      vehicleType, 
      vehicleNumber, 
      capacity,
      vehicleImages,
      driverName,
      driverContact,
      driverLicense,
      driverImage,
      isAvailable
    } = req.body;
    
    const newVehicle = new Vehicle({
      vehicleName, 
      vehicleType, 
      vehicleNumber, 
      capacity,
      vehicleImages,
      driverName,
      driverContact,
      driverLicense,
      driverImage,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });
    
    const savedVehicle = await newVehicle.save();
    res.status(201).json(savedVehicle);
  } catch (error) {
    res.status(400).json({ message: 'Invalid vehicle data', error: error.message });
  }
};

// Update a vehicle (admin only)
exports.updateVehicle = async (req, res) => {
  try {
    const { 
      vehicleName, 
      vehicleType, 
      vehicleNumber, 
      capacity,
      vehicleImages,
      driverName,
      driverContact,
      driverLicense,
      driverImage,
      isAvailable
    } = req.body;
    
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      {
        vehicleName, 
        vehicleType, 
        vehicleNumber, 
        capacity,
        vehicleImages,
        driverName,
        driverContact,
        driverLicense,
        driverImage,
        isAvailable
      },
      { new: true }
    );
    
    if (!updatedVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.json(updatedVehicle);
  } catch (error) {
    res.status(400).json({ message: 'Invalid vehicle data', error: error.message });
  }
};

// Delete a vehicle (admin only)
exports.deleteVehicle = async (req, res) => {
  try {
    const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.id);
    
    if (!deletedVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle vehicle availability (admin only)
exports.toggleVehicleAvailability = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    vehicle.isAvailable = !vehicle.isAvailable;
    await vehicle.save();
    
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
