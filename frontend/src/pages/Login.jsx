import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Briefcase, Shield, User, Eye, EyeOff, Globe, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState('EMPLOYEE');
  const [loading, setLoading] = useState(false);
  
  // OTP State for Admin
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [adminUserId, setAdminUserId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      if (loginType === 'ADMIN') {
        if (!otpStep) {
          // Send OTP
          const response = await axios.post(import.meta.env.VITE_API_URL + '/api/auth/admin-login/send-otp', { 
            username 
          });
          setAdminUserId(response.data.userId);
          setSuccessMsg(response.data.message);
          setOtpStep(true);
        } else {
          // Verify OTP
          const response = await axios.post(import.meta.env.VITE_API_URL + '/api/auth/admin-login/verify-otp', { 
            userId: adminUserId,
            otpCode 
          });
          login(response.data);
          navigate('/dashboard');
        }
      } else {
        // Employee Password Login
        const response = await axios.post(import.meta.env.VITE_API_URL + '/api/auth/login', { 
          username, 
          password,
          loginType 
        });
        login(response.data);
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Unable to connect to server');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex bg-white font-inter">
      {/* Left Panel - Image & Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-[#1a120c] overflow-hidden items-end p-12">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200&auto=format&fit=crop" 
            alt="Premium Leather Craftsmanship" 
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a120c] via-[#1a120c]/60 to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl inline-block mb-6">
              <Briefcase className="h-8 w-8 text-leather-400" />
            </div>
            <h1 className="text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              Crafting Excellence Since 2010.
            </h1>
            <p className="text-xl text-leather-200 font-light mb-8">
              Access the Vishnu Creations secure attendance and management portal.
            </p>
            <div className="flex gap-4 items-center">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1a120c] bg-leather-800 flex items-center justify-center text-xs text-white font-bold">
                    <User size={14} />
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-gray-400">Join 500+ professionals</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-20 relative bg-gray-50/50">
        <div className="w-full max-w-md">
          {/* Mobile Branding (only shows on small screens) */}
          <div className="lg:hidden text-center mb-10">
            <div className="bg-leather-800 p-4 rounded-2xl inline-block mb-4 shadow-lg">
              <Briefcase className="h-8 w-8 text-leather-300" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Vishnu Creations</h1>
            <p className="text-gray-500 font-medium">Management Portal</p>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500">Please enter your details to sign in.</p>
          </div>

          {/* Role Switcher */}
          <div className="flex bg-gray-100/80 p-1.5 rounded-xl mb-8 border border-gray-200/50">
            <button
              type="button"
              onClick={() => { setLoginType('ADMIN'); setError(''); setSuccessMsg(''); setOtpStep(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${loginType === 'ADMIN' ? 'bg-white text-leather-800 shadow-md transform scale-[1.02]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
            >
              <Shield size={18} /> Admin
            </button>
            <button
              type="button"
              onClick={() => { setLoginType('EMPLOYEE'); setError(''); setSuccessMsg(''); setOtpStep(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${loginType === 'EMPLOYEE' ? 'bg-white text-leather-800 shadow-md transform scale-[1.02]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
            >
              <User size={18} /> Employee
            </button>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm mb-4 font-medium flex items-center gap-3">
                <div className="bg-red-100 p-1.5 rounded-md"><span className="block w-2 h-2 rounded-full bg-red-500"></span></div>
                {error}
              </motion.div>
            )}
            {successMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-50 border border-green-100 text-green-700 p-4 rounded-xl text-sm mb-4 font-medium flex items-center gap-3">
                <div className="bg-green-100 p-1.5 rounded-md"><span className="block w-2 h-2 rounded-full bg-green-500"></span></div>
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                {loginType === 'ADMIN' ? 'Admin Username' : 'Employee ID'}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={loginType === 'ADMIN' ? "CH_SATISH" : "EMP001"}
                disabled={otpStep}
                className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-leather-500/20 focus:border-leather-500 outline-none transition-all bg-white shadow-sm placeholder-gray-400 text-gray-800 font-medium disabled:bg-gray-50 disabled:text-gray-500"
                required
              />
            </div>
            
            {loginType === 'EMPLOYEE' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Password</label>
                  <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm font-bold text-leather-600 hover:text-leather-800 transition-colors">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-4 pr-12 rounded-xl border border-gray-200 focus:ring-4 focus:ring-leather-500/20 focus:border-leather-500 outline-none transition-all bg-white shadow-sm text-gray-800 font-medium tracking-wide"
                    required={loginType === 'EMPLOYEE'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>
            )}

            {loginType === 'ADMIN' && otpStep && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Enter OTP</label>
                  <button type="button" onClick={() => { setOtpStep(false); setSuccessMsg(''); setError(''); }} className="text-sm font-bold text-leather-600 hover:text-leather-800 transition-colors">
                    Change Username
                  </button>
                </div>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  placeholder="000000"
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-leather-500/20 focus:border-leather-500 outline-none transition-all bg-white shadow-sm text-gray-800 font-bold tracking-[0.5em] text-center text-xl"
                  required={loginType === 'ADMIN' && otpStep}
                />
              </motion.div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-leather-800 text-white font-black text-lg py-4 rounded-xl hover:bg-leather-900 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-xl mt-4 flex items-center justify-center gap-2 group"
            >
              {loading ? 'Processing...' : (loginType === 'ADMIN' && !otpStep ? 'Send OTP' : 'Sign In')}
              {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
