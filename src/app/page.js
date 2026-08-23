"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Recycle,
  Menu,
  X,
  MapPin,
  Scan,
  Trash2,
  Check,
  PieChart,
  Truck,
  ArrowRight,
  ArrowDown,
  User,
  XCircle,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Wand2,
  Navigation,
  TrendingUp,
  Users,
  Building2,
  Leaf,
} from "lucide-react";

import {
  FaTwitter,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa";

const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    :root {
      --brand-dark: #0B2E1F;
      --brand-primary: #10B981;
      --brand-secondary: #059669;
      --brand-surface: #F8FAFC;
      --brand-charcoal: #1E293B;
      --brand-slate: #64748B;
      --brand-light: #ECFDF5;
    }

    /* Custom Color Utilities */
    .bg-brand-dark { background-color: var(--brand-dark); }
    .bg-brand-primary { background-color: var(--brand-primary); }
    .bg-brand-secondary { background-color: var(--brand-secondary); }
    .bg-brand-surface { background-color: var(--brand-surface); }
    .bg-brand-light { background-color: var(--brand-light); }
    
    .text-brand-dark { color: var(--brand-dark); }
    .text-brand-primary { color: var(--brand-primary); }
    .text-brand-secondary { color: var(--brand-secondary); }
    .text-brand-charcoal { color: var(--brand-charcoal); }
    .text-brand-slate { color: var(--brand-slate); }
    
    .border-brand-primary { border-color: var(--brand-primary); }
    .border-brand-secondary { border-color: var(--brand-secondary); }
    .border-brand-dark { border-color: var(--brand-dark); }

    /* Custom Animations */
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-float-delayed { animation: float 6s ease-in-out 3s infinite; }

    @keyframes scan {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    }
    .animate-scan { animation: scan 2s linear infinite; }

    @keyframes pulse-slow {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .animate-pulse-slow { animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

    /* UI Patterns */
    .glass-nav {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(226, 232, 240, 0.6);
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
    }

    .bg-grid-pattern {
      background-image: linear-gradient(to right, rgba(100, 116, 139, 0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(100, 116, 139, 0.05) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    .bg-grid-dark {
      background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    html { scroll-behavior: smooth; }
    body {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .shadow-brand-primary-glow {
        box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.39);
    }
  `}} />
);

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'glass-nav shadow-sm bg-white/90' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white mr-3 shadow-lg shadow-brand-primary-glow">
              <Recycle size={24} />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-brand-dark">
                SmartWaste <span className="text-brand-primary">AI</span>
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-sm font-medium text-brand-charcoal hover:text-brand-primary transition-colors">Home</Link>
            <Link href="/citizen/find-bin" className="text-sm font-semibold text-brand-primary transition-colors">Find a Bin</Link>
            <Link href="/citizen/scan-waste" className="text-sm font-medium text-brand-slate hover:text-brand-primary transition-colors">AI Scanner</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-brand-slate hover:text-brand-primary transition-colors">How It Works</Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/citizen/login" className="text-sm font-medium text-brand-slate hover:text-brand-charcoal transition-colors">Login</Link>
            <Link href="/citizen/register" className="bg-brand-dark text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-black transition-colors shadow-md">
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-brand-charcoal hover:text-brand-primary p-2">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-base font-medium text-brand-charcoal hover:bg-gray-50 rounded-md">Home</Link>
            <Link href="/citizen/find-bin" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-base font-medium text-brand-slate hover:bg-gray-50 rounded-md">Find a Bin</Link>
            <Link href="/citizen/scan-waste" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-base font-medium text-brand-slate hover:bg-gray-50 rounded-md">AI Scanner</Link>
            <Link href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-base font-medium text-brand-slate hover:bg-gray-50 rounded-md">How It Works</Link>
            <div className="pt-4 flex flex-col space-y-3">
              <Link href="/citizen/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center px-4 py-3 border border-gray-300 rounded-lg text-brand-charcoal font-medium hover:bg-gray-50">Login</Link>
              <Link href="/citizen/register" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center px-4 py-3 bg-brand-dark text-white rounded-lg font-medium hover:bg-black">Get Started</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const Hero = () => (
  <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-grid-pattern">
    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-brand-primary/10 rounded-full blur-3xl -z-10"></div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Hero Content */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-4 py-2 mb-6 shadow-sm border border-gray-100">
            <span className="flex h-2 w-2 rounded-full bg-brand-primary animate-pulse"></span>
            <span className="text-xs font-semibold text-brand-slate tracking-wide uppercase">AI-Powered Civic Tech</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-brand-dark mb-6 leading-tight">
            Smarter Waste.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-emerald-400">Cleaner Cities.</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-brand-slate mb-10 leading-relaxed max-w-lg">
            Find the right bin, identify your waste with AI, and help build cleaner communities — all from one intelligent platform.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/citizen/find-bin" className="flex items-center justify-center bg-brand-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-brand-secondary transition-all shadow-brand-primary-glow hover:-translate-y-1">
              <MapPin className="mr-2" size={20} /> Find a Nearby Bin
            </Link>
            <Link href="/citizen/scan-waste" className="flex items-center justify-center bg-white text-brand-charcoal border border-gray-200 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:-translate-y-1">
              <Scan className="mr-2" size={20} /> Scan Your Waste
            </Link>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="relative h-[500px] lg:h-[600px] w-full rounded-3xl bg-slate-100 border border-white/50 shadow-2xl overflow-hidden flex items-center justify-center">
          {/* Abstract Map SVG */}
          <svg className="absolute inset-0 w-full h-full text-slate-200" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 0V600M250 0V600M400 0V600M550 0V600M700 0V600" stroke="currentColor" strokeWidth="2"/>
            <path d="M0 150H800M0 300H800M0 450H800" stroke="currentColor" strokeWidth="2"/>
            <path d="M150 450 C 300 450, 250 200, 450 250 S 600 350, 700 300" stroke="#10B981" strokeWidth="4" strokeDasharray="8 8" className="animate-pulse-slow"/>
          </svg>

          {/* Central Hub Element */}
          <div className="absolute z-10 p-4 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center animate-float">
            <div className="w-16 h-16 bg-brand-dark rounded-xl flex items-center justify-center text-white">
              <Trash2 size={32} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-brand-primary rounded-full border-4 border-white flex items-center justify-center">
              <Check className="text-white" size={12} strokeWidth={3} />
            </div>
          </div>

          {/* Floating Card 1 */}
          <div className="absolute top-1/4 left-10 lg:left-20 glass-card p-4 rounded-xl animate-float-delayed">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <Recycle size={18} />
              </div>
              <div>
                <p className="text-xs text-brand-slate font-medium">Nearby Bin</p>
                <p className="text-sm font-bold text-brand-dark">Recyclable</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-brand-slate">Distance</span>
              <span className="text-brand-primary">180 m</span>
            </div>
          </div>

          {/* Floating Card 2 */}
          <div className="absolute bottom-1/4 left-1/4 glass-card p-4 rounded-xl animate-float">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                <Scan size={18} />
              </div>
              <div>
                <p className="text-xs text-brand-slate font-medium">AI Detection</p>
                <p className="text-sm font-bold text-brand-dark">Aluminium Can</p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
              <div className="bg-purple-500 h-1.5 rounded-full w-[96%]"></div>
            </div>
            <p className="text-[10px] text-right text-brand-slate mt-1">96% confidence</p>
          </div>

          {/* Floating Card 3 */}
          <div className="absolute top-1/3 right-10 lg:right-20 glass-card p-4 rounded-xl animate-float-delayed" style={{ animationDelay: '1.5s' }}>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                <PieChart size={18} />
              </div>
              <div>
                <p className="text-xs text-brand-slate font-medium">Bin Status</p>
                <p className="text-sm font-bold text-brand-dark">72% Full</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
              <span className="text-xs text-brand-slate font-medium">Healthy</span>
            </div>
          </div>

          {/* Collection Vehicle Marker */}
          <div className="absolute top-[300px] right-[100px] w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-brand-dark animate-pulse-slow">
            <Truck className="text-brand-dark" size={20} />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const LivePreview = () => (
  <section className="py-12 bg-brand-surface relative z-20 -mt-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="lg:w-1/3">
          <h2 className="text-2xl font-bold text-brand-dark mb-2">Your city, connected.</h2>
          <p className="text-sm text-brand-slate mb-6">See nearby waste infrastructure, monitor bin status, and find the right place to dispose of your waste instantly.</p>
          <button className="text-brand-primary font-semibold flex items-center group">
            Find the nearest suitable bin 
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
          </button>
        </div>

        {/* Mini Map UI */}
        <div className="lg:w-2/3 w-full bg-slate-50 rounded-2xl h-48 relative overflow-hidden border border-gray-200">
          <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
          
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md z-10">
            <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75"></div>
          </div>

          <div className="absolute right-4 top-4 bottom-4 w-48 space-y-2 z-10 flex flex-col justify-center">
            <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center text-xs">
              <span className="flex items-center"><Trash2 size={12} className="text-gray-500 mr-2"/> General</span>
              <span className="text-gray-500 font-medium">150m</span>
            </div>
            <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center text-xs">
              <span className="flex items-center"><Recycle size={12} className="text-blue-500 mr-2"/> Recycle</span>
              <span className="text-brand-primary font-bold">280m</span>
            </div>
            <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center text-xs">
              <span className="flex items-center"><Trash2 size={12} className="text-green-600 mr-2"/> Glass</span>
              <span className="text-gray-500 font-medium">420m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const ProblemSolution = () => (
  <section className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl lg:text-4xl font-bold text-brand-dark mb-16">The right bin shouldn&apos;t be hard to find.</h2>
      
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
        {/* Before */}
        <div className="w-full lg:w-2/5 p-8 rounded-2xl bg-gray-50 border border-gray-100 opacity-80 filter grayscale transition-all duration-500 hover:grayscale-0 hover:opacity-100">
          <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <User size={32} className="text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-4">Before SmartWaste</h3>
          <ul className="text-gray-500 space-y-3 text-sm text-left mx-auto max-w-xs">
            <li className="flex items-center"><XCircle size={16} className="text-red-400 mr-2 flex-shrink-0" /> Unsure where to throw waste</li>
            <li className="flex items-center"><XCircle size={16} className="text-red-400 mr-2 flex-shrink-0" /> Bins are hidden or overflowing</li>
            <li className="flex items-center"><XCircle size={16} className="text-red-400 mr-2 flex-shrink-0" /> Results in littering & confusion</li>
          </ul>
        </div>

        {/* Arrow */}
        <div className="hidden lg:block text-brand-slate">
          <ArrowRight size={40} />
        </div>
        <div className="lg:hidden text-brand-slate">
          <ArrowDown size={40} />
        </div>

        {/* After */}
        <div className="w-full lg:w-2/5 p-8 rounded-2xl bg-brand-light border border-brand-primary/20 shadow-lg shadow-brand-primary-glow">
          <div className="h-16 w-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
            <CheckCircle size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-brand-dark mb-4">With SmartWaste AI</h3>
          <ul className="text-brand-charcoal space-y-3 text-sm text-left mx-auto max-w-xs">
            <li className="flex items-center"><CheckCircle size={16} className="text-brand-primary mr-2 flex-shrink-0" /> Scan waste for instant guidance</li>
            <li className="flex items-center"><CheckCircle size={16} className="text-brand-primary mr-2 flex-shrink-0" /> Navigate to nearest suitable bin</li>
            <li className="flex items-center"><CheckCircle size={16} className="text-brand-primary mr-2 flex-shrink-0" /> Dispose correctly and responsibly</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);

const Features = () => (
  <section className="py-24 bg-brand-surface border-y border-gray-100" id="features">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl lg:text-4xl font-bold text-brand-dark mb-4">Everything you need for smarter waste management.</h2>
        <p className="text-brand-slate">A comprehensive suite of tools designed to simplify disposal for citizens and optimize operations for cities.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Feature 1 */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-brand-primary/30 transition-all duration-300 group">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <MapPin size={24} />
          </div>
          <h3 className="text-lg font-bold text-brand-dark mb-3">Find Nearby Bins</h3>
          <p className="text-sm text-brand-slate mb-6 line-clamp-3">Locate the nearest suitable waste bin using your live location. Filter by general, recyclable, or hazardous waste.</p>
          <Link href="/citizen/find-bin" className="text-brand-primary font-semibold text-sm flex items-center group-hover:text-brand-secondary">
            Explore Map <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* Feature 2 */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-brand-primary/30 transition-all duration-300 group">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Scan size={24} />
          </div>
          <h3 className="text-lg font-bold text-brand-dark mb-3">AI Waste Scanner</h3>
          <p className="text-sm text-brand-slate mb-6 line-clamp-3">Identify waste instantly using your camera. Discover the correct category and proper way to dispose of it.</p>
          <Link href="/citizen/scan-waste" className="text-brand-primary font-semibold text-sm flex items-center group-hover:text-brand-secondary">
            Scan Waste <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* Feature 3 */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-brand-primary/30 transition-all duration-300 group">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <RefreshCw size={24} />
          </div>
          <h3 className="text-lg font-bold text-brand-dark mb-3">Recycle & Reuse</h3>
          <p className="text-sm text-brand-slate mb-6 line-clamp-3">Discover practical recycling, reuse, and safe upcycling ideas for everyday waste items you scan.</p>
          <Link href="/citizen/scan-waste" className="text-brand-primary font-semibold text-sm flex items-center group-hover:text-brand-secondary">
            Explore Ideas <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* Feature 4 */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-brand-primary/30 transition-all duration-300 group">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-brand-dark mb-3">Report & Improve</h3>
          <p className="text-sm text-brand-slate mb-6 line-clamp-3">Help your community by reporting overflowing, damaged, or missing bins directly to city authorities.</p>
          <Link href="/citizen/find-bin" className="text-brand-primary font-semibold text-sm flex items-center group-hover:text-brand-secondary">
            Report Issue <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const ScannerShowcase = () => (
  <section className="py-24 bg-white overflow-hidden" id="ai-scanner">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        {/* Phone UI Mockup */}
        <div className="relative mx-auto w-full max-w-[320px] lg:max-w-none lg:w-[400px] flex justify-center perspective-[1000px]">
          <div className="relative w-[300px] h-[600px] bg-gray-900 rounded-[3rem] border-[10px] border-gray-900 shadow-2xl overflow-hidden transform transition-transform hover:scale-[1.02] duration-500">
            <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-3xl w-40 mx-auto z-20"></div>
            
            <div className="relative w-full h-full bg-slate-200">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-40 bg-gray-200 rounded-xl shadow-inner border-2 border-gray-300 flex items-center justify-center">
                  <div className="w-16 h-8 bg-red-500/20 rounded-md"></div>
                </div>
              </div>
              
              <div className="absolute inset-0 bg-black/20 z-10"></div>
              
              <div className="absolute top-0 w-full h-1 bg-brand-primary shadow-[0_0_15px_3px_rgba(16,185,129,0.5)] z-20 animate-scan"></div>
              
              <div className="absolute top-1/4 left-8 w-12 h-12 border-t-2 border-l-2 border-white z-20"></div>
              <div className="absolute top-1/4 right-8 w-12 h-12 border-t-2 border-r-2 border-white z-20"></div>
              <div className="absolute bottom-1/4 left-8 w-12 h-12 border-b-2 border-l-2 border-white z-20"></div>
              <div className="absolute bottom-1/4 right-8 w-12 h-12 border-b-2 border-r-2 border-white z-20"></div>
              
              <div className="absolute top-8 w-full text-center z-20">
                <span className="bg-black/50 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full font-medium">Analyzing waste...</span>
              </div>

              <div className="absolute bottom-0 w-full bg-white rounded-t-3xl p-6 z-30 transform transition-transform duration-500 translate-y-0 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Aluminium Can</h4>
                    <p className="text-sm text-gray-500">96% confidence</p>
                  </div>
                  <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
                    Recyclable
                  </div>
                </div>
                <button className="w-full bg-brand-dark text-white py-3 rounded-xl font-semibold text-sm shadow-md">
                  Find Recycling Bin
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-xl">
          <div className="w-12 h-12 bg-brand-light text-brand-primary rounded-xl flex items-center justify-center mb-6">
            <Wand2 size={24} />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-brand-dark mb-6">Know exactly what your waste is.</h2>
          <p className="text-lg text-brand-slate mb-10 leading-relaxed">
            Not sure where something belongs? Let our computer vision AI identify the material instantly and guide you toward the right disposal option, eliminating wish-cycling.
          </p>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
              <span className="text-sm text-gray-500 font-medium">Detected Material</span>
              <span className="font-semibold text-gray-900">Aluminium</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
              <span className="text-sm text-gray-500 font-medium">Waste Category</span>
              <span className="font-semibold text-blue-600 flex items-center"><Recycle size={16} className="mr-1" /> Recyclable</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium">Nearest Suitable Bin</span>
              <span className="font-semibold text-brand-primary">180 m away</span>
            </div>
          </div>

          <Link href="/citizen/scan-waste" className="inline-flex items-center font-semibold text-brand-primary hover:text-brand-secondary text-lg group">
            Try AI Scanner <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const MapShowcase = () => (
  <section className="py-24 bg-brand-dark text-white overflow-hidden relative" id="find-bin">
    <div className="absolute inset-0 bg-grid-dark opacity-10"></div>
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        
        <div className="max-w-xl order-2 lg:order-1">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Never search for a dustbin again.</h2>
          <p className="text-lg text-gray-300 mb-10 leading-relaxed">
            SmartWaste uses your live location to map out the nearest public bins. Filter by waste type to ensure you&apos;re heading to the right place.
          </p>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-semibold text-brand-primary uppercase tracking-wider bg-brand-primary/10 px-2 py-1 rounded">Nearest Suitable Bin</span>
                <h4 className="text-xl font-bold mt-2">Recyclable Waste</h4>
              </div>
              <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center">
                <Recycle size={20} />
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-300 mb-6">
              <div className="flex items-center">
                <MapPin size={16} className="mr-2" /> 180 m
              </div>
              <div className="flex items-center">
                <Navigation size={16} className="mr-2" /> 2 min walk
              </div>
              <div className="flex items-center">
                <PieChart size={16} className="mr-2" /> 62% capacity
              </div>
            </div>

            <div className="flex space-x-3">
              <button className="flex-1 bg-brand-primary hover:bg-brand-secondary text-white py-3 rounded-xl font-semibold transition-colors">
                Navigate
              </button>
            </div>
          </div>
          
          <Link href="/citizen/find-bin" className="text-gray-400 hover:text-white text-sm font-medium flex items-center">
            View all nearby bins <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        <div className="order-1 lg:order-2 w-full h-[400px] lg:h-[500px] bg-[#1a1a2e] rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full text-white/5" viewBox="0 0 800 600" fill="none">
            <path d="M50 0V600M200 0V600M350 0V600M500 0V600M650 0V600" stroke="currentColor" strokeWidth="1"/>
            <path d="M0 100H800M0 250H800M0 400H800M0 550H800" stroke="currentColor" strokeWidth="1"/>
            <path d="M 200 400 L 250 350 L 400 350 L 450 250 L 550 200" stroke="#10B981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse-slow"/>
            <path d="M 200 400 L 250 350 L 400 350 L 450 250 L 550 200" stroke="rgba(16, 185, 137, 0.3)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          <div className="absolute top-[390px] left-[190px] w-5 h-5 bg-blue-500 rounded-full border-4 border-[#1a1a2e] shadow-[0_0_15px_rgba(59,130,246,0.8)] z-20"></div>

          <div className="absolute top-[180px] left-[530px] z-20 flex flex-col items-center">
            <div className="bg-white text-brand-dark px-3 py-1 rounded-lg text-xs font-bold mb-1 shadow-lg whitespace-nowrap">
              Recyclable • 180m
            </div>
            <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg">
              <Recycle size={16} />
            </div>
          </div>

          <div className="absolute top-[120px] left-[250px] w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white border-2 border-[#1a1a2e] opacity-50">
            <Trash2 size={12} />
          </div>
          <div className="absolute top-[450px] left-[500px] w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white border-2 border-[#1a1a2e] opacity-50">
            <Trash2 size={12} />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const IntelligenceDashboard = () => (
  <section className="py-24 bg-brand-surface border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl lg:text-4xl font-bold text-brand-dark mb-4">Behind every smart bin is smarter intelligence.</h2>
        <p className="text-brand-slate text-lg">SmartWaste helps cities understand waste patterns, predict overflow before it happens, and optimize collection operations dynamically.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="mx-auto text-xs font-medium text-gray-500">Municipality Dashboard</div>
        </div>
        
        <div className="p-8 grid lg:grid-cols-3 gap-8 bg-gray-50/50">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-gray-800">Bin Fill Prediction</h4>
              <TrendingUp size={20} className="text-brand-primary" />
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Current Capacity</span>
                  <span className="font-bold text-gray-800">72%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full w-[72%]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Predicted in 12h</span>
                  <span className="font-bold text-orange-500">88%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-orange-400 h-2 rounded-full w-[88%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Predicted in 24h</span>
                  <span className="font-bold text-red-500">97%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full w-[97%]"></div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-red-50 rounded-lg flex items-start">
              <AlertCircle size={16} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-red-700">Action Required</p>
                <p className="text-xs text-red-600">Collection recommended for Zone A.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 lg:col-span-2 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-gray-800">Active Collection Route</h4>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-semibold">AI Optimized</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 font-medium">Bins to Collect</p>
                <p className="text-2xl font-bold text-gray-900">14</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 font-medium">Est. Distance</p>
                <p className="text-2xl font-bold text-gray-900">8.7 <span className="text-sm font-normal text-gray-500">km</span></p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 font-medium">Est. Time</p>
                <p className="text-2xl font-bold text-gray-900">32 <span className="text-sm font-normal text-gray-500">min</span></p>
              </div>
              <div className="p-4 bg-brand-light rounded-xl border border-brand-primary/20">
                <p className="text-xs text-brand-secondary font-medium">Fuel Saved</p>
                <p className="text-2xl font-bold text-brand-primary">2.1 <span className="text-sm font-normal text-brand-secondary">km</span></p>
              </div>
            </div>

            <div className="w-full h-24 bg-slate-100 rounded-xl relative overflow-hidden flex items-center justify-center border border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                <div className="w-16 h-1 bg-brand-primary rounded-full"></div>
                <div className="w-4 h-4 bg-brand-primary rounded-full border-2 border-white"></div>
                <div className="w-16 h-1 bg-brand-primary rounded-full"></div>
                <div className="w-4 h-4 bg-brand-primary rounded-full border-2 border-white"></div>
                <div className="w-16 h-1 bg-gray-300 rounded-full border border-dashed border-gray-400"></div>
                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const HowItWorks = () => (
  <section className="py-24 bg-white" id="how-it-works">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-4xl font-bold text-brand-dark mb-4">From waste to smarter action.</h2>
        <p className="text-brand-slate">Four simple steps to a cleaner environment.</p>
      </div>

      <div className="relative">
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>

        <div className="grid md:grid-cols-4 gap-8 relative z-10">
          {[
            { step: '01', title: 'Scan', desc: 'Identify your waste using our AI camera scanner.', active: false },
            { step: '02', title: 'Understand', desc: 'Get the correct disposal or recycling recommendation.', active: false },
            { step: '03', title: 'Locate', desc: 'Find the nearest suitable bin on the live map.', active: true },
            { step: '04', title: 'Dispose', desc: 'Navigate there and dispose of it responsibly.', active: false }
          ].map((item, idx) => (
            <div key={idx} className="text-center relative bg-white p-4">
              <div className={`w-16 h-16 mx-auto border-2 rounded-2xl flex items-center justify-center text-xl font-bold mb-6 ${
                item.active 
                  ? 'bg-brand-light border-brand-primary text-brand-primary shadow-lg shadow-brand-primary-glow' 
                  : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}>
                {item.step}
              </div>
              <h4 className="text-lg font-bold text-brand-dark mb-2">{item.title}</h4>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const Stats = () => (
  <section className="py-20 bg-brand-surface">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl lg:text-3xl font-bold text-center text-brand-dark mb-12">Small actions. City-wide impact.</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-200">
        <div className="text-center px-4">
          <p className="text-4xl lg:text-5xl font-bold text-brand-primary mb-2">1,248<span className="text-2xl">+</span></p>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Smart Bins</p>
        </div>
        <div className="text-center px-4">
          <p className="text-4xl lg:text-5xl font-bold text-brand-dark mb-2">18.5<span className="text-2xl">k</span></p>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Items Identified</p>
        </div>
        <div className="text-center px-4">
          <p className="text-4xl lg:text-5xl font-bold text-brand-primary mb-2">92<span className="text-2xl">%</span></p>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Efficiency</p>
        </div>
        <div className="text-center px-4">
          <p className="text-4xl lg:text-5xl font-bold text-brand-dark mb-2">24/7</p>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Monitoring</p>
        </div>
      </div>
    </div>
  </section>
);

const UserPersonas = () => (
  <section className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-4xl font-bold text-brand-dark mb-4">One platform. Three connected experiences.</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 flex flex-col h-full">
          <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-dark mb-6">
            <Users size={24} />
          </div>
          <h3 className="text-2xl font-bold text-brand-dark mb-2">Citizen</h3>
          <p className="text-brand-slate mb-8">Find. Scan. Dispose.</p>
          <ul className="space-y-4 mb-auto text-sm text-gray-600">
            {['Find nearby bins', 'Scan waste with AI', 'Get recycling suggestions', 'Report issues'].map((item, i) => (
              <li key={i} className="flex items-center"><Check size={16} className="text-brand-primary mr-3" /> {item}</li>
            ))}
          </ul>
          <button className="w-full mt-8 py-3 border border-gray-300 rounded-xl font-semibold text-brand-dark hover:bg-gray-100 transition-colors">
            Explore Citizen App
          </button>
        </div>

        <div className="bg-brand-dark text-white rounded-3xl p-8 shadow-xl flex flex-col h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full"></div>
          <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center text-white mb-6 relative z-10">
            <Navigation size={24} />
          </div>
          <h3 className="text-2xl font-bold mb-2 relative z-10">Waste Driver</h3>
          <p className="text-gray-400 mb-8 relative z-10">Route. Collect. Complete.</p>
          <ul className="space-y-4 mb-auto text-sm text-gray-300 relative z-10">
            {['AI Optimized routes', 'Highlighted priority bins', 'Turn-by-turn navigation', 'Real-time updates'].map((item, i) => (
              <li key={i} className="flex items-center"><Check size={16} className="text-brand-primary mr-3" /> {item}</li>
            ))}
          </ul>
          <button className="w-full mt-8 py-3 bg-brand-primary rounded-xl font-semibold text-white hover:bg-brand-secondary transition-colors relative z-10">
            Driver Dashboard
          </button>
        </div>

        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 flex flex-col h-full">
          <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-dark mb-6">
            <Building2 size={24} />
          </div>
          <h3 className="text-2xl font-bold text-brand-dark mb-2">Municipality</h3>
          <p className="text-brand-slate mb-8">Monitor. Predict. Optimize.</p>
          <ul className="space-y-4 mb-auto text-sm text-gray-600">
            {['Live bin monitoring', 'AI overflow predictions', 'Fleet route optimization', 'Comprehensive analytics'].map((item, i) => (
              <li key={i} className="flex items-center"><Check size={16} className="text-brand-primary mr-3" /> {item}</li>
            ))}
          </ul>
          <button className="w-full mt-8 py-3 border border-gray-300 rounded-xl font-semibold text-brand-dark hover:bg-gray-100 transition-colors">
            Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  </section>
);

const ImpactFlow = () => (
  <section className="py-24 bg-brand-surface overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl lg:text-4xl font-bold text-brand-dark mb-6">Cleaner streets start with better decisions.</h2>
      <p className="text-brand-slate max-w-2xl mx-auto mb-16">SmartWaste connects everyday disposal decisions with the infrastructure and intelligence needed to keep cities cleaner.</p>
      
      <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 max-w-4xl mx-auto">
        <div className="bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100 font-medium text-sm text-gray-700">Citizen</div>
        <ArrowRight size={20} className="text-gray-300 hidden md:block" />
        <ArrowDown size={20} className="text-gray-300 md:hidden" />
        
        <div className="bg-brand-light px-6 py-3 rounded-full shadow-sm border border-brand-primary/20 font-medium text-sm text-brand-primary flex items-center">
          <Wand2 size={16} className="mr-2" /> AI
        </div>
        <ArrowRight size={20} className="text-gray-300 hidden md:block" />
        <ArrowDown size={20} className="text-gray-300 md:hidden" />
        
        <div className="bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100 font-medium text-sm text-gray-700">Smart Bin</div>
        <ArrowRight size={20} className="text-gray-300 hidden md:block" />
        <ArrowDown size={20} className="text-gray-300 md:hidden" />
        
        <div className="bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100 font-medium text-sm text-gray-700">Collection</div>
        <ArrowRight size={20} className="text-gray-300 hidden md:block" />
        <ArrowDown size={20} className="text-gray-300 md:hidden" />
        
        <div className="bg-brand-dark px-6 py-3 rounded-full shadow-md font-bold text-sm text-white">Cleaner City</div>
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="py-24 bg-brand-dark relative overflow-hidden">
    <div className="absolute inset-0 bg-grid-dark opacity-10"></div>
    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
    
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
      <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">Ready to make waste smarter?</h2>
      <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
        Find your nearest bin, scan your waste, and take the next step toward a cleaner, more sustainable city.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Link href="/citizen/find-bin" className="bg-brand-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-brand-secondary transition-all shadow-lg hover:-translate-y-1">
          Find a Nearby Bin
        </Link>
        <Link href="/citizen/scan-waste" className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all backdrop-blur-sm hover:-translate-y-1">
          Scan Your Waste
        </Link>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
        <div className="col-span-2 lg:col-span-2">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white mr-2">
              <Recycle size={18} />
            </div>
            <span className="font-bold text-lg text-brand-dark">SmartWaste <span className="text-brand-primary">AI</span></span>
          </div>
          <p className="text-sm text-brand-slate mb-6 max-w-xs">Smarter Waste. Cleaner Cities. Connecting citizens, infrastructure, and intelligence.</p>
          <div className="flex space-x-4">
            <Link href="#" className="text-gray-400 hover:text-brand-primary transition-colors"><FaTwitter size={20} /></Link>
            <Link href="#" className="text-gray-400 hover:text-brand-primary transition-colors"><FaLinkedin size={20} /></Link>
            <Link href="#" className="text-gray-400 hover:text-brand-primary transition-colors"><FaGithub size={20} /></Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-brand-dark mb-4">Product</h4>
          <ul className="space-y-3 text-sm text-brand-slate">
            {['Find a Bin', 'AI Scanner', 'Recycling Guides', 'Report Issues'].map(link => (
              <li key={link}><Link href="#" className="hover:text-brand-primary transition-colors">{link}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-brand-dark mb-4">Platform</h4>
          <ul className="space-y-3 text-sm text-brand-slate">
            {['Citizen App', 'Driver Dashboard', 'Municipality Portal', 'API Access'].map(link => (
              <li key={link}><Link href="#" className="hover:text-brand-primary transition-colors">{link}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-brand-dark mb-4">Company</h4>
          <ul className="space-y-3 text-sm text-brand-slate">
            {['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'].map(link => (
              <li key={link}><Link href="#" className="hover:text-brand-primary transition-colors">{link}</Link></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-gray-500 mb-4 md:mb-0">© 2026 SmartWaste AI. All rights reserved.</p>
        <div className="flex items-center text-sm text-gray-500">
          Built for a smarter future <Leaf size={16} className="text-brand-primary ml-2" />
        </div>
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <div className="bg-brand-surface text-brand-charcoal overflow-x-hidden font-sans min-h-screen">
      <GlobalStyles />
      <Navbar />
      <Hero />
      <LivePreview />
      <ProblemSolution />
      <Features />
      <ScannerShowcase />
      <MapShowcase />
      <IntelligenceDashboard />
      <HowItWorks />
      <Stats />
      <UserPersonas />
      <ImpactFlow />
      <CTASection />
      <Footer />
    </div>
  );
}