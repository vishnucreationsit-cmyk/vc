const User = require('../models/User');

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
