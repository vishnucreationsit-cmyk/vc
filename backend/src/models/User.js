const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  department: { type: String, default: 'STITCHING' },
  role: { type: String, enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'], default: 'EMPLOYEE' },
  designation: { type: String },
  phone: { type: String },
  dailyRate: { type: Number },
  shiftStartTime: { type: String, default: '09:00' },
  shiftEndTime: { type: String, default: '18:00' },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
