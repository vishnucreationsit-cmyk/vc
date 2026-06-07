const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

router.post('/login', login);
router.post('/register', login); // Alias for now if needed

module.exports = router;
