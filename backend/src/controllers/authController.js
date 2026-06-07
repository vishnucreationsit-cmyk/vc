const User = require('../models/User');
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
        username: user.name,
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
