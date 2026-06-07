const Attendance = require('../models/Attendance');
const { isWithinGeofence } = require('../utils/geofence');

const checkIn = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    
    const geoCheck = isWithinGeofence(lat, lng);
    if (!geoCheck.within) {
      res.status(403);
      throw new Error(`You are outside the attendance zone (${Math.round(geoCheck.distance)}m away)`);
    }

    const date = new Date().toISOString().split('T')[0];
    
    const existing = await Attendance.findOne({ employee: req.user._id, date });
    if (existing) {
      res.status(400);
      throw new Error('Already checked in today');
    }

    const attendance = await Attendance.create({
      employee: req.user._id,
      employeeId: req.user.employeeId,
      date,
      checkIn: new Date(),
      location: { lat, lng }
    });

    res.status(201).json(attendance);
  } catch (error) {
    next(error);
  }
};

const checkOut = async (req, res, next) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ employee: req.user._id, date });
    
    if (!attendance) {
      res.status(404);
      throw new Error('No check-in record found for today');
    }

    attendance.checkOut = new Date();
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

const getMyAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({ employee: req.user._id }).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    next(error);
  }
};

const getAllAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find().populate('employee', 'name department').sort({ date: -1 });
    res.json(records);
  } catch (error) {
    next(error);
  }
};

module.exports = { checkIn, checkOut, getMyAttendance, getAllAttendance };
