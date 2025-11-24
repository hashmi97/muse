import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-peach-50 to-white opacity-70" />
      
      {/* Subtle texture overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.015) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />
      
      <div className="relative z-10 text-center max-w-2xl px-8">
        {/* Logo/Wordmark */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-rose-300" fill="currentColor" />
          <h1 className="text-6xl" style={{ fontFamily: 'Playfair Display, serif' }}>Muse</h1>
        </div>
        
        {/* Subtitle */}
        <p className="text-xl text-grey-600 mb-12 leading-relaxed">
          A calm, beautiful space to plan your wedding together
        </p>
        
        {/* CTA Button */}
        <button
          onClick={() => navigate('/signup')}
          className="px-12 py-4 bg-rose-300 text-white rounded-xl hover:bg-rose-400 transition-all shadow-soft hover:shadow-medium"
        >
          Start Planning
        </button>
        
        {/* Decorative element */}
        <div className="mt-16 flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-rose-200 opacity-40"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
