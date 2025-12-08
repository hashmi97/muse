import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Calendar, DollarSign, Plane, Image, Activity, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardSummary } from '../lib/api';

export function Navigation() {
  const location = useLocation();
  const { accessToken } = useAuth();
  const [coupleName, setCoupleName] = useState<string | null>(null);
  
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (!accessToken) return;
    
    async function loadCoupleName() {
      try {
        const summary = await fetchDashboardSummary(accessToken);
        if (summary.couple_name) {
          setCoupleName(summary.couple_name);
        }
      } catch (err) {
        // Silently fail - don't show error in nav
        console.warn('Failed to load couple name:', err);
      }
    }
    
    loadCoupleName();
  }, [accessToken]);
  
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
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
        <Link to="/" className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300" fill="currentColor" />
          <span className="text-lg sm:text-xl md:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>Muse</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8 overflow-x-auto">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg transition-colors whitespace-nowrap ${
                isActive(path)
                  ? 'text-rose-300 bg-rose-50'
                  : 'text-grey-600 hover:text-grey-800 hover:bg-grey-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm md:text-base">{label}</span>
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs sm:text-sm text-grey-600 truncate max-w-[120px] sm:max-w-none">
              {coupleName || 'Loading...'}
            </div>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-rose-100 to-peach-100 flex items-center justify-center">
            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-rose-300" />
          </div>
        </div>
      </div>
    </nav>
  );
}
