import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCircle, Trash2, Filter } from 'lucide-react';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/api/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`);
      fetchNotifications(true);
    } catch (err) {}
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/notifications/${id}`);
      fetchNotifications(true);
    } catch (err) {}
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'ALL') return true;
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'READ') return n.isRead;
    return n.type === filter;
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="text-leather-600" /> Notification History
          </h1>
          <p className="text-gray-500">View and manage all system alerts.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-2 items-center bg-gray-50">
          <Filter size={18} className="text-gray-400 mr-2" />
          {['ALL', 'UNREAD', 'READ', 'LEAVE', 'ATTENDANCE', 'EMPLOYEE', 'ENQUIRY'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === f ? 'bg-leather-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Date & Time</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Notification Details</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading && filteredNotifications.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading notifications...</td></tr>
              ) : filteredNotifications.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No notifications found for this filter.</td></tr>
              ) : (
                filteredNotifications.map(notif => (
                  <tr key={notif.id} className={`hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900">{new Date(notif.createdAt).toLocaleDateString()}</div>
                      <div className="text-gray-500 text-xs">{new Date(notif.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        notif.type === 'LEAVE' ? 'bg-yellow-100 text-yellow-800' :
                        notif.type === 'ATTENDANCE' ? 'bg-blue-100 text-blue-800' :
                        notif.type === 'ENQUIRY' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {notif.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <h4 className="font-bold text-gray-900 mb-1">{notif.title}</h4>
                      <p className="text-gray-600 text-xs whitespace-pre-line leading-relaxed">{notif.message}</p>
                    </td>
                    <td className="px-6 py-4">
                      {notif.isRead ? (
                        <span className="text-gray-400 font-bold text-xs uppercase flex items-center gap-1"><CheckCircle size={14}/> Read</span>
                      ) : (
                        <span className="text-blue-600 font-bold text-xs uppercase flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Unread</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {!notif.isRead && (
                          <button onClick={() => markAsRead(notif.id)} className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors" title="Mark as Read">
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button onClick={() => deleteNotification(notif.id)} className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
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

export default NotificationCenter;
