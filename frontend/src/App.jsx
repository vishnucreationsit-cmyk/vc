import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Attendance from './pages/Attendance';
import Employees from './pages/Employees';
import Dashboard from './pages/Dashboard';
import Leave from './pages/Leave';
import Orders from './pages/Orders';
import ForgotPassword from './pages/ForgotPassword';
import NotificationCenter from './pages/NotificationCenter';
import PublicWebsite from './pages/PublicWebsite';
import VisitorManagement from './pages/VisitorManagement';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  
  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicWebsite />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
      <Route path="/employees" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Employees /></ProtectedRoute>} />
      <Route path="/leave" element={<ProtectedRoute><Leave /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Orders /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><NotificationCenter /></ProtectedRoute>} />
      <Route path="/visitors" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><VisitorManagement /></ProtectedRoute>} />
      
      {/* Catch All */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
