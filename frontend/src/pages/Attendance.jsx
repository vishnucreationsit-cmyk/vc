import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';
import { MapPin, Clock, CheckCircle, AlertTriangle, XCircle, LogOut, Filter, ChevronLeft, ChevronRight, Search, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const Attendance = () => {
  const { user } = useAuth();
  const [dailyRecords, setDailyRecords] = useState([]);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Geofence States
  const [geofenceConfig, setGeofenceConfig] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [distanceFromOffice, setDistanceFromOffice] = useState(null);
  const [showGeofenceSettings, setShowGeofenceSettings] = useState(false);
  const [newRadius, setNewRadius] = useState(200);
  
  // Filters & Pagination
  const [filterMonth, setFilterMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterToday, setFilterToday] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    fetchDailyAttendance();
    fetchGeofenceConfig();
    if (user?.role === 'EMPLOYEE') {
      fetchMyHistory();
    } else if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      fetchAllHistory();
    }
  }, [user]);

  useEffect(() => {
    let watchId;
    if (navigator.geolocation && geofenceConfig) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentLocation({ lat, lng });
          setLocationError(null);
          
          const dist = calculateDistance(lat, lng, geofenceConfig.companyLat, geofenceConfig.companyLng);
          setDistanceFromOffice(Math.round(dist));
        },
        (error) => {
          setLocationError("Location Permission Denied or Unavailable");
        },
        { enableHighAccuracy: true }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [geofenceConfig]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const p1 = lat1 * Math.PI/180;
    const p2 = lat2 * Math.PI/180;
    const dp = (lat2-lat1) * Math.PI/180;
    const dl = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const fetchGeofenceConfig = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/geofence/config');
      setGeofenceConfig(res.data);
      setNewRadius(res.data.allowedRadiusMeters);
    } catch (err) {
      console.error("Failed to fetch geofence config", err);
    }
  };

  const handleUpdateGeofence = async () => {
    try {
      await axios.post('http://localhost:8080/api/geofence/config', {
        companyLat: geofenceConfig.companyLat,
        companyLng: geofenceConfig.companyLng,
        allowedRadiusMeters: newRadius
      });
      setMessage({ type: 'success', text: 'Geofence Radius Updated!' });
      setShowGeofenceSettings(false);
      fetchGeofenceConfig();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update geofence settings' });
    }
  };

  const fetchDailyAttendance = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/attendance/daily?date=${today}`);
      let data = response.data;
      
      const record = data.find(a => a.employee.id === parseInt(user.employeeId));
      setTodayRecord(record || null);

      if (user?.role === 'EMPLOYEE') {
        data = data.filter(a => a.employee.id === parseInt(user.employeeId));
      }
      setDailyRecords(data);
    } catch (err) {
      console.error("Failed to fetch daily attendance", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await axios.get(`http://localhost:8080/api/attendance/my-attendance?employeeId=${user.employeeId}`);
      setHistoryRecords(response.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchAllHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await axios.get(`http://localhost:8080/api/attendance/all`);
      // Sort descending by date and time
      const sorted = response.data.sort((a, b) => {
        if (a.attendanceDate !== b.attendanceDate) {
          return new Date(b.attendanceDate) - new Date(a.attendanceDate);
        }
        if (a.checkInTime && b.checkInTime) {
          return b.checkInTime.localeCompare(a.checkInTime);
        }
        return 0;
      });
      setHistoryRecords(sorted);
    } catch (err) {
      console.error("Failed to fetch all history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setMessage({ type: '', text: '' });
      if (!currentLocation) {
        throw new Error(locationError || 'Waiting for GPS location...');
      }
      const payload = {
        employeeId: parseInt(user.employeeId), date: today, time: format(new Date(), 'HH:mm:ss'),
        latitude: currentLocation.lat, longitude: currentLocation.lng
      };
      await axios.post('http://localhost:8080/api/attendance/check-in', payload);
      setMessage({ type: 'success', text: 'Attendance Marked Successfully' });
      fetchDailyAttendance();
      if (user?.role === 'EMPLOYEE') fetchMyHistory();
      if (user?.role === 'ADMIN' || user?.role === 'MANAGER') fetchAllHistory();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || err.message || 'Failed to check in' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setMessage({ type: '', text: '' });
      if (!currentLocation) {
        throw new Error(locationError || 'Waiting for GPS location...');
      }
      const payload = { 
        employeeId: parseInt(user.employeeId), date: today, time: format(new Date(), 'HH:mm:ss'),
        latitude: currentLocation.lat, longitude: currentLocation.lng
      };
      await axios.post('http://localhost:8080/api/attendance/check-out', payload);
      setMessage({ type: 'success', text: 'Check Out Marked Successfully' });
      fetchDailyAttendance();
      if (user?.role === 'EMPLOYEE') fetchMyHistory();
      if (user?.role === 'ADMIN' || user?.role === 'MANAGER') fetchAllHistory();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || err.message || 'Failed to check out' });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PRESENT': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1 w-max"><CheckCircle size={12}/> On Time</span>;
      case 'LATE': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1 w-max"><AlertTriangle size={12}/> Late</span>;
      case 'VERY_LATE': return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium flex items-center gap-1 w-max"><AlertTriangle size={12}/> Very Late</span>;
      case 'ABSENT': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1 w-max"><XCircle size={12}/> Absent</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium w-max">{status}</span>;
    }
  };

  // Filter history (works for both Employee and Admin)
  const filteredHistory = historyRecords.filter(record => {
    if (filterToday) {
      if (record.attendanceDate !== today) return false;
    } else {
      if (filterMonth) {
        const recordMonth = record.attendanceDate.substring(0, 7);
        if (recordMonth !== filterMonth) return false;
      }
      if (startDate && record.attendanceDate < startDate) return false;
      if (endDate && record.attendanceDate > endDate) return false;
    }

    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      if (filterEmployee && !record.employee.name.toLowerCase().includes(filterEmployee.toLowerCase()) && !String(record.employee.id).includes(filterEmployee)) return false;
      if (filterDepartment && record.employee.department !== filterDepartment) return false;
      if (filterStatus && record.status !== filterStatus) return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Extract unique departments for filter dropdown
  const departments = [...new Set(historyRecords.map(r => r.employee.department))].filter(Boolean);

  const clearFilters = () => {
    setFilterMonth(''); setStartDate(''); setEndDate(''); setFilterEmployee(''); 
    setFilterDepartment(''); setFilterStatus(''); setFilterToday(false); setCurrentPage(1);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance Dashboard</h1>
          <p className="text-gray-500">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}

      {/* Location Status Card */}
      {(user?.role === 'EMPLOYEE' || user?.role === 'MANAGER') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Location Status</h3>
          {locationError ? (
            <div className="flex flex-col items-center gap-2 text-red-600">
              <AlertTriangle size={32} />
              <p className="font-bold text-center">{locationError}</p>
              <p className="text-sm text-gray-500 text-center">Please enable location permissions in your browser to mark attendance.</p>
            </div>
          ) : distanceFromOffice !== null ? (
            <div className="flex flex-col items-center w-full">
              {distanceFromOffice <= (geofenceConfig?.allowedRadiusMeters || 200) ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-6 py-3 rounded-full mb-4 border border-green-200">
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                  </span>
                  <span className="font-bold">Inside Company Radius</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-6 py-3 rounded-full mb-4 border border-red-200">
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                  </span>
                  <span className="font-bold">Outside Company Radius</span>
                </div>
              )}
              <div className="flex justify-between w-full max-w-sm text-sm border-t border-gray-100 pt-4">
                <span className="text-gray-500 font-medium">Distance from Office:</span>
                <span className="font-bold text-gray-900">{distanceFromOffice} meters</span>
              </div>
              <div className="flex justify-between w-full max-w-sm text-sm mt-2">
                <span className="text-gray-500 font-medium">Allowed Radius:</span>
                <span className="font-bold text-gray-900">{geofenceConfig?.allowedRadiusMeters || 200} meters</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p>Detecting GPS Location...</p>
            </div>
          )}
        </div>
      )}

      {/* Action Cards (Hidden from pure Admin if they don't clock in, but usually MANAGER might clock in. We'll show for EMPLOYEE and MANAGER) */}
      {(user?.role === 'EMPLOYEE' || user?.role === 'MANAGER') && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Check In</h3>
            <p className="text-sm text-gray-500 mb-6">Shift starts at 09:00 AM</p>
            <button
              onClick={handleCheckIn} disabled={actionLoading || todayRecord?.checkInTime}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${todayRecord?.checkInTime ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-leather-600 text-white hover:bg-leather-700 shadow-md'}`}
            >
              <MapPin size={18} />
              {todayRecord?.checkInTime ? `Checked in at ${todayRecord.checkInTime}` : 'Check In Now'}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="h-16 w-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Check Out</h3>
            <p className="text-sm text-gray-500 mb-6">Shift ends at 06:00 PM</p>
            <button
              onClick={handleCheckOut} disabled={actionLoading || !todayRecord?.checkInTime || todayRecord?.checkOutTime}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${!todayRecord?.checkInTime || todayRecord?.checkOutTime ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-900 shadow-md'}`}
            >
              <LogOut size={18} />
              {todayRecord?.checkOutTime ? `Checked out at ${todayRecord.checkOutTime}` : 'Check Out Now'}
            </button>
          </div>
        </div>
      )}

      {/* Admin/Manager Comprehensive View */}
      {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-bold text-gray-800">Company Attendance Records</h3>
              <div className="flex gap-2">
                {user?.role === 'ADMIN' && (
                  <button 
                    onClick={() => setShowGeofenceSettings(true)}
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-2"
                  >
                    <Settings size={16} /> Geofence Settings
                  </button>
                )}
                <button 
                  onClick={() => { clearFilters(); setFilterToday(true); }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filterToday ? 'bg-leather-600 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Today Only
                </button>
                <button 
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-white bg-gray-50 text-sm font-medium transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Date Filters */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">From</label>
                  <input 
                    type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setFilterToday(false); setCurrentPage(1); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leather-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">To</label>
                  <input 
                    type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setFilterToday(false); setCurrentPage(1); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leather-500 outline-none text-sm"
                  />
                </div>
              </div>
              
              {/* Employee Search */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Employee</label>
                <div className="relative">
                  <input 
                    type="text" placeholder="Name or ID..." value={filterEmployee} onChange={(e) => { setFilterEmployee(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leather-500 outline-none text-sm"
                  />
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Department</label>
                <select 
                  value={filterDepartment} onChange={(e) => { setFilterDepartment(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leather-500 outline-none text-sm"
                >
                  <option value="">All Depts</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Status</label>
                <select 
                  value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leather-500 outline-none text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="PRESENT">On Time</option>
                  <option value="LATE">Late</option>
                  <option value="VERY_LATE">Very Late</option>
                  <option value="ABSENT">Absent</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Employee</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Location</th>
                  <th className="px-6 py-4 font-bold">Check In</th>
                  <th className="px-6 py-4 font-bold">Check Out</th>
                  <th className="px-6 py-4 font-bold">Total Hrs</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Mins Late</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {historyLoading ? (
                  <tr><td colSpan="8" className="px-6 py-12 text-center text-gray-500"><div className="animate-pulse">Loading records...</div></td></tr>
                ) : paginatedHistory.length === 0 ? (
                  <tr><td colSpan="8" className="px-6 py-12 text-center text-gray-500">No attendance records found matching filters.</td></tr>
                ) : (
                  paginatedHistory.map(record => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{record.employee.name}</div>
                        <div className="text-xs font-medium text-gray-500">EMP{String(record.employee.id).padStart(3, '0')} • {record.employee.department}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">{format(parseISO(record.attendanceDate), 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4">
                        {record.distanceFromOffice !== null ? (
                          <div className="flex flex-col">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full w-max ${record.distanceFromOffice <= (geofenceConfig?.allowedRadiusMeters || 200) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {record.distanceFromOffice <= (geofenceConfig?.allowedRadiusMeters || 200) ? 'Inside' : 'Outside'}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">{Math.round(record.distanceFromOffice)}m away</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-leather-700">{record.checkInTime || '-'}</td>
                      <td className="px-6 py-4 font-mono text-gray-600">{record.checkOutTime || '-'}</td>
                      <td className="px-6 py-4 font-bold text-gray-700">{record.totalHours ? `${record.totalHours}h` : '-'}</td>
                      <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                      <td className="px-6 py-4 font-bold">{record.minutesLate > 0 ? <span className="text-red-500">{record.minutesLate}</span> : <span className="text-gray-300">-</span>}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Showing page <span className="text-gray-900">{currentPage}</span> of <span className="text-gray-900">{totalPages}</span> ({filteredHistory.length} total records)</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white border border-gray-300 disabled:opacity-50 hover:bg-gray-50 transition-colors shadow-sm"
                ><ChevronLeft size={18} /></button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white border border-gray-300 disabled:opacity-50 hover:bg-gray-50 transition-colors shadow-sm"
                ><ChevronRight size={18} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Employee Personal View */}
      {user?.role === 'EMPLOYEE' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">My Attendance History</h3>
            
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Filter by Month</label>
                <input 
                  type="month" 
                  value={filterMonth} 
                  onChange={(e) => { setFilterMonth(e.target.value); setCurrentPage(1); }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-leather-500 sm:text-sm"
                />
              </div>
              <button 
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors h-[38px]"
              >
                Clear
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Check In</th>
                  <th className="px-6 py-4 font-bold">Check Out</th>
                  <th className="px-6 py-4 font-bold">Total Hrs</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Mins Late</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {historyLoading ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500"><div className="animate-pulse">Loading history...</div></td></tr>
                ) : paginatedHistory.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No attendance history found.</td></tr>
                ) : (
                  paginatedHistory.map(record => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{format(parseISO(record.attendanceDate), 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4 font-mono font-medium text-leather-700">{record.checkInTime || '-'}</td>
                      <td className="px-6 py-4 font-mono text-gray-600">{record.checkOutTime || '-'}</td>
                      <td className="px-6 py-4 font-bold text-gray-700">{record.totalHours ? `${record.totalHours}h` : '-'}</td>
                      <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                      <td className="px-6 py-4 font-bold">{record.minutesLate > 0 ? <span className="text-red-500">{record.minutesLate}</span> : <span className="text-gray-300">-</span>}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Page {currentPage} of {totalPages}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-1.5 rounded-md bg-white border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                ><ChevronLeft size={18} /></button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="p-1.5 rounded-md bg-white border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                ><ChevronRight size={18} /></button>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Admin Geofence Settings Modal */}
      {showGeofenceSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Geofence Settings</h3>
              <button onClick={() => setShowGeofenceSettings(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Allowed Radius</label>
                <select 
                  value={newRadius} 
                  onChange={(e) => setNewRadius(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                >
                  <option value={100}>100 meters (Strict)</option>
                  <option value={200}>200 meters (Default)</option>
                  <option value={500}>500 meters (Flexible)</option>
                  <option value={1000}>1000 meters (Campus wide)</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">Employees will only be able to check-in/out if they are within this distance from the company's GPS coordinates.</p>
              </div>
              <button
                onClick={handleUpdateGeofence}
                className="w-full bg-indigo-600 text-white font-bold text-lg py-3.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md mt-4"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Attendance;
