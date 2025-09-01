const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleName: {
    type: String,
    required: true,
    trim: true
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['Truck', 'Van', 'Car', 'Motorcycle', 'Other']
  },
  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 0
  },
  vehicleImages: [{
    type: String,
    required: true
  }],
  driverName: {
    type: String,
    required: true,
    trim: true
  },
  driverContact: {
    type: String,
    required: true,
    trim: true
  },
  driverLicense: {
    type: String,
    required: true,
    trim: true
  },
  driverImage: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
