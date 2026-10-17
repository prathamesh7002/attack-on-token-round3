import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, Wallet, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Sidebar() {
  const { vendor, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully', 'info');
    navigate('/login', { replace: true });
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Expenses', path: '/expenses', icon: Receipt },
    { label: 'Analytics', path: '/analytics', icon: PieChart },
    { label: 'Budget', path: '/budget', icon: Wallet },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-surface-border h-full p-5 justify-between select-none flex-shrink-0 z-30 overflow-y-auto">
      <div className="flex flex-col gap-6">
        {/* Brand logo & Stall info */}
        <div className="flex items-center gap-3 px-1 py-1">
          <img src="/logo.svg" alt="StreetLedger Logo" className="w-8 h-8 rounded-lg flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-lg text-text-primary leading-tight truncate">StreetLedger</span>
            <span className="text-xs text-text-muted truncate">
              {vendor?.vendorName || vendor?.stallName || 'Food Stall'}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-semibold transition-colors duration-150 ${
                    isActive
                      ? 'bg-action-primary text-white'
                      : 'text-text-muted hover:text-text-primary hover:bg-background'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / User & Logout */}
      <div className="pt-4 border-t border-surface-border flex flex-col gap-3">
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-full bg-background border border-surface-border flex items-center justify-center font-semibold text-text-primary text-sm flex-shrink-0">
            {(vendor?.ownerName || 'V').charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-text-primary truncate">
              {vendor?.ownerName || 'Vendor'}
            </span>
            <span className="text-xs text-text-muted truncate">
              {vendor?.email || ''}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-status-exceeded hover:bg-status-exceeded-bg transition-colors w-full"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
