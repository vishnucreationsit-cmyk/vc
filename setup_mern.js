const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'backend-node');

const dirs = [
  'src/config',
  'src/controllers',
  'src/middleware',
  'src/models',
  'src/routes',
  'src/services',
  'src/utils',
  'src/validators'
];

dirs.forEach(dir => {
  fs.mkdirSync(path.join(baseDir, dir), { recursive: true });
});

const files = {
  'package.json': `{
  "name": "vishnu-creations-backend",
  "version": "1.0.0",
  "description": "MERN Stack Backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.3",
    "nodemailer": "^6.9.7"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}`,
  '.env': `PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/vishnucreations?retryWrites=true&w=majority
JWT_SECRET=vishnu_creations_super_secret_jwt_key_2026
JWT_REFRESH_SECRET=vishnu_creations_super_secret_refresh_key_2026
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
FRONTEND_URL=https://www.vishnucreations.shop
CLIENT_URL=https://www.vishnucreations.shop
COMPANY_LAT=13.0827
COMPANY_LNG=80.2707
GEOFENCE_RADIUS_METERS=500
`,
  'server.js': `require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
  });
});
`,
  'src/app.js': `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();

// Security and Middleware
app.use(helmet());
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
`,
  'src/config/db.js': `const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error(\`Error: \${error.message}\`);
    process.exit(1);
  }
};

module.exports = connectDB;
`,
  'src/models/User.js': `const mongoose = require('mongoose');
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
`,
  'src/models/Attendance.js': `const mongoose = require('mongoose');

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

// Prevent multiple attendance records for same date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
`,
  'src/models/Notification.js': `const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true },
  read: { type: Boolean, default: false },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // null means global/admin
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
`,
  'src/middleware/authMiddleware.js': `const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401);
      next(new Error('Not authorized, token failed'));
    }
  }
  if (!token) {
    res.status(401);
    next(new Error('Not authorized, no token'));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error('Not authorized for this role'));
    }
    next();
  };
};

module.exports = { protect, authorize };
`,
  'src/middleware/errorMiddleware.js': `const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };
`,
  'src/utils/geofence.js': `// Haversine formula to calculate distance between two coordinates in meters
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; 
};

const isWithinGeofence = (lat, lng) => {
  const companyLat = parseFloat(process.env.COMPANY_LAT);
  const companyLng = parseFloat(process.env.COMPANY_LNG);
  const radius = parseFloat(process.env.GEOFENCE_RADIUS_METERS);
  
  const distance = calculateDistance(companyLat, companyLng, lat, lng);
  return { within: distance <= radius, distance };
};

module.exports = { isWithinGeofence, calculateDistance };
`,
  'src/services/emailService.js': `const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    // Configure your email service here
    host: 'smtp.gmail.com', // Example
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: \`"Vishnu Creations" <\${process.env.EMAIL_USER}>\`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
`,
  'src/controllers/authController.js': `const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body; // In this system username might be employeeId or email
    const user = await User.findOne({ $or: [{ employeeId: username }, { email: username }] });

    if (user && (await user.matchPassword(password))) {
      if (user.status !== 'ACTIVE') {
        res.status(403);
        throw new Error('Account is inactive');
      }
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401);
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { login };
`,
  'src/controllers/employeeController.js': `const User = require('../models/User');

const getEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({ role: { $in: ['EMPLOYEE', 'MANAGER'] } }).select('-password');
    res.json(employees);
  } catch (error) {
    next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const { employee, username, password, role } = req.body;
    
    // Normalize payload format depending on what frontend sends
    const empData = employee || req.body;
    const finalRole = role || empData.role || 'EMPLOYEE';
    const finalPassword = password || empData.password || 'Welcome@123';
    
    const userExists = await User.findOne({ $or: [{ email: empData.email }, { employeeId: empData.employeeId }] });
    if (userExists) {
      res.status(400);
      throw new Error('User with this email or employee ID already exists');
    }

    const user = await User.create({
      ...empData,
      role: finalRole,
      password: finalPassword
    });

    if (user) {
      res.status(201).json({
        id: user._id,
        name: user.name,
        employeeId: user.employeeId,
        role: user.role
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      Object.assign(user, req.body);
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updatedUser = await user.save();
      res.json({
        id: updatedUser._id,
        name: updatedUser.name,
        role: updatedUser.role
      });
    } else {
      res.status(404);
      throw new Error('Employee not found');
    }
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.status = 'INACTIVE';
      await user.save();
      res.json({ message: 'Employee marked as inactive' });
    } else {
      res.status(404);
      throw new Error('Employee not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getEmployees, createEmployee, updateEmployee, deleteEmployee };
`,
  'src/controllers/attendanceController.js': `const Attendance = require('../models/Attendance');
const { isWithinGeofence } = require('../utils/geofence');

const checkIn = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    
    const geoCheck = isWithinGeofence(lat, lng);
    if (!geoCheck.within) {
      res.status(403);
      throw new Error(\`You are outside the attendance zone (\${Math.round(geoCheck.distance)}m away)\`);
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
`,
  'src/routes/authRoutes.js': `const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

router.post('/login', login);
router.post('/register', login); // Alias for now if needed

module.exports = router;
`,
  'src/routes/employeeRoutes.js': `const express = require('express');
const router = express.Router();
const { getEmployees, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorize('ADMIN', 'MANAGER'), getEmployees)
  .post(protect, authorize('ADMIN'), createEmployee);

router.route('/:id')
  .put(protect, authorize('ADMIN'), updateEmployee)
  .delete(protect, authorize('ADMIN'), deleteEmployee);

module.exports = router;
`,
  'src/routes/attendanceRoutes.js': `const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getMyAttendance, getAllAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/my', protect, getMyAttendance);
router.get('/', protect, authorize('ADMIN', 'MANAGER'), getAllAttendance);

module.exports = router;
`
};

for (const [filePath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(baseDir, filePath), content);
}

console.log('MERN setup complete in backend-node/');
