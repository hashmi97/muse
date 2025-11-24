import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, Copy, Share2 } from 'lucide-react';

export function Signup() {
  const navigate = useNavigate();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowInviteModal(true);
  };
  
  const handleContinue = () => {
    navigate('/onboarding');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-peach-50 relative overflow-hidden">
      {/* Subtle texture */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.015) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />
      
      <div className="relative z-10 w-full max-w-lg md:min-w-[420px] px-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Heart className="w-6 h-6 text-rose-300" fill="currentColor" />
          <h2 className="text-3xl" style={{ fontFamily: 'Playfair Display, serif' }}>Muse</h2>
        </div>
        
        {/* Signup Form */}
        <div className="bg-white rounded-2xl p-10 shadow-soft">
          <h3 className="text-2xl mb-2 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>Create Your Dream Wedding</h3>
          <p className="text-grey-500 text-center mb-8">Start planning your special day</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-grey-600 mb-2">Email</label>
              <div className="flex items-center gap-3 border border-grey-200 rounded-xl px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-rose-200">
                <Mail className="w-4 h-4 text-grey-400 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent outline-none border-none"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-grey-600 mb-2">Password</label>
              <div className="flex items-center gap-3 border border-grey-200 rounded-xl px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-rose-200">
                <Lock className="w-4 h-4 text-grey-400 shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none border-none"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-rose-300 text-white rounded-xl hover:bg-rose-400 transition-colors shadow-soft"
            >
              Create My Workspace
            </button>
          </form>
        </div>
      </div>
      
      {/* Invite Partner Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 px-6 sm:px-8">
          <div className="bg-white rounded-2xl p-6 sm:p-10 max-w-xl w-full shadow-medium">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-peach-100 flex items-center justify-center">
                <Heart className="w-8 h-8 text-rose-300" fill="currentColor" />
              </div>
            </div>
            
            <h3 className="text-2xl mb-2 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
              Invite Jinan to plan with you
            </h3>
            <p className="text-grey-500 text-center mb-8">
              Share this link so you can collaborate together
            </p>
            
            <div className="bg-grey-50 rounded-xl p-4 mb-6 text-sm text-grey-600 text-center break-all">
              muse.app/invite/hisham-jinan-2024
            </div>
            
              <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="flex-1 py-3 border border-grey-200 rounded-xl hover:bg-grey-50 transition-colors flex items-center justify-center gap-2"
                onClick={async () => {
                  await navigator.clipboard.writeText('muse.app/invite/hisham-jinan-2024');
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            
            <button
              onClick={handleContinue}
              className="w-full mt-4 py-3 bg-rose-300 text-white rounded-xl hover:bg-rose-400 transition-colors"
            >
              Continue to Setup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
