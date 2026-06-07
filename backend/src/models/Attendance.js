const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  checkIn: { type: Date },
  checkOut: { type: Date },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'], default: 'PRESENT' }
}, { timestamps: true });

attendanceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

// Prevent multiple attendance records for same date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
