import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

export default function PageHeader() {
  const { vendor, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully', 'info');
    navigate('/login', { replace: true });
  };

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-surface border-b border-surface-border sticky top-0 z-30">
      <div className="flex items-center gap-2.5 min-w-0">
        <img src="/logo.svg" alt="StreetLedger" className="w-7 h-7 rounded" />
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-base text-text-primary leading-tight truncate">
            {vendor?.vendorName || vendor?.stallName || 'StreetLedger'}
          </span>
          <span className="text-xs text-text-muted truncate">
            {vendor?.ownerName || 'Vendor'}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        aria-label="Log out"
        className="p-2 text-text-muted hover:text-status-exceeded rounded-lg transition-colors"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </header>
  );
}
