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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'bride' | 'groom'>('groom');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerFirstName, setPartnerFirstName] = useState('');
  const [partnerLastName, setPartnerLastName] = useState('');
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
    if (mode === 'signup' && (!firstName.trim() || !lastName.trim())) {
      setError('Please enter your first and last name.');
      return;
    }
    if (mode === 'signup' && (!partnerFirstName.trim() || !partnerLastName.trim())) {
      setError('Please enter your partner\'s first and last name.');
      return;
    }
    setIsLoading(true);
    try {
      if (mode === 'signup') {
        await signup({
          email,
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role,
          partner_email: partnerEmail,
          partner_first_name: partnerFirstName.trim(),
          partner_last_name: partnerLastName.trim(),
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
      
      <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6 md:px-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Heart className="w-6 h-6 text-rose-300" fill="currentColor" />
          <h2 className="text-3xl" style={{ fontFamily: 'Playfair Display, serif' }}>Muse</h2>
        </div>
        
        {/* Signup Form */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 md:p-10 shadow-soft">
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
          
          {mode === 'signup' ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Two Column Layout: User on Left, Partner on Right */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative">
                {/* User Section - Left */}
                <div className="space-y-6 flex flex-col items-center">
                  <div className="pb-3 border-b-2 border-rose-200 max-w-xs w-full">
                    <label className="block text-xs font-medium text-grey-500 mb-3 uppercase tracking-wide">You are</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'bride' | 'groom')}
                      className="w-full border-2 border-grey-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none text-lg font-semibold text-grey-800 transition-colors"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      <option value="bride">Bride</option>
                      <option value="groom">Groom</option>
                    </select>
                  </div>
                  
                  <div className="max-w-xs w-full">
                    <label className="block text-xs font-medium text-grey-500 mb-2 uppercase tracking-wide">First name</label>
                    <div className="flex items-center gap-3 border-2 border-grey-200 rounded-xl px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-rose-200 focus-within:border-rose-300 transition-colors">
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="w-full bg-transparent outline-none border-none text-grey-800 placeholder:text-grey-400"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="max-w-xs w-full">
                    <label className="block text-xs font-medium text-grey-500 mb-2 uppercase tracking-wide">Last name</label>
                    <div className="flex items-center gap-3 border-2 border-grey-200 rounded-xl px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-rose-200 focus-within:border-rose-300 transition-colors">
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        className="w-full bg-transparent outline-none border-none text-grey-800 placeholder:text-grey-400"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="max-w-xs w-full">
                    <label className="block text-xs font-medium text-grey-500 mb-2 uppercase tracking-wide">Email</label>
                    <div className="flex items-center gap-3 border-2 border-grey-200 rounded-xl px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-rose-200 focus-within:border-rose-300 transition-colors">
                      <Mail className="w-4 h-4 text-grey-400 shrink-0" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-transparent outline-none border-none text-grey-800 placeholder:text-grey-400"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="max-w-xs w-full">
                    <label className="block text-xs font-medium text-grey-500 mb-2 uppercase tracking-wide">Password</label>
                    <div className="flex items-center gap-3 border-2 border-grey-200 rounded-xl px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-rose-200 focus-within:border-rose-300 transition-colors">
                      <Lock className="w-4 h-4 text-grey-400 shrink-0" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-transparent outline-none border-none text-grey-800 placeholder:text-grey-400"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Partner Section - Right */}
                <div className="space-y-6 flex flex-col items-center">
                  <div className="pb-3 border-b-2 border-rose-200 max-w-xs w-full">
                    <h4 className="text-lg font-semibold text-grey-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {role === 'bride' ? 'Groom' : 'Bride'}
                    </h4>
                  </div>
                  
                  <div className="max-w-xs w-full">
                    <label className="block text-xs font-medium text-grey-500 mb-2 uppercase tracking-wide">First name</label>
                    <div className="flex items-center gap-3 border-2 border-grey-200 rounded-xl px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-rose-200 focus-within:border-rose-300 transition-colors">
                      <input
                        type="text"
                        value={partnerFirstName}
                        onChange={(e) => setPartnerFirstName(e.target.value)}
                        placeholder="First name"
                        className="w-full bg-transparent outline-none border-none text-grey-800 placeholder:text-grey-400"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="max-w-xs w-full">
                    <label className="block text-xs font-medium text-grey-500 mb-2 uppercase tracking-wide">Last name</label>
                    <div className="flex items-center gap-3 border-2 border-grey-200 rounded-xl px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-rose-200 focus-within:border-rose-300 transition-colors">
                      <input
                        type="text"
                        value={partnerLastName}
                        onChange={(e) => setPartnerLastName(e.target.value)}
                        placeholder="Last name"
                        className="w-full bg-transparent outline-none border-none text-grey-800 placeholder:text-grey-400"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="max-w-xs w-full">
                    <label className="block text-xs font-medium text-grey-500 mb-2 uppercase tracking-wide">Email</label>
                    <div className="flex items-center gap-3 border-2 border-grey-200 rounded-xl px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-rose-200 focus-within:border-rose-300 transition-colors">
                      <Mail className="w-4 h-4 text-grey-400 shrink-0" />
                      <input
                        type="email"
                        value={partnerEmail}
                        onChange={(e) => setPartnerEmail(e.target.value)}
                        placeholder="partner@example.com"
                        className="w-full bg-transparent outline-none border-none text-grey-800 placeholder:text-grey-400"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="max-w-xs w-full py-4 bg-gradient-to-r from-rose-300 to-rose-400 text-white rounded-xl hover:from-rose-400 hover:to-rose-500 transition-all shadow-soft disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? 'Working...' : 'Create My Workspace'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">
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
                {isLoading ? 'Working...' : 'Log in'}
              </button>
            </form>
          )}
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
