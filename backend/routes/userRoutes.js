const express = require('express');
const { register, login, getProfile, seedAdmin } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/seed-admin', seedAdmin);

// Protected route
router.get('/profile', auth, getProfile);

module.exports = router;
