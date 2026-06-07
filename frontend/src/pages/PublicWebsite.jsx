import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Phone, Mail, MapPin, Search, Menu, X, ArrowRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BrandCard = ({ brand }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-xl aspect-[3/2] flex flex-col items-center justify-center p-6 hover:shadow-md transition-all hover:-translate-y-1 group">
      {hasError ? (
        <span className="font-black text-gray-800 tracking-wider uppercase text-center group-hover:text-leather-600 transition-colors">
          {brand.name}
        </span>
      ) : (
        <img
          src={brand.file.startsWith('http') ? brand.file : `/logos/${brand.file}`}
          alt={brand.name}
          className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all duration-300"
          onError={() => {
            console.warn(`Warning: Missing brand logo for ${brand.name}`);
            setHasError(true);
          }}
        />
      )}
    </div>
  );
};

const PublicWebsite = () => {
  const [contactConfig, setContactConfig] = useState({ phone: '+91 90031 81819', email: 'contact@vishnucreations.com' });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(import.meta.env.VITE_API_URL + '/api/config/contact').then(res => {
      if (res.data) setContactConfig(res.data);
    }).catch(() => { });
  }, []);

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(import.meta.env.VITE_API_URL + '/api/enquiries', {
        name: e.target.name.value,
        email: e.target.email.value,
        phone: e.target.phone.value,
        message: e.target.message.value
      });
      alert("Your enquiry has been submitted successfully.");
      e.target.reset();
    } catch (err) {
      const errorMessage = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : null) || err.message || "Error submitting enquiry.";
      alert(errorMessage);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 font-inter text-gray-800">
      {/* Navigation */}
      <nav className="bg-[#1a120c] text-white py-4 px-6 md:px-12 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-black tracking-tight">Vishnu <span className="text-leather-400">Creations</span></div>
          <div className="hidden md:flex gap-8 text-sm font-bold tracking-wide">
            <a href="#home" className="hover:text-leather-400 transition-colors">HOME</a>
            <a href="#about" className="hover:text-leather-400 transition-colors">ABOUT US</a>
            <a href="#products" className="hover:text-leather-400 transition-colors">PRODUCTS</a>
            <a href="#brands" className="hover:text-leather-400 transition-colors">BRANDS</a>
            <a href="#contact" className="hover:text-leather-400 transition-colors">CONTACT</a>
          </div>
          <div className="flex gap-4 items-center">
            <Link to="/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors hidden md:block">Staff Login</Link>
            <button className="md:hidden text-white"><Menu /></button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="bg-[#1a120c] text-white pt-20 pb-32 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-leather-800/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center md:text-left grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">Premium Leather <br /><span className="text-leather-400">Craftsmanship</span></h1>
            <p className="text-xl text-gray-300 mb-8 max-w-lg mx-auto md:mx-0">Established in 2010. We manufacture high-quality leather bags, wallets, belts, and custom products for global brands.</p>
            <div className="flex gap-4 justify-center md:justify-start">
              <a href="#products" className="bg-leather-600 hover:bg-leather-500 text-white font-bold py-3 px-8 rounded-full transition-colors">View Collection</a>
              <a href="#contact" className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-full transition-colors border border-white/10">Get In Touch</a>
            </div>
          </div>
          <div className="hidden md:block">
            {/* Visual Placeholder */}
            <div className="w-full aspect-square rounded-3xl bg-gradient-to-br from-leather-800/40 to-black/40 border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-50 mix-blend-overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="w-full aspect-[4/5] rounded-3xl bg-gray-100 overflow-hidden shadow-lg">
              <img src="https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover" alt="Craftsmanship" />
            </div>
            <div className="absolute -bottom-8 -right-8 bg-[#1a120c] text-white p-8 rounded-2xl shadow-xl max-w-xs">
              <p className="text-4xl font-black text-leather-400 mb-2">14+</p>
              <p className="text-sm font-bold uppercase tracking-wide">Years of Excellence</p>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <span className="text-leather-600 font-bold tracking-widest uppercase mb-2 block">Company Overview</span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-900">Crafting perfection since 2010.</h2>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              Founded by <strong>Ch Satish</strong>, Vishnu Creations began with a simple mission: to provide unparalleled quality in custom leather manufacturing. Over the past decade, we have grown from a small workshop into a premier manufacturing hub.
            </p>
            <ul className="space-y-4 mb-8">
              {['State-of-the-art manufacturing facility', 'Ethically sourced premium materials', 'Expert craftsmen with decades of experience', 'End-to-end design and production services'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle className="text-leather-500 flex-shrink-0" size={20} /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Products & Gallery */}
      <section id="products" className="py-24 px-6 md:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-leather-600 font-bold tracking-widest uppercase mb-2 block">Our Expertise</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">Premium Products</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Leather Bags', img: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=600&auto=format&fit=crop' },
              { name: 'Wallets & Accessories', img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=600&auto=format&fit=crop' },
              { name: 'Custom Belts', img: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=600&auto=format&fit=crop' }
            ].map((prod, i) => (
              <div key={i} className="group relative rounded-3xl overflow-hidden shadow-md aspect-square">
                <img src={prod.img} alt={prod.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-2xl font-bold text-white">{prod.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section id="brands" className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-gray-400 font-bold tracking-[0.2em] uppercase mb-4 block text-sm">
            Trusted Manufacturing Partner For
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">Leading Global Brands</h2>
          <p className="text-gray-500 mb-16 max-w-2xl mx-auto">
            Delivering premium leather products for internationally recognized brands since 2010.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: 'BMW', file: 'https://logo.clearbit.com/bmw.com' },
              { name: 'Calvin Klein', file: 'https://logo.clearbit.com/calvinklein.us' },
              { name: 'Coach', file: 'https://logo.clearbit.com/coach.com' },
              { name: 'Hidesign', file: 'https://logo.clearbit.com/hidesign.com' },
              { name: 'Nappa Dori', file: 'https://logo.clearbit.com/nappadori.com' },
              { name: 'Louis Vuitton', file: 'https://logo.clearbit.com/louisvuitton.com' }
            ].map((brand, i) => {
              return (
                <BrandCard key={i} brand={brand} />
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#1a120c] rounded-[2.5rem] overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-leather-800/30 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
            <div className="grid md:grid-cols-2 gap-12 p-10 md:p-16 relative z-10">
              <div>
                <span className="text-leather-300 text-sm font-bold tracking-widest uppercase mb-2 block">Get In Touch</span>
                <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">Partner with us today.</h2>
                <p className="text-leather-200 mb-10 max-w-md text-lg leading-relaxed">
                  Looking for a reliable manufacturing partner? Let's discuss your custom requirements and bring your designs to life.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-leather-100">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm"><Phone size={24} className="text-leather-300" /></div>
                    <span className="text-xl font-medium">{contactConfig.phone}</span>
                  </div>
                  <div className="flex items-center gap-4 text-leather-100">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm"><Mail size={24} className="text-leather-300" /></div>
                    <span className="text-xl font-medium">{contactConfig.email}</span>
                  </div>
                  <div className="flex items-center gap-4 text-leather-100">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm"><MapPin size={24} className="text-leather-300" /></div>
                    <span className="text-xl font-medium">Leather Industry Estate, Manufacturing Hub, Chennai</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/10">
                <h3 className="text-2xl font-bold mb-8 text-white">Send an Inquiry</h3>
                <form className="space-y-5" onSubmit={handleEnquirySubmit}>
                  <input name="name" type="text" required placeholder="Your Name" defaultValue={localStorage.getItem('visitorName') || ''} className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-leather-400 transition-colors" />
                  <input name="email" type="email" required placeholder="Email Address" className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-leather-400 transition-colors" />
                  <input name="phone" type="tel" required placeholder="Phone Number" className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-leather-400 transition-colors" />
                  <textarea name="message" required placeholder="Tell us about your product requirements..." rows="4" className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-leather-400 transition-colors"></textarea>
                  <button type="submit" className="w-full bg-leather-500 hover:bg-leather-400 text-white font-bold py-4 rounded-xl transition-colors shadow-lg">
                    Submit Inquiry
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 text-center text-gray-500 text-sm font-medium">
        <p>&copy; {new Date().getFullYear()} Vishnu Creations. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PublicWebsite;
