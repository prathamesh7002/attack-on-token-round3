import React from 'react';

export default function MetricCard({ title, amount, subtitle, icon: Icon, color = 'amber', badge, onClick }) {
  const colorMap = {
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/15 text-amber-400',
      text: 'text-amber-400',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/15 text-emerald-400',
      text: 'text-emerald-400',
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/15 text-rose-400',
      text: 'text-rose-400',
    },
    blue: {
      border: 'border-blue-500/20 hover:border-blue-500/40',
      iconBg: 'bg-blue-500/15 text-blue-400',
      text: 'text-blue-400',
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/15 text-purple-400',
      text: 'text-purple-400',
    }
  };

  const scheme = colorMap[color] || colorMap.amber;

  return (
    <div 
      onClick={onClick}
      className={`bg-slate-900/90 backdrop-blur-sm border ${scheme.border} rounded-2xl p-5 transition-all shadow-md hover:shadow-xl ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl ${scheme.iconBg} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
          {typeof amount === 'number' 
            ? `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
            : amount}
        </span>
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-slate-400 truncate">
          {subtitle}
        </span>
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${scheme.iconBg}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
