const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getMyAttendance, getAllAttendance, getGeofenceConfig, updateGeofenceConfig } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/geofence/config', getGeofenceConfig);
router.post('/geofence/config', protect, authorize('ADMIN', 'MANAGER'), updateGeofenceConfig);
router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/my', protect, getMyAttendance);
router.get('/', protect, authorize('ADMIN', 'MANAGER'), getAllAttendance);

module.exports = router;
