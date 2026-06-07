import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Filter, Search } from 'lucide-react';

const VisitorManagement = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, TODAY, WEEK, MONTH

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/api/visitors');
      setVisitors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredVisitors = () => {
    const now = new Date();
    return visitors.filter(v => {
      // Search
      const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            v.mobileNumber.includes(searchTerm);
      if (!matchesSearch) return false;

      // Filter
      const visitDate = new Date(v.visitTime);
      if (filter === 'TODAY') {
        return visitDate.toDateString() === now.toDateString();
      }
      if (filter === 'WEEK') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return visitDate >= weekAgo;
      }
      if (filter === 'MONTH') {
        return visitDate.getMonth() === now.getMonth() && visitDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const filtered = getFilteredVisitors();

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-indigo-600" /> Visitor Management
          </h1>
          <p className="text-gray-500">Track and analyze public website visitors.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase">Total Visitors</p>
          <h3 className="text-2xl font-black text-indigo-600 mt-1">{visitors.length}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase">Today</p>
          <h3 className="text-2xl font-black text-indigo-600 mt-1">{visitors.filter(v => new Date(v.visitTime).toDateString() === new Date().toDateString()).length}</h3>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 bg-gray-50">
          <div className="flex gap-2 items-center">
            <Filter size={18} className="text-gray-400" />
            {['ALL', 'TODAY', 'WEEK', 'MONTH'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === f ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or mobile..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 w-full md:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Visitor Name</th>
                <th className="px-6 py-3 font-medium">Mobile Number</th>
                <th className="px-6 py-3 font-medium">Visit Date & Time</th>
                <th className="px-6 py-3 font-medium">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Loading visitors...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No visitors found matching criteria.</td></tr>
              ) : (
                filtered.map(visitor => (
                  <tr key={visitor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{visitor.name}</td>
                    <td className="px-6 py-4 text-gray-600">{visitor.mobileNumber}</td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{new Date(visitor.visitTime).toLocaleDateString()}</div>
                      <div className="text-gray-500 text-xs">{new Date(visitor.visitTime).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">{visitor.ipAddress || 'Unknown'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VisitorManagement;
