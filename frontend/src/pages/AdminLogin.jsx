import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Shield, ArrowRight, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // OTP State
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

      if (!otpStep) {
        // Send OTP
        const response = await axios.post(import.meta.env.VITE_API_URL + '/api/auth/admin-login/send-otp', { 
          email: email 
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
    <div className="min-h-screen flex bg-gray-900 font-inter items-center justify-center relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555664424-778a1e5e1b48?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-luminosity"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>

      <div className="w-full max-w-md relative z-10 p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl">
          
          <div className="text-center mb-8">
            <div className="bg-leather-600/20 p-4 rounded-2xl inline-block mb-4 shadow-lg border border-leather-500/30">
              <Shield className="h-10 w-10 text-leather-400" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Admin Gateway</h1>
            <p className="text-gray-400 mt-2 font-medium">Restricted access portal.</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm mb-6 font-medium flex items-center gap-3">
                <div className="bg-red-500/20 p-1.5 rounded-md"><span className="block w-2 h-2 rounded-full bg-red-500"></span></div>
                {error}
              </motion.div>
            )}
            {successMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-xl text-sm mb-6 font-medium flex items-center gap-3">
                <div className="bg-green-500/20 p-1.5 rounded-md"><span className="block w-2 h-2 rounded-full bg-green-500"></span></div>
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                disabled={otpStep}
                className="w-full px-5 py-4 rounded-xl border border-gray-700 bg-gray-800/50 focus:ring-4 focus:ring-leather-500/20 focus:border-leather-500 outline-none transition-all text-white shadow-sm placeholder-gray-500 font-medium disabled:opacity-50"
                required
              />
            </div>
            
            {otpStep && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <div className="flex items-center justify-between mb-2 mt-4">
                  <label className="block text-sm font-bold text-gray-300 uppercase tracking-wide">Enter OTP</label>
                  <button type="button" onClick={() => { setOtpStep(false); setSuccessMsg(''); setError(''); }} className="text-sm font-bold text-leather-400 hover:text-leather-300 transition-colors">
                    Change Email
                  </button>
                </div>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  placeholder="000000"
                  className="w-full px-5 py-4 rounded-xl border border-gray-700 bg-gray-800/50 focus:ring-4 focus:ring-leather-500/20 focus:border-leather-500 outline-none transition-all text-white shadow-sm font-bold tracking-[0.5em] text-center text-xl"
                  required
                />
              </motion.div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-leather-600 text-white font-black text-lg py-4 rounded-xl hover:bg-leather-500 transition-all shadow-xl hover:shadow-leather-500/20 hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-xl mt-6 flex items-center justify-center gap-2 group border border-leather-500/50"
            >
              {loading ? 'Processing...' : (!otpStep ? 'Send Security Code' : 'Verify & Login')}
              {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

        </motion.div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 w-full py-3 text-gray-400 font-medium hover:text-white transition-all"
          >
            <Globe size={16} /> Return to Public Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
