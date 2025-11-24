import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Calendar, DollarSign, Plane, Image, Activity, LayoutDashboard } from 'lucide-react';

export function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/budget', label: 'Budget', icon: DollarSign },
    { path: '/honeymoon', label: 'Honeymoon', icon: Plane },
    { path: '/gallery', label: 'Gallery', icon: Image },
    { path: '/activity', label: 'Activity', icon: Activity },
  ];
  
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-grey-100">
      <div className="max-w-[1280px] mx-auto px-20 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-300" fill="currentColor" />
          <span className="text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Muse</span>
        </Link>
        
        <div className="flex items-center gap-8">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive(path)
                  ? 'text-rose-300 bg-rose-50'
                  : 'text-grey-600 hover:text-grey-800 hover:bg-grey-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-grey-600">Hisham & Jinan</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-peach-100 flex items-center justify-center">
            <Heart className="w-4 h-4 text-rose-300" />
          </div>
        </div>
      </div>
    </nav>
  );
}
