import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  UtensilsCrossed, 
  LayoutDashboard, 
  ReceiptIndianRupee, 
  PieChart, 
  WalletCards, 
  Store, 
  LogOut, 
  ChevronDown, 
  Users, 
  Check, 
  Menu, 
  X 
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, logout, demoVendors, demoLogin } = useAuth();
  const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: ReceiptIndianRupee },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'budget', label: 'Budget & Limits', icon: WalletCards },
    { id: 'profile', label: 'Stall Profile', icon: Store },
  ];

  const handleVendorSwitch = async (vendorId) => {
    if (vendorId === user?.id) {
      setVendorDropdownOpen(false);
      return;
    }
    setSwitching(true);
    try {
      await demoLogin(vendorId);
      setVendorDropdownOpen(false);
    } catch (err) {
      console.error('Error switching vendor:', err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActivePage('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  Street<span className="text-amber-400">Ledger</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase text-amber-300/80 block font-medium">
                  Multi-Vendor Platform
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1 ml-6 pl-6 border-l border-slate-800">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* 1-Click Multi-Vendor Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setVendorDropdownOpen(!vendorDropdownOpen)}
                disabled={switching}
                className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-medium text-slate-200 transition-all shadow-sm focus:outline-none"
                title="Switch Vendor Account"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Active Vendor</span>
                  <span className="text-white font-medium truncate max-w-[140px] block">
                    {user?.vendor_name || 'Select Vendor'}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${vendorDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {vendorDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setVendorDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <div className="text-xs font-semibold text-slate-200">1-Click Vendor Switcher</div>
                      <div className="text-[11px] text-slate-400">Instantly test data isolation across vendors</div>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1 py-1">
                      {demoVendors.map((vendor) => {
                        const isCurrent = vendor.id === user?.id;
                        return (
                          <button
                            key={vendor.id}
                            onClick={() => handleVendorSwitch(vendor.id)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                              isCurrent
                                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <div className="truncate font-medium text-white">{vendor.vendor_name}</div>
                              <div className="text-[11px] text-slate-400 truncate">{vendor.stall_type}</div>
                            </div>
                            {isCurrent && <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/20"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-800">
            <div className="text-xs font-semibold text-slate-400 px-2 py-1">Switch Vendor</div>
            {demoVendors.map((vendor) => (
              <button
                key={vendor.id}
                onClick={() => {
                  handleVendorSwitch(vendor.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs rounded-lg ${
                  vendor.id === user?.id ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {vendor.vendor_name} ({vendor.stall_type})
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
