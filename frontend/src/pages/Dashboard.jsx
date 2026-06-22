import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { Package, CheckCircle, TrendingUp, Users, ChevronLeft, ChevronRight, X, Phone, Mail, MapPin, Award, ShieldCheck, Clock, Zap, Leaf, Globe, Briefcase, Calendar, LogOut, UserX, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import { Autoplay } from 'swiper/modules';



const Dashboard = () => {
  const { user } = useAuth();
  const [liveAttendance, setLiveAttendance] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [enquiries, setEnquiries] = useState([]);

  const [completedOrders, setCompletedOrders] = useState([]);
  const todayDate = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      const fetchLive = async () => {
        try {
          const [attRes, leaveRes, empRes, enqRes, orderRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}/api/attendance/daily?date=${todayDate}`),
            axios.get(import.meta.env.VITE_API_URL + '/api/leave/all'),
            axios.get(import.meta.env.VITE_API_URL + '/api/employees'),
            axios.get(import.meta.env.VITE_API_URL + '/api/enquiries'),

            axios.get(import.meta.env.VITE_API_URL + '/api/orders')
          ]);
          setLiveAttendance(attRes.data);
          setAllLeaves(leaveRes.data);
          setAllEmployees(empRes.data);
          setEnquiries(enqRes.data);


          if (orderRes.data) {
            const delivered = orderRes.data.filter(o => o.status === 'Delivered');
            // Sort by updated date descending if available, else id
            delivered.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
            setCompletedOrders(delivered);
          }
        } catch (err) { console.error("Error fetching dashboard stats", err); }
      };
      fetchLive();
      const interval = setInterval(fetchLive, 5000); // 5s to avoid spamming too much
      return () => clearInterval(interval);
    }
  }, [user, todayDate]);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [productLightboxOpen, setProductLightboxOpen] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  const openLightbox = (index, customImages) => {
    if (!customImages || customImages.length === 0) return;
    setLightboxImages(customImages);
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % lightboxImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);

  const minSwipeDistance = 50;
  const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e) => { setTouchEnd(e.targetTouches[0].clientX); };

  const onTouchEndBarkingBags = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) nextImage();
    if (distance < -minSwipeDistance) prevImage();
  };

  const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL}${url}`;
  };

  return (
    <div className="space-y-12 pb-12 overflow-x-hidden">

      {/* 1. Welcome Message & Original Dashboard Existing Header */}
      <div className="flex justify-between items-end pt-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.username}!</h1>
          <p className="text-gray-500">Here's what's happening at Vishnu Creations today.</p>
        </div>
      </div>

      {/* 2. Hero Banner Section */}
      <motion.div
        initial="hidden" animate="visible" variants={fadeIn}
        className="relative w-full rounded-2xl overflow-hidden shadow-2xl h-[400px] md:h-[500px]"
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=2000&auto=format&fit=crop"
            alt="Leather Crafting Background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-leather-900/90 via-leather-900/70 to-transparent"></div>
        </div>
        <div className="relative h-full flex flex-col justify-center px-8 md:px-16 max-w-4xl">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
            <span className="inline-block py-1 px-3 rounded-full bg-leather-500/20 border border-leather-400 text-leather-200 text-sm font-semibold tracking-widest uppercase mb-4">
              Established 2010
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tight">Vishnu Creations</h1>
            <p className="text-xl md:text-2xl text-leather-200 font-light mb-6 italic">
              "Crafting Premium Leather Products Since 2010"
            </p>
            <div className="flex flex-col sm:flex-row gap-6 mt-8">
              <div className="flex items-center gap-3 bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="h-10 w-10 bg-leather-600 rounded-full flex items-center justify-center"><Briefcase className="text-white h-5 w-5" /></div>
                <div>
                  <p className="text-leather-200 text-xs uppercase tracking-wider">Founder</p>
                  <p className="text-white font-bold text-lg">CH Satish</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="h-10 w-10 bg-leather-600 rounded-full flex items-center justify-center"><Globe className="text-white h-5 w-5" /></div>
                <div>
                  <p className="text-leather-200 text-xs uppercase tracking-wider">Industry</p>
                  <p className="text-white font-bold text-lg">Mfg & Export</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>





      {/* 5.5 Live Attendance Monitoring (Admin Only) */}
      {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          <div className="bg-leather-800 px-6 py-4 border-b border-leather-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Clock className="text-white h-5 w-5" />
              <h3 className="text-lg font-bold text-white tracking-wide">Live Attendance Monitoring</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-xs text-leather-200 font-medium uppercase tracking-wider">Live Updates</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-medium">Employee</th>
                  <th className="px-6 py-3 font-medium">Emp ID</th>
                  <th className="px-6 py-3 font-medium">Dept</th>
                  <th className="px-6 py-3 font-medium">Check In</th>
                  <th className="px-6 py-3 font-medium">Check Out</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Mins Late</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {liveAttendance.length === 0 ? (
                  <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">No attendance records for today yet.</td></tr>
                ) : (
                  liveAttendance.map(record => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{record.employee.name}</td>
                      <td className="px-6 py-4 font-mono text-gray-500 text-xs">EMP{String(record.employee.id).padStart(3, '0')}</td>
                      <td className="px-6 py-4 text-gray-600">{record.employee.department}</td>
                      <td className="px-6 py-4 font-mono font-medium text-leather-700">{record.checkInTime || '-'}</td>
                      <td className="px-6 py-4 font-mono text-gray-600">{record.checkOutTime || '-'}</td>
                      <td className="px-6 py-4">
                        {record.status === 'PRESENT' && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">Present</span>}
                        {record.status === 'LATE' && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">Late</span>}
                        {record.status === 'VERY_LATE' && <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold">Very Late</span>}
                        {record.status === 'ABSENT' && <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">Absent</span>}
                      </td>
                      <td className="px-6 py-4 font-bold">
                        <span className={record.minutesLate > 0 ? 'text-red-500' : 'text-gray-400'}>{record.minutesLate}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Dashboard Notification Counters */}
      {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="grid grid-cols-2 md:grid-cols-5 gap-4">

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase">New Enquiries</p>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-black text-purple-600">{enquiries.filter(e => e.status === 'PENDING').length}</h3>
              <Mail className="text-purple-200" size={28} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase">Pending Leaves</p>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-black text-amber-600">{allLeaves.filter(l => l.status === 'PENDING').length}</h3>
              <Calendar className="text-amber-200" size={28} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase">Present Today</p>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-black text-green-600">{liveAttendance.filter(a => a.status === 'PRESENT').length}</h3>
              <Users className="text-green-200" size={28} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase">Late Today</p>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-black text-orange-500">{liveAttendance.filter(a => a.status === 'LATE' || a.status === 'VERY_LATE').length}</h3>
              <Clock className="text-orange-200" size={28} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase">Checked Out</p>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-black text-blue-600">{liveAttendance.filter(a => a.checkOutTime !== null).length}</h3>
              <LogOut className="text-blue-200" size={28} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase">Inactive Staff</p>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-black text-red-600">{allEmployees.filter(e => e.status === 'INACTIVE').length}</h3>
              <Users className="text-red-200" size={28} />
            </div>
          </div>
        </motion.div>
      )}



      {/* 8. Recent Completed Orders Section */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-leather-50">
          <h3 className="text-lg font-bold text-gray-800">Recent Completed Orders</h3>
        </div>
        <div className="p-6 space-y-6">



          {/* Dynamic Orders from Database */}
          {completedOrders.length > 0 && completedOrders.slice(0, 3).map((order) => (
            <div key={order.id} className="bg-green-50 border border-green-100 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <span className="text-sm font-bold text-green-800 uppercase tracking-wider">Delivered</span>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    Completed: {order.actualDeliveryDate || (order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'Recently')}
                  </span>
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">{order.productName || 'Custom Product'}</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Client: <strong>{order.companyName}</strong> ({order.orderNumber})
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-white px-4 py-2 rounded-lg border border-green-200">
                    <p className="text-xs text-gray-500 uppercase font-bold">Quantity</p>
                    <p className="text-xl font-black text-green-700">{order.quantity}</p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border border-green-200">
                    <p className="text-xs text-gray-500 uppercase font-bold">Category</p>
                    <p className="text-sm font-bold text-gray-800 mt-1">{order.productCategory}</p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="text-xs text-right text-gray-500 font-bold">100% Completed</p>
              </div>

              {/* Display the first uploaded image, or a placeholder */}
              <div
                onClick={() => order.images && order.images.length > 0 ? openLightbox(0, order.images.map(img => getImageUrl(img.imageUrl))) : null}
                className="w-full md:w-64 h-56 bg-white rounded-lg shadow-sm border border-green-100 overflow-hidden relative cursor-pointer group flex items-center justify-center"
              >
                {order.images && order.images.length > 0 ? (
                  <>
                    <img src={getImageUrl(order.images[0].imageUrl)} alt={order.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Package className="text-white mb-2" size={32} />
                      <span className="text-white font-bold bg-black/60 px-4 py-2 rounded-full">View Gallery ({order.images.length})</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-400 p-4">
                    <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                    <span className="text-sm font-bold">No images uploaded</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* --- MODALS --- */}

      {/* Barking Bags Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm">
          <button onClick={closeLightbox} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-50">
            <X size={36} />
          </button>
          <button onClick={prevImage} className="absolute left-2 md:left-10 text-white/50 hover:text-white transition-colors z-50 p-2">
            <ChevronLeft size={48} />
          </button>
          <div
            className="w-full h-full max-w-5xl px-12 md:px-24 flex flex-col items-center justify-center select-none"
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEndBarkingBags}
          >
            <div className="text-white/80 text-center mb-6 text-sm font-semibold tracking-[0.2em] bg-black/40 px-4 py-2 rounded-full">
              IMAGE {currentImageIndex + 1} / {lightboxImages.length}
            </div>
            <motion.img
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
              src={lightboxImages[currentImageIndex]}
              alt="Showcase"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
              draggable="false"
            />
          </div>
          <button onClick={nextImage} className="absolute right-2 md:right-10 text-white/50 hover:text-white transition-colors z-50 p-2">
            <ChevronRight size={48} />
          </button>
        </div>
      )}



    </div>
  );
};

export default Dashboard;
