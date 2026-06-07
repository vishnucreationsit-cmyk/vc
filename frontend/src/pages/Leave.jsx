import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, CheckCircle, XCircle, Clock, FileText, Activity } from 'lucide-react';

const Leave = () => {
  const { user } = useAuth();
  
  // State
  const [activeTab, setActiveTab] = useState(user?.role === 'ADMIN' ? 'admin-portal' : 'my-leaves');
  const [myLeaves, setMyLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form State
  const [formData, setFormData] = useState({
    leaveType: 'CASUAL',
    fromDate: '',
    toDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => {
      fetchData(true);
    }, 2000);
    return () => clearInterval(intervalId);
  }, [user, activeTab]);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      if (activeTab === 'my-leaves' || activeTab === 'apply') {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/leave/my-requests?employeeId=${user.employeeId}`);
        setMyLeaves(res.data);
      } else if (activeTab === 'admin-portal' && (user.role === 'ADMIN' || user.role === 'MANAGER')) {
        const res = await axios.get(import.meta.env.VITE_API_URL + '/api/leave/all');
        // Sort newest first
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAllLeaves(sorted);
      }
    } catch (err) {
      console.error("Error fetching leaves", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setMessage({ type: '', text: '' });
      await axios.post(import.meta.env.VITE_API_URL + '/api/leave/apply', {
        ...formData,
        employeeId: parseInt(user.employeeId)
      });
      setMessage({ type: 'success', text: 'Leave request submitted successfully!' });
      setFormData({ leaveType: 'CASUAL', fromDate: '', toDate: '', reason: '' });
      setActiveTab('my-leaves');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to submit leave request' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      setActionLoading(true);
      await axios.put(`${import.meta.env.VITE_API_URL}/api/leave/${action}/${id}?managerId=${user?.employeeId || ''}`);
      fetchData();
    } catch (err) {
      console.error(`Failed to ${action} leave`, err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'APPROVED': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1 w-max"><CheckCircle size={12}/> Approved</span>;
      case 'REJECTED': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1 w-max"><XCircle size={12}/> Rejected</span>;
      case 'PENDING': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1 w-max"><Clock size={12}/> Pending</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium w-max">{status}</span>;
    }
  };

  // Admin Stats
  const totalPending = allLeaves.filter(l => l.status === 'PENDING').length;
  const totalApproved = allLeaves.filter(l => l.status === 'APPROVED').length;
  const totalRejected = allLeaves.filter(l => l.status === 'REJECTED').length;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
          <p className="text-gray-500">Manage time off requests</p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <button
              onClick={() => setActiveTab('admin-portal')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'admin-portal' ? 'border-leather-600 text-leather-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Admin Portal
            </button>
          )}
          {(user?.role === 'EMPLOYEE' || user?.role === 'MANAGER') && (
            <>
              <button
                onClick={() => setActiveTab('my-leaves')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'my-leaves' ? 'border-leather-600 text-leather-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                My Leave Requests
              </button>
              <button
                onClick={() => setActiveTab('apply')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'apply' ? 'border-leather-600 text-leather-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Apply for Leave
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        
        {/* ADMIN PORTAL TAB */}
        {activeTab === 'admin-portal' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-600 mb-1">Total Requests</p>
                  <p className="text-2xl font-black text-blue-900">{allLeaves.length}</p>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500"><FileText size={20}/></div>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-yellow-600 mb-1">Pending Approval</p>
                  <p className="text-2xl font-black text-yellow-900">{totalPending}</p>
                </div>
                <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500"><Clock size={20}/></div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-600 mb-1">Approved Leaves</p>
                  <p className="text-2xl font-black text-green-900">{totalApproved}</p>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-500"><CheckCircle size={20}/></div>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-600 mb-1">Rejected Leaves</p>
                  <p className="text-2xl font-black text-red-900">{totalRejected}</p>
                </div>
                <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-500"><XCircle size={20}/></div>
              </div>
            </div>

            {/* All Leaves Table */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Leave Records Management</h3>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                      <th className="px-6 py-4 font-bold">Employee</th>
                      <th className="px-6 py-4 font-bold">Leave Details</th>
                      <th className="px-6 py-4 font-bold">Dates</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {loading ? (
                      <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500"><div className="animate-pulse">Loading records...</div></td></tr>
                    ) : allLeaves.length === 0 ? (
                      <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No leave requests found in the system.</td></tr>
                    ) : (
                      allLeaves.map(leave => (
                        <tr key={leave.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{leave.employee.name}</div>
                            <div className="text-xs text-gray-500">EMP{String(leave.employee.id).padStart(3, '0')} • {leave.employee.department}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-800">{leave.leaveType}</div>
                            <div className="text-xs text-gray-500 mt-1 max-w-[200px] truncate" title={leave.reason}>Reason: {leave.reason}</div>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-700">
                            {format(parseISO(leave.fromDate), 'MMM dd')} - {format(parseISO(leave.toDate), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(leave.status)}</td>
                          <td className="px-6 py-4 text-right">
                            {leave.status === 'PENDING' ? (
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleAction(leave.id, 'approve')} disabled={actionLoading}
                                  className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1.5 rounded font-bold text-xs uppercase tracking-wide transition-colors"
                                >Approve</button>
                                <button 
                                  onClick={() => handleAction(leave.id, 'reject')} disabled={actionLoading}
                                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 rounded font-bold text-xs uppercase tracking-wide transition-colors"
                                >Reject</button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 font-medium">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* APPLY LEAVE TAB */}
        {activeTab === 'apply' && (
          <div className="max-w-2xl mx-auto py-4">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <CalendarIcon className="text-leather-600" /> Apply for Leave
            </h3>
            <form onSubmit={handleApplyLeave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <select 
                  value={formData.leaveType} onChange={e => setFormData({...formData, leaveType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leather-500 outline-none transition-all"
                  required
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="ANNUAL">Annual Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input 
                    type="date" required value={formData.fromDate} onChange={e => setFormData({...formData, fromDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leather-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input 
                    type="date" required min={formData.fromDate} value={formData.toDate} onChange={e => setFormData({...formData, toDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leather-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea 
                  required rows="4" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leather-500 outline-none transition-all"
                  placeholder="Please describe your reason for taking leave..."
                ></textarea>
              </div>
              <button 
                type="submit" disabled={actionLoading}
                className="w-full bg-leather-800 text-white font-bold py-4 rounded-xl hover:bg-leather-900 transition-all shadow-md disabled:opacity-50"
              >
                {actionLoading ? 'Submitting...' : 'Submit Leave Request'}
              </button>
            </form>
          </div>
        )}

        {/* MY LEAVES TAB */}
        {activeTab === 'my-leaves' && (
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">My Leave History</h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                    <th className="px-6 py-4 font-bold">Leave Type</th>
                    <th className="px-6 py-4 font-bold">Duration</th>
                    <th className="px-6 py-4 font-bold">Reason</th>
                    <th className="px-6 py-4 font-bold">Applied On</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500"><div className="animate-pulse">Loading...</div></td></tr>
                  ) : myLeaves.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500 flex flex-col items-center"><FileText className="h-10 w-10 text-gray-300 mb-2"/> No leave requests found.</td></tr>
                  ) : (
                    myLeaves.map(leave => (
                      <tr key={leave.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-gray-800">{leave.leaveType}</td>
                        <td className="px-6 py-4 font-medium text-gray-700">
                          {format(parseISO(leave.fromDate), 'MMM dd')} - {format(parseISO(leave.toDate), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                        <td className="px-6 py-4 text-gray-500">{format(parseISO(leave.createdAt), 'MMM dd, yyyy')}</td>
                        <td className="px-6 py-4">{getStatusBadge(leave.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Leave;
