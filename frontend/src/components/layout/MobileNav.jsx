import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, Wallet, User } from 'lucide-react';

export default function MobileNav() {
  const navItems = [
    { label: 'Home', path: '/', icon: LayoutDashboard },
    { label: 'Expenses', path: '/expenses', icon: Receipt },
    { label: 'Analytics', path: '/analytics', icon: PieChart },
    { label: 'Budget', path: '/budget', icon: Wallet },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-surface border-t border-surface-border flex items-center justify-around z-40 select-none pb-safe"
      aria-label="Mobile Navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full min-h-[44px] gap-1 transition-colors ${
                isActive ? 'text-accent font-semibold' : 'text-text-muted hover:text-text-primary'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-[11px] leading-tight">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
