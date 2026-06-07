import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, KeyRound, UserCheck, UserX, X, UserPlus, AlertTriangle, Mail } from 'lucide-react';

const Employees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState({ show: false, action: '', employee: null });
  
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', department: 'STITCHING',
    shiftStartTime: '09:00', shiftEndTime: '18:00', baseSalary: '',
    username: '', password: '', role: 'EMPLOYEE'
  });

  const [resetPasswordData, setResetPasswordData] = useState({ newPassword: '' });

  useEffect(() => {
    fetchEmployees();
    const interval = setInterval(fetchEmployees, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchEmployees = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await axios.get(import.meta.env.VITE_API_URL + '/api/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const salary = parseFloat(formData.baseSalary || 0);
      const payload = {
        name: formData.name, email: formData.email, phone: formData.phone, department: formData.department,
        shiftStartTime: formData.shiftStartTime + (formData.shiftStartTime.length === 5 ? ':00' : ''),
        shiftEndTime: formData.shiftEndTime + (formData.shiftEndTime.length === 5 ? ':00' : ''),
        employeeId: selectedEmployee ? selectedEmployee.employeeId : 'EMP-' + Math.floor(1000 + Math.random() * 9000),
        dailyRate: salary / 30,
        status: selectedEmployee ? selectedEmployee.status : 'ACTIVE'
      };

      if (selectedEmployee) {
        // Edit Employee
        await axios.put(`${import.meta.env.VITE_API_URL}/api/employees/${selectedEmployee.id}`, payload);
      } else {
        // Create Employee
        const empRes = await axios.post(import.meta.env.VITE_API_URL + '/api/employees', payload);
        // Create Login immediately
        await axios.post(import.meta.env.VITE_API_URL + '/api/auth/register', {
          username: formData.username,
          password: formData.password,
          role: formData.role,
          employeeId: empRes.data.id
        });
      }

      setShowModal(false);
      fetchEmployees(true);
    } catch (error) {
      alert("Error saving employee");
      console.error(error);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post(import.meta.env.VITE_API_URL + '/api/auth/reset-password', {
        userId: selectedEmployee.userId,
        newPassword: resetPasswordData.newPassword
      });
      alert("Password reset successfully!");
      setShowResetModal(false);
    } catch (error) {
      alert("Error resetting password");
    }
  };

  const confirmAction = async () => {
    const { action, employee } = showConfirmModal;
    try {
      if (action === 'REMOVE') {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/employees/${employee.id}`);
      } else if (action === 'ACTIVATE') {
        const payload = { ...employee, status: 'ACTIVE' };
        await axios.put(`${import.meta.env.VITE_API_URL}/api/employees/${employee.id}`, payload);
      }
      setShowConfirmModal({ show: false, action: '', employee: null });
      fetchEmployees(true);
    } catch (err) {
      alert("Failed to perform action");
    }
  };

  const handleSendCredentials = async (employee) => {
    if (!window.confirm(`Are you sure you want to send new login credentials to ${employee.name}'s email?`)) return;
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/employees/${employee.id}/send-credentials`);
      alert(response.data.message || 'Credentials sent successfully!');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        alert("Failed: " + error.response.data.error);
      } else {
        alert("Failed to send credentials.");
      }
    }
  };

  const openModal = (employee = null) => {
    setSelectedEmployee(employee);
    if (employee) {
      setFormData({
        name: employee.name, email: employee.email, phone: employee.phone, department: employee.department,
        shiftStartTime: employee.shiftStartTime.substring(0, 5),
        shiftEndTime: employee.shiftEndTime.substring(0, 5),
        baseSalary: employee.dailyRate ? employee.dailyRate * 30 : '',
      });
    } else {
      setFormData({
        name: '', email: '', phone: '', department: 'STITCHING',
        shiftStartTime: '09:00', shiftEndTime: '18:00', baseSalary: '',
        username: '', password: '', role: 'EMPLOYEE'
      });
    }
    setShowModal(true);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Employee Management</h1>
        {user?.role === 'ADMIN' && (
          <button onClick={() => openModal()} className="bg-leather-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-leather-700 transition-colors">
            <UserPlus size={18} /> Add New Employee
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Employee</th>
                <th className="px-6 py-3 font-medium">Account & Contact</th>
                <th className="px-6 py-3 font-medium">Department</th>
                <th className="px-6 py-3 font-medium">Status</th>
                {user?.role === 'ADMIN' && <th className="px-6 py-3 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading employees...</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No employees found.</td></tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{emp.name}</div>
                      <div className="text-gray-500 text-xs">{emp.employeeId}</div>
                      <div className="text-gray-400 text-xs mt-1">Joined: {new Date(emp.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-leather-700 flex items-center gap-1">
                        {emp.hasAccount ? <><UserCheck size={14}/> {emp.username}</> : <span className="text-gray-400">No Account</span>}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">{emp.email}</div>
                      <div className="text-gray-500 text-xs">{emp.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded text-xs font-semibold">{emp.department}</span>
                      <div className="text-gray-500 text-xs mt-2">
                        {emp.shiftStartTime.substring(0, 5)} - {emp.shiftEndTime.substring(0, 5)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {emp.status === 'ACTIVE' ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold flex items-center gap-1 w-max"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Active</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold flex items-center gap-1 w-max"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span> Inactive</span>
                      )}
                    </td>
                    {user?.role === 'ADMIN' && (
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openModal(emp)} className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors" title="Edit Details">
                            <Edit size={18} />
                          </button>
                          {emp.hasAccount && (
                            <>
                              <button onClick={() => { setSelectedEmployee(emp); setResetPasswordData({newPassword: ''}); setShowResetModal(true); }} className="text-amber-600 hover:bg-amber-50 p-2 rounded transition-colors" title="Reset Password">
                                <KeyRound size={18} />
                              </button>
                              <button onClick={() => handleSendCredentials(emp)} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded transition-colors" title="Send Onboarding Credentials">
                                <Mail size={18} />
                              </button>
                            </>
                          )}
                          {emp.status === 'ACTIVE' ? (
                            <button onClick={() => setShowConfirmModal({show: true, action: 'REMOVE', employee: emp})} className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors" title="Remove Employee">
                              <Trash2 size={18} />
                            </button>
                          ) : (
                            <button onClick={() => setShowConfirmModal({show: true, action: 'ACTIVATE', employee: emp})} className="text-green-600 hover:bg-green-50 p-2 rounded transition-colors" title="Restore Employee">
                              <UserCheck size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">{selectedEmployee ? 'Edit Employee Details' : 'Register New Employee'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-leather-500 outline-none" placeholder="e.g. John Doe" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-leather-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-leather-500 outline-none" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Department</label>
                  <select name="department" value={formData.department} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-leather-500 outline-none bg-white">
                    <option value="STITCHING">Stitching</option>
                    <option value="CUTTING">Cutting</option>
                    <option value="FINISHING">Finishing</option>
                    <option value="PACKAGING">Packaging</option>
                    <option value="MANAGEMENT">Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Shift Start</label>
                  <input type="time" name="shiftStartTime" value={formData.shiftStartTime} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-leather-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Shift End</label>
                  <input type="time" name="shiftEndTime" value={formData.shiftEndTime} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-leather-500 outline-none" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Monthly Salary (₹)</label>
                  <input type="number" step="1000" name="baseSalary" value={formData.baseSalary} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-leather-500 outline-none" />
                </div>
              </div>

              {!selectedEmployee && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Create Login Account</h3>
                  <div className="grid grid-cols-2 gap-5 bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
                      <input type="text" name="username" value={formData.username} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-leather-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                      <input type="text" name="password" value={formData.password} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-leather-500 outline-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-1">System Role</label>
                      <select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-leather-500 outline-none bg-white">
                        <option value="EMPLOYEE">Regular Employee</option>
                        <option value="MANAGER">Manager</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-leather-800 text-white font-bold rounded-xl hover:bg-leather-900 transition-colors shadow-md">
                  {selectedEmployee ? 'Save Changes' : 'Create Employee & Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Reset Password</h2>
              <p className="text-sm text-gray-500 mb-6">Enter a new password for {selectedEmployee?.name}.</p>
              <form onSubmit={handleResetPassword}>
                <input 
                  type="text" required value={resetPasswordData.newPassword} 
                  onChange={(e) => setResetPasswordData({newPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-leather-500 outline-none mb-6" 
                  placeholder="New Password"
                />
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowResetModal(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 shadow-md">Reset Password</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Action Modal */}
      {showConfirmModal.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${showConfirmModal.action === 'REMOVE' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {showConfirmModal.action === 'REMOVE' ? <AlertTriangle size={32} /> : <UserCheck size={32} />}
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {showConfirmModal.action === 'REMOVE' ? 'Remove Employee?' : 'Restore Employee?'}
              </h2>
              <p className="text-gray-500 mb-8">
                {showConfirmModal.action === 'REMOVE' 
                  ? `Are you sure you want to remove ${showConfirmModal.employee?.name}? This will deactivate their account.` 
                  : `Are you sure you want to restore ${showConfirmModal.employee?.name}? This will reactivate their account.`}
              </p>
              <div className="flex justify-center gap-4">
                <button onClick={() => setShowConfirmModal({show: false})} className="px-6 py-2.5 text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
                <button 
                  onClick={confirmAction} 
                  className={`px-6 py-2.5 text-white font-bold rounded-xl shadow-md transition-colors ${showConfirmModal.action === 'REMOVE' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {showConfirmModal.action === 'REMOVE' ? 'Yes, Remove' : 'Yes, Restore'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Employees;
