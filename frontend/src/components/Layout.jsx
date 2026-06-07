import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Briefcase, 
  LayoutDashboard, 
  Clock, 
  Users, 
  Calendar, 
  Package, 
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { name: 'Attendance', path: '/attendance', icon: <Clock size={20} />, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { name: 'Employees', path: '/employees', icon: <Users size={20} />, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Leave', path: '/leave', icon: <Calendar size={20} />, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { name: 'Orders', path: '/orders', icon: <Package size={20} />, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Alerts', path: '/notifications', icon: <Bell size={20} />, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Visitors', path: '/visitors', icon: <Users size={20} />, roles: ['ADMIN', 'MANAGER'] },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 2000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/api/notifications/unread');
      setNotifications(res.data);
    } catch (err) {
      // silent fail
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {}
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(import.meta.env.VITE_API_URL + '/api/notifications/read-all');
      fetchNotifications();
      setShowNotifications(false);
    } catch (err) {}
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-leather-800 text-white transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 bg-leather-900">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-leather-300" />
            <span className="font-bold text-lg">Vishnu Creations</span>
          </div>
          <button className="lg:hidden text-gray-300 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 min-h-0">
          <nav className="px-4 space-y-2">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-leather-600 text-white shadow-md' 
                      : 'text-leather-200 hover:bg-leather-700 hover:text-white'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 bg-leather-900 border-t border-leather-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-leather-600 flex items-center justify-center text-white font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.username}</p>
              <p className="text-xs text-leather-300">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-300 hover:text-red-100 hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button 
              className="text-gray-600 hover:text-gray-900 lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden lg:flex items-center gap-2 text-gray-500 font-medium">
              <span>{location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1).charAt(0).toUpperCase() + location.pathname.substring(2)}</span>
            </div>
          </div>

          {/* Admin Header Actions */}
          <div className="flex items-center gap-4">
            {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-500 hover:text-leather-600 transition-colors rounded-full hover:bg-gray-100"
                >
                  <Bell size={22} />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-[90vw] sm:w-96 max-w-[100vw] sm:max-w-none bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in origin-top-right">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Bell size={16} className="text-leather-600" /> Notifications
                      </h3>
                      {notifications.length > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-leather-600 font-medium hover:text-leather-800">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                          <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                          No new notifications
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {notifications.map(notif => (
                            <div key={notif.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => { navigate('/notifications'); setShowNotifications(false); }}>
                              <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${notif.type === 'LEAVE' ? 'bg-yellow-100 text-yellow-800' : notif.type === 'ATTENDANCE' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                  {notif.type}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium">{new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                              <h4 className="font-semibold text-gray-800 text-sm mb-1">{notif.title}</h4>
                              <p className="text-gray-600 text-xs whitespace-pre-line leading-relaxed truncate">{notif.message.split('\n')[0]}...</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-gray-100 text-center bg-gray-50">
                      <Link to="/notifications" onClick={() => setShowNotifications(false)} className="text-sm font-bold text-leather-600 hover:text-leather-800">
                        View all history
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="h-8 w-8 rounded-full bg-leather-100 text-leather-800 flex items-center justify-center font-bold lg:hidden">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors bg-gray-100 hover:bg-red-50 px-3 py-1.5 rounded-lg font-bold"
            >
              <LogOut size={16} />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
