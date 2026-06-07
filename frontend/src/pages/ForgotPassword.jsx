import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Smartphone, Lock, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // State for Step 1: Lookup
  const [searchTerm, setSearchTerm] = useState('');
  const [userData, setUserData] = useState(null);
  
  // State for Step 2: OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  
  // State for Step 3: Reset Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const handleLookupAndSendOtp = async (e) => {
    e?.preventDefault();
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const res = await axios.post(import.meta.env.VITE_API_URL + '/api/auth/forgot-password/send-otp', { searchTerm });
      setUserData(res.data);
      setMessage({ type: 'success', text: res.data.message });
      setTimeout(() => { setMessage({ type: '', text: '' }); setStep(2); }, 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Account not found or mobile not registered' });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return setMessage({ type: 'error', text: 'Please enter a 6-digit OTP' });
    
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const res = await axios.post(import.meta.env.VITE_API_URL + '/api/auth/verify-otp', { 
        userId: userData.userId, 
        otpCode 
      });
      setResetToken(res.data.resetToken);
      setMessage({ type: 'success', text: 'OTP Verified Successfully!' });
      setTimeout(() => { setMessage({ type: '', text: '' }); setStep(3); }, 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Invalid OTP' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setMessage({ type: 'error', text: 'Passwords do not match' });
    }
    if (!validatePassword(newPassword)) {
      return setMessage({ type: 'error', text: 'Password does not meet the security requirements.' });
    }
    
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const res = await axios.post(import.meta.env.VITE_API_URL + '/api/auth/reset-password', { 
        resetToken, 
        newPassword,
        method: 'MOBILE'
      });
      setMessage({ type: 'success', text: res.data.message });
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to reset password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-inter">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* Back Button */}
        {step === 1 && (
          <button onClick={() => navigate('/login')} className="flex items-center text-sm font-medium text-gray-500 hover:text-leather-600 transition-colors mb-6">
            <ArrowLeft size={16} className="mr-1" /> Back to Login
          </button>
        )}
        {step > 1 && step < 4 && (
          <button onClick={() => { setStep(step - 1); setMessage({ type: '', text: '' }); }} className="flex items-center text-sm font-medium text-gray-500 hover:text-leather-600 transition-colors mb-6">
            <ArrowLeft size={16} className="mr-1" /> Back
          </button>
        )}

        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-leather-50 rounded-full flex items-center justify-center mb-4">
            {step === 1 && <Search className="h-8 w-8 text-leather-600" />}
            {step === 2 && <Smartphone className="h-8 w-8 text-leather-600" />}
            {step === 3 && <Lock className="h-8 w-8 text-leather-600" />}
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {step === 1 && "Find Your Account"}
            {step === 2 && "Enter OTP"}
            {step === 3 && "Reset Password"}
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            {step === 1 && "Enter your Username, Mobile or Employee ID to receive an OTP."}
            {step === 2 && userData && `We've sent a 6-digit code to your registered mobile: ${userData.maskedMobile}`}
            {step === 3 && "Create a new strong password."}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {message.text && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* STEP 1: Lookup User */}
        {step === 1 && (
          <form onSubmit={handleLookupAndSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Search Account</label>
              <input 
                type="text" required value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-leather-500 focus:border-leather-500 outline-none transition-all"
                placeholder="Username, Mobile or EMP ID"
              />
            </div>
            <button 
              type="submit" disabled={loading || !searchTerm}
              className="w-full py-3.5 px-4 bg-leather-800 hover:bg-leather-900 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-all flex justify-center items-center gap-2"
            >
              {loading ? 'Sending OTP...' : 'Send OTP via SMS'} <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="flex justify-between gap-2">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={e => handleOtpChange(e.target, index)}
                  onFocus={e => e.target.select()}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-gray-200 focus:ring-2 focus:ring-leather-500 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              ))}
            </div>
            <button 
              type="submit" disabled={loading || otp.join('').length !== 6}
              className="w-full py-3.5 px-4 bg-leather-800 hover:bg-leather-900 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-all flex justify-center items-center gap-2"
            >
              {loading ? 'Verifying...' : 'Verify OTP'} <ArrowRight size={18} />
            </button>
            <div className="text-center">
              <button type="button" onClick={() => handleLookupAndSendOtp()} disabled={loading} className="text-sm font-bold text-leather-600 hover:text-leather-800 transition-colors">
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Reset Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input 
                  type={showNewPassword ? "text" : "password"} required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-leather-500 outline-none transition-all"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-leather-500 outline-none transition-all"
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-1">
              <p className="font-bold text-gray-700 mb-2">Password must contain:</p>
              <p className={`flex items-center gap-2 ${newPassword.length >= 8 ? 'text-green-600 font-bold' : ''}`}>• At least 8 characters</p>
              <p className={`flex items-center gap-2 ${/[A-Z]/.test(newPassword) ? 'text-green-600 font-bold' : ''}`}>• At least 1 uppercase letter</p>
              <p className={`flex items-center gap-2 ${/[a-z]/.test(newPassword) ? 'text-green-600 font-bold' : ''}`}>• At least 1 lowercase letter</p>
              <p className={`flex items-center gap-2 ${/[0-9]/.test(newPassword) ? 'text-green-600 font-bold' : ''}`}>• At least 1 number</p>
              <p className={`flex items-center gap-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'text-green-600 font-bold' : ''}`}>• At least 1 special character</p>
            </div>

            <button 
              type="submit" disabled={loading || !newPassword || !confirmPassword || !validatePassword(newPassword)}
              className="w-full py-3.5 px-4 bg-leather-800 hover:bg-leather-900 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-all"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
