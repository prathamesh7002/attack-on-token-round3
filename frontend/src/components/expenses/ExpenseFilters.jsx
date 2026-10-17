import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../../constants/categories';

export default function ExpenseFilters({
  search = '',
  category = '',
  onSearchChange,
  onCategoryChange,
  onReset,
}) {
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, search, onSearchChange]);

  const hasActiveFilters = Boolean(search || category);

  return (
    <div className="bg-surface rounded-xl border border-surface-border shadow-sm p-4 flex flex-col sm:flex-row items-center gap-3">
      {/* Debounced Search */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search by item, notes, or mandi purchase..."
          className="w-full h-11 pl-10 pr-4 text-sm bg-background rounded-lg border border-surface-border text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent"
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => {
              setLocalSearch('');
              onSearchChange('');
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Dropdown */}
      <div className="w-full sm:w-56">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full h-11 px-3 text-sm bg-background rounded-lg border border-surface-border text-text-primary focus-visible:outline-none focus-visible:border-accent"
        >
          <option value="">All Categories</option>
          {DEFAULT_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => {
            setLocalSearch('');
            onReset();
          }}
          className="h-11 px-3 text-xs font-semibold text-text-muted hover:text-accent flex items-center gap-1.5 whitespace-nowrap self-end sm:self-auto"
        >
          <X className="w-4 h-4" />
          <span>Clear</span>
        </button>
      )}
    </div>
  );
}
