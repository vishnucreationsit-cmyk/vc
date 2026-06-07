const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getMyAttendance, getAllAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/my', protect, getMyAttendance);
router.get('/', protect, authorize('ADMIN', 'MANAGER'), getAllAttendance);

module.exports = router;
