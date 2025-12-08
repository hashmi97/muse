import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Signup() {
  const navigate = useNavigate();
  const { signup, login } = useAuth();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'bride' | 'groom'>('groom');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (mode === 'signup' && !partnerEmail) {
      setError('Partner email is required.');
      return;
    }
    if (mode === 'signup' && partnerEmail && partnerEmail.trim().toLowerCase() === email.trim().toLowerCase()) {
      setError('Your partner email must be different from your email.');
      return;
    }
    setIsLoading(true);
    try {
      if (mode === 'signup') {
        await signup({
          email,
          password,
          full_name: fullName || undefined,
          role,
          partner_email: partnerEmail,
        });
        setShowInviteModal(true);
      } else {
        await login({ email, password });
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
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
          <div className="flex items-center justify-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`px-4 py-2 rounded-full text-sm transition ${
                mode === 'signup' ? 'bg-rose-100 text-rose-600' : 'bg-grey-100 text-grey-600'
              }`}
            >
              Sign up
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`px-4 py-2 rounded-full text-sm transition ${
                mode === 'login' ? 'bg-rose-100 text-rose-600' : 'bg-grey-100 text-grey-600'
              }`}
            >
              Log in
            </button>
          </div>

          <h3 className="text-2xl mb-2 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
            {mode === 'signup' ? 'Create Your Dream Wedding' : 'Welcome back'}
          </h3>
          <p className="text-grey-500 text-center mb-8">
            {mode === 'signup' ? 'Start planning your special day' : 'Access your shared workspace'}
          </p>
          {error && <p className="text-sm text-rose-500 text-center mb-4">{error}</p>}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm text-grey-600 mb-2">Full name (optional)</label>
                <div className="flex items-center gap-3 border border-grey-200 rounded-xl px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-rose-200">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Hisham Al Hashmi"
                    className="w-full bg-transparent outline-none border-none"
                  />
                </div>
              </div>
            )}
            {mode === 'signup' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-grey-600 mb-2">You are</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'bride' | 'groom')}
                    className="w-full border border-grey-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-rose-200 outline-none"
                  >
                    <option value="bride">Bride</option>
                    <option value="groom">Groom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-grey-600 mb-2">Partner email</label>
                  <div className="flex items-center gap-3 border border-grey-200 rounded-xl px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-rose-200">
                    <Mail className="w-4 h-4 text-grey-400 shrink-0" />
                    <input
                      type="email"
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      placeholder="partner@example.com"
                      className="w-full bg-transparent outline-none border-none"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
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
              disabled={isLoading}
              className="w-full py-3 bg-rose-300 text-white rounded-xl hover:bg-rose-400 transition-colors shadow-soft disabled:opacity-50"
            >
              {isLoading ? 'Working...' : mode === 'signup' ? 'Create My Workspace' : 'Log in'}
            </button>
          </form>
        </div>
      </div>
      
      {/* Invite Partner Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 px-6 sm:px-8">
          <div className="bg-white rounded-2xl p-6 sm:p-10 max-w-xl w-full shadow-medium text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-peach-100 flex items-center justify-center">
                <Heart className="w-8 h-8 text-rose-300" fill="currentColor" />
              </div>
            </div>
            <h3 className="text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>
              Invitation sent
            </h3>
            <p className="text-grey-500">
              We’ve emailed your partner at <strong>{partnerEmail}</strong> with a link to join your workspace.
            </p>
            <button
              onClick={handleContinue}
              className="w-full mt-2 py-3 bg-rose-300 text-white rounded-xl hover:bg-rose-400 transition-colors"
            >
              Continue to Setup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
