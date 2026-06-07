const express = require('express');
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
