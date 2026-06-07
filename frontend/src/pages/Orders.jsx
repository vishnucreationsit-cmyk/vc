import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Package, Plus, Search, Filter, Eye, Edit, Trash2, 
  Upload, CheckCircle, Clock, AlertTriangle, Image as ImageIcon,
  X, Save, BarChart3, TrendingUp, Calendar, ChevronRight, ChevronLeft, Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = 'http://localhost:8080/api/orders';

const STATUS_STEPS = [
  'Order Received', 'Design Approval', 'Raw Material Procurement', 
  'Cutting', 'Stitching', 'Finishing', 'Quality Check', 
  'Packaging', 'Ready for Dispatch', 'Out for Delivery', 'Delivered'
];

const COMPANIES = ['BMW', 'Calvin Klein', 'Coach', 'Tommy Hilfiger', 'Fossil', 'Guess', 'Other'];
const CATEGORIES = ['Bag', 'Wallet', 'Belt', 'Leather Accessories', 'Custom Product'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modals state
  const [showForm, setShowForm] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  
  const [currentOrder, setCurrentOrder] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    customCompanyName: '',
    clientContactPerson: '',
    mobileNumber: '',
    email: '',
    productName: '',
    productCategory: 'Bag',
    quantity: 1,
    unitPrice: 0,
    totalValue: 0,
    orderDate: new Date().toISOString().split('T')[0],
    productionStartDate: '',
    expectedDeliveryDate: '',
    actualDeliveryDate: '',
    priority: 'Medium',
    description: ''
  });

  // Tracking State
  const [trackingStatus, setTrackingStatus] = useState('');
  const [trackingProgress, setTrackingProgress] = useState(0);

  // Gallery State
  const [images, setImages] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadType, setUploadType] = useState('Sample');
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE_URL);
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // METRICS
  // ----------------------------------------------------
  const totalOrders = orders.length;
  const inProgress = orders.filter(o => o.status !== 'Delivered').length;
  const delivered = orders.filter(o => o.status === 'Delivered').length;
  const urgentOrders = orders.filter(o => o.priority === 'Urgent' && o.status !== 'Delivered').length;
  const delayedOrders = orders.filter(o => {
    if (o.status === 'Delivered' || !o.expectedDeliveryDate) return false;
    return new Date(o.expectedDeliveryDate) < new Date();
  }).length;

  // ----------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'quantity' || name === 'unitPrice') {
        updated.totalValue = updated.quantity * updated.unitPrice;
      }
      return updated;
    });
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.companyName === 'Other') {
        payload.companyName = payload.customCompanyName;
      }
      
      // Fix for empty dates crashing backend parser
      if (!payload.productionStartDate) payload.productionStartDate = null;
      if (!payload.expectedDeliveryDate) payload.expectedDeliveryDate = null;
      if (!payload.actualDeliveryDate) payload.actualDeliveryDate = null;
      if (!payload.orderDate) payload.orderDate = null;
      
      if (currentOrder?.id) {
        await axios.put(`${API_BASE_URL}/${currentOrder.id}`, payload);
      } else {
        await axios.post(API_BASE_URL, payload);
      }
      setShowForm(false);
      fetchOrders();
    } catch (err) {
      console.error("Error saving order", err);
      alert("Failed to save order: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this order?")) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        fetchOrders();
      } catch (err) {
        alert("Failed to delete order");
      }
    }
  };

  const openTracking = (order) => {
    setCurrentOrder(order);
    setTrackingStatus(order.status || 'Order Received');
    setTrackingProgress(order.progressPercentage || 0);
    setShowTracking(true);
  };

  const updateTracking = async () => {
    try {
      await axios.put(`${API_BASE_URL}/${currentOrder.id}/status`, {
        status: trackingStatus,
        progressPercentage: trackingProgress
      });
      setShowTracking(false);
      fetchOrders();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const openGallery = (order) => {
    setCurrentOrder(order);
    setImages(order.images || []);
    setShowGallery(true);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFiles.length) return;
    
    const formDataUpload = new FormData();
    for (let i = 0; i < uploadFiles.length; i++) {
      formDataUpload.append('files', uploadFiles[i]);
    }
    formDataUpload.append('imageType', uploadType);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/${currentOrder.id}/images`, formDataUpload, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      setImages([...images, ...res.data]);
      setUploadFiles([]);
      fetchOrders(); // refresh main list
    } catch (err) {
      console.error("Upload error details:", err.response || err);
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    }
  };

  // ----------------------------------------------------
  // RENDER HELPERS
  // ----------------------------------------------------
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.productName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || o.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-leather-600" /> Order Management
          </h1>
          <p className="text-gray-500">Track production, manage clients, and oversee leather manufacturing orders.</p>
        </div>
        <button 
          onClick={() => {
            setCurrentOrder(null);
            setFormData({
              companyName: 'BMW', customCompanyName: '', clientContactPerson: '', mobileNumber: '', email: '',
              productName: '', productCategory: 'Bag', quantity: 1, unitPrice: 0, totalValue: 0,
              orderDate: new Date().toISOString().split('T')[0], productionStartDate: '', expectedDeliveryDate: '', actualDeliveryDate: '', priority: 'Medium', description: ''
            });
            setShowForm(true);
          }}
          className="bg-leather-800 hover:bg-leather-900 text-white px-5 py-2.5 rounded-xl font-medium shadow-md flex items-center gap-2 transition-all"
        >
          <Plus size={18} /> New Order
        </button>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Orders', value: totalOrders, icon: <BarChart3 className="text-blue-500" />, bg: 'bg-blue-50' },
          { label: 'In Progress', value: inProgress, icon: <TrendingUp className="text-orange-500" />, bg: 'bg-orange-50' },
          { label: 'Delivered', value: delivered, icon: <CheckCircle className="text-green-500" />, bg: 'bg-green-50' },
          { label: 'Delayed', value: delayedOrders, icon: <Clock className="text-red-500" />, bg: 'bg-red-50' },
          { label: 'Urgent', value: urgentOrders, icon: <AlertTriangle className="text-purple-500" />, bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-full ${stat.bg}`}>{stat.icon}</div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" placeholder="Search orders, company, products..." 
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-leather-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={18} className="text-gray-500" />
            <select 
              value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto py-2 px-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-leather-500 outline-none bg-white"
            >
              <option value="All">All Statuses</option>
              {STATUS_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold text-center">Image</th>
                <th className="p-4 font-semibold">Company & Product</th>
                <th className="p-4 font-semibold">Timeline</th>
                <th className="p-4 font-semibold">Status & Progress</th>
                <th className="p-4 font-semibold">Priority</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No orders found.</td></tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-leather-700">{order.orderNumber}</td>
                    <td className="p-4">
                      <div 
                        className="w-12 h-12 mx-auto rounded-lg bg-gray-100 overflow-hidden cursor-pointer flex items-center justify-center border border-gray-200 hover:border-leather-400 transition-all"
                        onClick={() => openGallery(order)}
                        title="View Gallery"
                      >
                        {order.images && order.images.length > 0 ? (
                          <img src={`http://localhost:8080${order.images[0].imageUrl}`} alt="thumb" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-800">{order.companyName}</p>
                      <p className="text-sm text-gray-500">{order.productName} ({order.quantity} units)</p>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <p><span className="text-gray-400">Start:</span> {order.productionStartDate || 'Not set'}</p>
                      <p><span className="text-gray-400">Due:</span> {order.expectedDeliveryDate || 'Not set'}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">{order.status || 'Order Received'}</p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-leather-600 h-1.5 rounded-full" style={{ width: `${order.progressPercentage || 0}%` }}></div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getPriorityColor(order.priority)}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <button onClick={() => openTracking(order)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg tooltip" title="Update Status"><Truck size={18} /></button>
                      <button onClick={() => openGallery(order)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg tooltip" title="Images"><ImageIcon size={18} /></button>
                      <button onClick={() => {
                        setCurrentOrder(order);
                        setFormData({...order, customCompanyName: order.companyName});
                        setShowForm(true);
                      }} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg tooltip" title="Edit"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(order.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg tooltip" title="Delete"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================= */}
      {/* MODAL: ORDER FORM                         */}
      {/* ========================================= */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800">{currentOrder ? 'Edit Order' : 'Create New Order'}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <form id="orderForm" onSubmit={submitOrder} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Client Info */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-sm font-bold text-leather-800 uppercase tracking-wider border-b pb-2">Client Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <select name="companyName" value={formData.companyName} onChange={handleFormChange} className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-leather-500">
                          {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {formData.companyName === 'Other' && (
                          <input type="text" name="customCompanyName" placeholder="Enter Company Name" value={formData.customCompanyName} onChange={handleFormChange} className="w-full mt-2 p-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-leather-500" required />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                        <input type="text" name="clientContactPerson" value={formData.clientContactPerson} onChange={handleFormChange} className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-leather-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                        <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleFormChange} className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-leather-500" />
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-4 md:col-span-2 mt-2">
                    <h3 className="text-sm font-bold text-leather-800 uppercase tracking-wider border-b pb-2">Product Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input type="text" name="productName" value={formData.productName} onChange={handleFormChange} required className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-leather-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select name="productCategory" value={formData.productCategory} onChange={handleFormChange} className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-leather-500">
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-1/3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Qty</label>
                          <input type="number" min="1" name="quantity" value={formData.quantity} onChange={handleFormChange} required className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-leather-500" />
                        </div>
                        <div className="w-2/3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (₹)</label>
                          <input type="number" min="0" step="0.01" name="unitPrice" value={formData.unitPrice} onChange={handleFormChange} className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-leather-500" />
                        </div>
                      </div>
                      <div className="md:col-span-3">
                        <p className="text-right font-bold text-leather-700 text-lg bg-leather-50 p-3 rounded-lg border border-leather-100">
                          Total Value: ₹{(formData.quantity * formData.unitPrice).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline & Meta */}
                  <div className="space-y-4 md:col-span-2 mt-2">
                    <h3 className="text-sm font-bold text-leather-800 uppercase tracking-wider border-b pb-2">Timeline & Priority</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                        <input type="date" name="orderDate" value={formData.orderDate} onChange={handleFormChange} required className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-leather-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input type="date" name="productionStartDate" value={formData.productionStartDate} onChange={handleFormChange} className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-leather-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input type="date" name="expectedDeliveryDate" value={formData.expectedDeliveryDate} onChange={handleFormChange} className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-leather-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select name="priority" value={formData.priority} onChange={handleFormChange} className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-leather-500">
                          {PRIORITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description / Special Instructions</label>
                    <textarea name="description" value={formData.description} onChange={handleFormChange} rows="3" className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-leather-500"></textarea>
                  </div>
                  
                </form>
              </div>
              <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" form="orderForm" className="bg-leather-800 hover:bg-leather-900 text-white px-6 py-2 rounded-lg font-medium shadow-md flex items-center gap-2 transition-all">
                  <Save size={18} /> Save Order
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================= */}
      {/* MODAL: STATUS TRACKING                    */}
      {/* ========================================= */}
      <AnimatePresence>
        {showTracking && currentOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800">Track Order {currentOrder.orderNumber}</h2>
                <button onClick={() => setShowTracking(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Update Production Stage</label>
                  <select 
                    value={trackingStatus} 
                    onChange={e => {
                      setTrackingStatus(e.target.value);
                      const idx = STATUS_STEPS.indexOf(e.target.value);
                      setTrackingProgress(Math.round(((idx + 1) / STATUS_STEPS.length) * 100));
                    }}
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-leather-500 bg-gray-50 font-medium"
                  >
                    {STATUS_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-gray-700">Completion Progress</label>
                    <span className="font-bold text-leather-700">{trackingProgress}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={trackingProgress} 
                    onChange={e => setTrackingProgress(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-leather-600"
                  />
                </div>

                <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = STATUS_STEPS.indexOf(trackingStatus) > idx;
                    const isCurrent = STATUS_STEPS.indexOf(trackingStatus) === idx;
                    return (
                      <div key={step} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-2">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-blue-500 text-white animate-pulse' : ''}`}>
                          {isCompleted ? <CheckCircle size={20} /> : isCurrent ? <Clock size={20} /> : <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                        <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-2 rounded-lg border ${isCurrent ? 'border-blue-200 bg-blue-50 font-bold text-blue-800' : isCompleted ? 'border-green-100 bg-green-50 text-green-800' : 'border-gray-100 bg-white text-gray-400'}`}>
                          <p className="text-sm">{step}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setShowTracking(false)} className="px-5 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={updateTracking} className="bg-leather-800 hover:bg-leather-900 text-white px-6 py-2 rounded-lg font-medium shadow-md flex items-center gap-2 transition-all">
                  <Save size={18} /> Update Status
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================= */}
      {/* MODAL: IMAGE GALLERY                      */}
      {/* ========================================= */}
      <AnimatePresence>
        {showGallery && currentOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><ImageIcon className="text-leather-600"/> Gallery: {currentOrder.orderNumber} ({currentOrder.productName})</h2>
                <button onClick={() => setShowGallery(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>
              
              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar for Upload */}
                <div className="w-80 border-r border-gray-100 bg-gray-50 p-6 flex flex-col gap-6 overflow-y-auto">
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">Upload New Image</h3>
                    <form onSubmit={handleFileUpload} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image Type</label>
                        <select value={uploadType} onChange={e=>setUploadType(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-leather-500">
                          <option value="Sample">Product Sample</option>
                          <option value="Production">Production Progress</option>
                          <option value="Finished">Finished Product</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Files</label>
                        <input type="file" multiple accept="image/*" onChange={e=>setUploadFiles(e.target.files)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-leather-50 file:text-leather-700 hover:file:bg-leather-100 cursor-pointer"/>
                      </div>
                      <button type="submit" disabled={!uploadFiles.length} className="w-full bg-leather-800 hover:bg-leather-900 text-white py-2.5 rounded-xl font-medium shadow-md flex justify-center items-center gap-2 disabled:opacity-50 transition-all">
                        <Upload size={18} /> Upload Images
                      </button>
                    </form>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-bold text-gray-800 mb-3">Order Details</h3>
                    <div className="text-sm space-y-2 text-gray-600">
                      <p><span className="font-medium text-gray-800">Company:</span> {currentOrder.companyName}</p>
                      <p><span className="font-medium text-gray-800">Quantity:</span> {currentOrder.quantity}</p>
                      <p><span className="font-medium text-gray-800">Status:</span> {currentOrder.status}</p>
                      <p><span className="font-medium text-gray-800">Total Images:</span> {images.length}</p>
                    </div>
                  </div>
                </div>

                {/* Main Gallery Area */}
                <div className="flex-1 bg-gray-900 p-6 flex flex-col">
                  {images.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                      <ImageIcon size={64} className="mb-4 opacity-50" />
                      <p className="text-xl font-medium">No images uploaded yet.</p>
                      <p>Use the sidebar to upload production images.</p>
                    </div>
                  ) : (
                    <>
                      {/* Main Viewer */}
                      <div className="flex-1 relative flex items-center justify-center mb-6 group/viewer">
                        <img 
                          src={`http://localhost:8080${images[galleryIndex].imageUrl}`} 
                          alt="Order" 
                          className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                        />
                        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-md">
                          {images[galleryIndex].imageType}
                        </div>
                        
                        <button 
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this image?')) {
                              try {
                                await axios.delete(`http://localhost:8080/api/orders/images/${images[galleryIndex].id}`);
                                const newImages = images.filter((_, i) => i !== galleryIndex);
                                setImages(newImages);
                                // Update orders list so thumbnail on dashboard refreshes
                                setOrders(orders.map(o => o.id === currentOrder.id ? { ...o, images: newImages } : o));
                                if (galleryIndex > 0) setGalleryIndex(galleryIndex - 1);
                              } catch (err) { alert('Failed to delete image.'); }
                            }
                          }}
                          className="absolute top-4 left-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg opacity-0 group-hover/viewer:opacity-100 transition-all cursor-pointer z-50"
                          title="Delete Image"
                        >
                          <Trash2 size={20} />
                        </button>
                        
                        <button 
                          onClick={() => setGalleryIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black text-white p-3 rounded-full transition-all backdrop-blur-sm"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button 
                          onClick={() => setGalleryIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black text-white p-3 rounded-full transition-all backdrop-blur-sm"
                        >
                          <ChevronRight size={24} />
                        </button>
                      </div>
                      
                      {/* Thumbnails */}
                      <div className="h-24 flex gap-3 overflow-x-auto custom-scrollbar pb-2">
                        {images.map((img, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setGalleryIndex(idx)}
                            className={`flex-shrink-0 w-24 h-full rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${galleryIndex === idx ? 'border-leather-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                          >
                            <img src={`http://localhost:8080${img.imageUrl}`} alt="thumb" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Orders;
