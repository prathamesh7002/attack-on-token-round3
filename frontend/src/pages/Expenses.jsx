import React, { useState, useEffect } from 'react';
import api from '../api/client';
import ExpenseModal from '../components/ExpenseModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { 
  ReceiptIndianRupee, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Pencil, 
  Trash2, 
  Loader2, 
  ShoppingBag,
  RotateCcw
} from 'lucide-react';

const CATEGORIES = [
  "All Categories",
  "Ingredients and raw materials",
  "Vegetables and fruits",
  "Cooking oil and spices",
  "LPG and fuel",
  "Packaging materials",
  "Transportation",
  "Stall rent and maintenance",
  "Cleaning supplies",
  "Equipment and repairs",
  "Miscellaneous"
];

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedMonth) params.month = selectedMonth;
      if (selectedCategory && selectedCategory !== "All Categories") params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/expenses', { params });
      setExpenses(res.data.expenses || []);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth, selectedCategory, searchQuery]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/expenses/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalFilteredAmount = expenses.reduce((sum, item) => sum + (item.amount_inr || 0), 0);

  const getMonthOptions = () => {
    const options = [{ value: '', label: 'All Months' }];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      options.push({ value: val, label });
    }
    return options;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ReceiptIndianRupee className="w-6 h-6 text-amber-400" />
            Daily Expense Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Create, categorize, edit, and track food stall expenditures with integer paise accuracy.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingExpense(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Record New Expense
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Month Filter */}
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-amber-500"
            >
              {getMonthOptions().map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-amber-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search description or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

        </div>

        {/* Filter Summary Stats */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
          <div className="text-slate-400">
            Showing <span className="text-white font-bold">{expenses.length}</span> of{' '}
            <span className="text-white font-bold">{totalCount}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Filtered Total:</span>
            <span className="font-mono font-extrabold text-amber-400 text-sm">
              ₹{totalFilteredAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" />
            <p className="text-xs text-slate-400">Loading expense records...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6">
            <ShoppingBag className="w-12 h-12 text-slate-600 mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">No Matching Expenses</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              No expense records found matching the current filters. Adjust your filters or record a new purchase.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All Categories");
                setSearchQuery("");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors group">
                    
                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-xs whitespace-nowrap">
                      {exp.expense_date}
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {exp.description}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-[11px] font-medium whitespace-nowrap border border-slate-700/60">
                        {exp.category}
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 text-slate-400 text-xs max-w-xs truncate">
                      {exp.notes || <span className="text-slate-600">—</span>}
                    </td>

                    {/* Amount in INR */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-amber-400 whitespace-nowrap">
                      ₹{exp.amount_inr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingExpense(exp);
                            setModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                          title="Edit Expense"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(exp)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchExpenses}
        initialExpense={editingExpense}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deleteTarget?.description}
        loading={deleteLoading}
      />

    </div>
  );
}
