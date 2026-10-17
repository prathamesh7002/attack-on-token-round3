import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, Sparkles, Store } from 'lucide-react';

export default function Login({ onNavigateRegister }) {
  const { login, demoLogin, demoVendors } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoadingId, setDemoLoadingId] = useState(null);
  const [error, setError] = useState('');

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Invalid email or password. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (vendorId) => {
    setError('');
    setDemoLoadingId(vendorId);
    try {
      await demoLogin(vendorId);
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Could not log in to demo account.');
    } finally {
      setDemoLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-950">
      <div className="max-w-md w-full relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 shadow-xl shadow-amber-500/20 mb-4 transform hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Street<span className="text-amber-400">Ledger</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-sm mx-auto">
            Multi-vendor expense tracking and monthly budgeting for street food stalls.
          </p>
        </div>

        {/* 1-Click Demo Login Box (For rapid review & testing) */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-5 mb-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
              1-Click Demo Vendor Login
            </div>
            <span className="text-[10px] text-amber-300/80 bg-amber-500/15 px-2 py-0.5 rounded-full font-semibold">
              Instant Access
            </span>
          </div>
          <p className="text-xs text-slate-300 mb-3.5">
            Test multi-vendor data isolation immediately without typing credentials:
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            {demoVendors.slice(0, 2).map((vendor) => (
              <button
                key={vendor.id}
                onClick={() => handleDemoClick(vendor.id)}
                disabled={demoLoadingId !== null || loading}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 text-left transition-all group disabled:opacity-50"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                    <Store className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                      {vendor.vendor_name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {vendor.stall_type} • {vendor.owner_name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2">
                  {demoLoadingId === vendor.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Enter</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Standard Login Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-5">
            <h2 className="text-base font-bold text-white">Vendor Sign In</h2>
            <p className="text-xs text-slate-400">Enter your credentials to access your personal ledger</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="vendor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || demoLoadingId !== null}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              New street food vendor?{' '}
              <button
                onClick={onNavigateRegister}
                className="font-bold text-amber-400 hover:text-amber-300 ml-1 hover:underline"
              >
                Register Stall
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
