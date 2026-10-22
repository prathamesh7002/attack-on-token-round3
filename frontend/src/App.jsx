import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Analytics from './pages/Analytics';
import BudgetSettings from './pages/BudgetSettings';
import Profile from './pages/Profile';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [activePage, setActivePage] = useState('dashboard'); // 'dashboard' | 'expenses' | 'analytics' | 'budget' | 'profile'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Loading StreetLedger...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'register') {
      return <Register onNavigateLogin={() => setAuthView('login')} />;
    }
    return <Login onNavigateRegister={() => setAuthView('register')} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navigation Header */}
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activePage === 'dashboard' && (
          <Dashboard 
            onNavigateExpenses={() => setActivePage('expenses')}
            onNavigateAnalytics={() => setActivePage('analytics')}
            onNavigateBudget={() => setActivePage('budget')}
          />
        )}
        {activePage === 'expenses' && <Expenses />}
        {activePage === 'analytics' && <Analytics />}
        {activePage === 'budget' && <BudgetSettings />}
        {activePage === 'profile' && <Profile />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>StreetLedger © 2026 • General Multi-Vendor Expense & Budget Platform</span>
          <span className="text-slate-400">
            FastAPI + SQLite Backend • React + Tailwind + Recharts Frontend
          </span>
        </div>
      </footer>
    </div>
  );
}
