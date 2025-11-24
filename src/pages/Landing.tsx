import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-6">
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-peach-50 to-white opacity-70" />
      
      {/* Subtle texture overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.015) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />
      
      <div className="relative z-10 max-w-5xl w-full px-4">
        <div className="flex flex-col items-center text-center gap-8">
          {/* Logo/Wordmark */}
          <div className="flex items-center justify-center gap-4">
            <Heart className="w-10 h-10 text-rose-300" fill="currentColor" />
            <div className="flex flex-col items-start">
              <h1 className="text-[clamp(2.75rem,4vw,4rem)] leading-none" style={{ fontFamily: 'Playfair Display, serif' }}>Muse</h1>
              <span className="text-sm uppercase tracking-[0.2em] text-grey-500">Wedding Planner</span>
            </div>
          </div>
          
          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-grey-600 leading-relaxed max-w-4xl text-balance">
            A calm, beautiful space for you and your partner to plan every ceremony, budget, and memory together.
          </p>
          
          {/* CTA Button */}
          <button
            onClick={() => navigate('/signup')}
            className="px-12 py-4 bg-rose-300 text-white rounded-full hover:bg-rose-400 transition-all shadow-soft hover:shadow-medium text-base font-medium w-full sm:w-auto"
          >
            Start Planning
          </button>
        </div>
      </div>
    </div>
  );
}
