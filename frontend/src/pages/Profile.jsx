import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { 
  Store, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Check, 
  Loader2, 
  Calendar, 
  ShieldCheck, 
  Sparkles,
  Utensils
} from 'lucide-react';

const STALL_TYPES = [
  "Chaat & Street Snacks",
  "South Indian Tiffin",
  "Momo & Fast Food",
  "Tea, Coffee & Beverage",
  "Sandwich, Rolls & Wraps",
  "Juice & Shake Bar",
  "Biryani & Rice Corner",
  "North Indian Food Cart",
  "Bakery & Desserts",
  "General Street Food"
];

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [stallName, setStallName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [stallType, setStallType] = useState(STALL_TYPES[0]);
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setStallName(user.profile?.stall_name || user.vendor_name || '');
      setOwnerName(user.owner_name || '');
      setStallType(user.profile?.stall_type || STALL_TYPES[0]);
      setLocation(user.profile?.location || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (!stallName.trim() || !ownerName.trim()) {
      setStatusMessage({ type: 'error', text: 'Stall name and owner name are required.' });
      return;
    }

    setSaving(true);
    try {
      await api.put('/vendor/profile', {
        stall_name: stallName.trim(),
        owner_name: ownerName.trim(),
        stall_type: stallType,
        location: location.trim() || null,
        phone: phone.trim() || null,
      });

      await refreshUser();
      setStatusMessage({ type: 'success', text: 'Stall profile updated successfully!' });
    } catch (err) {
      console.error('Error updating profile:', err);
      setStatusMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-start sm:items-center gap-2">
          <Store className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0" />
          Stall Profile & Vendor Configuration
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your street food stall identity, category, and contact details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card: Account Overview */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold text-xl mb-4">
              <Utensils className="w-7 h-7" />
            </div>

            <h2 className="text-lg font-bold text-white mb-0.5">
              {user?.profile?.stall_name || user?.vendor_name}
            </h2>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-semibold text-xs mb-4">
              {user?.profile?.stall_type || 'Street Food'}
            </div>

            <div className="space-y-3 text-xs border-t border-slate-800 pt-4">
              <div className="flex items-center gap-2.5 text-slate-300">
                <User className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span>Owner: <strong className="text-white font-medium">{user?.owner_name}</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              {user?.phone && (
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user?.profile?.location && (
                <div className="flex items-center gap-2.5 text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>{user.profile.location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Isolated Vendor Account • ID #{user?.id}</span>
            </div>
          </div>
        </div>

        {/* Right Card: Editable Profile Form */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-base font-bold text-white mb-1">
            Update Stall Information
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Changes will update your dashboard and report headers immediately.
          </p>

          {statusMessage.text && (
            <div className={`mb-6 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
            }`}>
              <Check className="w-4 h-4" />
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Stall / Business Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={stallName}
                  onChange={(e) => setStallName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Owner Full Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Stall Type / Food Specialty
                </label>
                <select
                  value={stallType}
                  onChange={(e) => setStallType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  {STALL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Stall Location / Landmark
              </label>
              <input
                type="text"
                placeholder="e.g. Near University Gate No. 2, North Campus"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Update Profile
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
}
