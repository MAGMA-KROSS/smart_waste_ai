"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Recycle, MapPin, Scan, Leaf, AlertCircle, Menu, X, Shield, ChevronRight } from "lucide-react";

export default function Navbar({ activePage = "find-bin" }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "find-bin", label: "Find Nearby Bins", href: "/citizen/find-bin", icon: MapPin },
    { id: "scan", label: "AI Scanner", href: "/citizen/scan-waste", icon: Scan },
    { id: "recycle", label: "Recycling Guide", href: "#", icon: Leaf, tag: "Soon" },
    { id: "report", label: "Report Issue", href: "#", icon: AlertCircle, tag: "Soon" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Recycle className="h-6 w-6 animate-spin-slow" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Smart<span className="text-emerald-600">Waste</span> <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold uppercase tracking-wide">AI</span>
              </span>
              <p className="text-[10px] text-slate-500 font-medium -mt-1">Intelligent City Waste Network</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                  {item.tag && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-normal">
                      {item.tag}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Role Badge & Action */}
          <div className="hidden sm:flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-full text-xs text-slate-700 font-medium border border-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Citizen Portal</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-5 w-5 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.tag ? (
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{item.tag}</span>
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
