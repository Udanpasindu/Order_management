const express = require('express');
const router = express.Router();
const { list, create } = require('../controllers/departmentController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, list);
router.post('/', auth, create);

module.exports = router;
