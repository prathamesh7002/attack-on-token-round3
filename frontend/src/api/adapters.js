import { fromApiAmount, toApiAmount } from '../utils/money';
import { calculateBudgetStatus } from '../utils/alerts';

/**
 * ADAPTERS MODULE
 *
 * This is the ONLY place that maps backend responses -> UI models and UI -> request bodies.
 * If backend field names differ or return wrapped structures ({ data: ... }),
 * all defensive adaptations live here.
 */

// -------------------------------------------------------------
// Auth & Vendor Adapters
// -------------------------------------------------------------

/**
 * Maps login/register responses to UI Auth Result.
 * Expected backend shape:
 * { access_token: "...", token_type: "bearer", user?: {...}, vendor?: {...} }
 * or flat { access_token: "...", vendor_name: "...", ... }
 */
export function adaptAuthResponse(raw) {
  if (!raw) return { token: null, vendor: null };
  const data = raw.data || raw;

  const token = data.access_token || data.token || data.accessToken || null;
  const vendorData = data.vendor || data.user || data;

  const vendor = {
    id: vendorData.id || vendorData.user_id || null,
    vendorName: vendorData.vendor_name || vendorData.stall_name || vendorData.stallName || 'Food Stall',
    ownerName: vendorData.owner_name || vendorData.ownerName || 'Vendor',
    email: vendorData.email || '',
    phone: vendorData.phone || '',
    stallType: vendorData.stall_type || vendorData.stallType || 'Street Food',
    location: vendorData.location || '',
  };

  return { token, vendor };
}

/**
 * Maps vendor profile response to UI Vendor Profile model.
 * Expected backend shape:
 * { id, stall_name, owner_name, stall_type, location, phone }
 */
export function adaptVendorProfile(raw) {
  if (!raw) return null;
  const data = raw.data || raw;
  return {
    id: data.id || data.user_id || null,
    stallName: data.stall_name || data.vendor_name || data.stallName || '',
    ownerName: data.owner_name || data.ownerName || '',
    stallType: data.stall_type || data.stallType || '',
    location: data.location || '',
    phone: data.phone || '',
  };
}

/**
 * Maps UI vendor profile update to backend PUT body.
 */
export function adaptVendorProfilePayload(uiProfile) {
  return {
    stall_name: uiProfile.stallName || uiProfile.vendorName || '',
    owner_name: uiProfile.ownerName || '',
    stall_type: uiProfile.stallType || '',
    location: uiProfile.location || '',
    phone: uiProfile.phone || '',
  };
}

// -------------------------------------------------------------
// Expense Adapters
// -------------------------------------------------------------

/**
 * Maps a single backend expense object to the UI Expense model.
 * Expected backend shape:
 * {
 *   id: 1,
 *   description: "Tomatoes and onions",
 *   amount: 450 (or amount_paise: 45000),
 *   category: "Vegetables and fruits",
 *   expense_date: "2026-10-17",
 *   payment_method: "UPI",
 *   notes: "Daily market purchase",
 *   created_at: "..."
 * }
 */
export function adaptExpense(raw) {
  if (!raw) return null;
  const data = raw.data || raw;

  // Handle amount conversion via money utility
  const rawAmount = data.amount ?? (data.amount_paise !== undefined ? data.amount_paise / 100 : 0);
  const amountInRupees = fromApiAmount(rawAmount);

  return {
    id: data.id,
    description: data.description || '',
    amount: amountInRupees,
    category: data.category || 'Miscellaneous',
    expenseDate: data.expense_date || data.expenseDate || data.date || '',
    paymentMethod: data.payment_method || data.paymentMethod || 'Cash',
    notes: data.notes || '',
    createdAt: data.created_at || data.createdAt || null,
  };
}

/**
 * Maps expense list response to UI list + pagination.
 * Handles either a bare array [ ... ] or paginated object { items: [...], total: ... }
 */
export function adaptExpenseList(raw) {
  if (!raw) return { items: [], total: 0 };
  const data = raw.data || raw;

  let rawList = [];
  let totalCount = 0;

  if (Array.isArray(data)) {
    rawList = data;
    totalCount = data.length;
  } else if (Array.isArray(data.items)) {
    rawList = data.items;
    totalCount = data.total ?? data.count ?? data.items.length;
  } else if (Array.isArray(data.expenses)) {
    rawList = data.expenses;
    totalCount = data.total ?? data.count ?? data.expenses.length;
  }

  const items = rawList.map(adaptExpense).filter(Boolean);
  return {
    items,
    total: totalCount,
  };
}

/**
 * Maps UI Expense form payload to backend POST/PUT body.
 * Converts amount from Rupees to configured API request unit.
 */
export function adaptExpensePayload(uiExpense) {
  return {
    description: uiExpense.description?.trim() || '',
    amount: toApiAmount(uiExpense.amount),
    category: uiExpense.category,
    expense_date: uiExpense.expenseDate,
    payment_method: uiExpense.paymentMethod || undefined,
    notes: uiExpense.notes?.trim() || undefined,
  };
}

// -------------------------------------------------------------
// Budget Adapters
// -------------------------------------------------------------

/**
 * Maps backend budget response to UI BudgetStatus model.
 * Expected backend shape:
 * {
 *   month: "2026-10",
 *   budget_amount: 20000,
 *   total_spent: 16500,
 *   remaining: 3500,
 *   utilization_pct: 82.5,
 *   alert_level: "warning",
 *   warning_threshold_pct: 80,
 *   high_spending_threshold_pct: 90
 * }
 */
export function adaptBudgetStatus(raw, fallbackMonth = '') {
  if (!raw) {
    return calculateBudgetStatus({ month: fallbackMonth, budgetAmount: 0, totalSpent: 0 });
  }
  const data = raw.data || raw;

  const rawBudget = data.budget_amount ?? data.budgetAmount ?? data.budget ?? 0;
  const rawSpent = data.total_spent ?? data.totalSpent ?? data.spent ?? 0;

  const budgetAmount = fromApiAmount(rawBudget);
  const totalSpent = fromApiAmount(rawSpent);

  const month = data.month || fallbackMonth;
  const warningThresholdPct = data.warning_threshold_pct ?? data.warningThresholdPct ?? 80;
  const highThresholdPct = data.high_spending_threshold_pct ?? data.highSpendingThresholdPct ?? 90;
  const explicitAlertLevel = data.alert_level || data.alertLevel || data.status || null;
  const customMessage = data.message || null;

  return calculateBudgetStatus({
    month,
    budgetAmount,
    totalSpent,
    warningThresholdPct,
    highThresholdPct,
    explicitAlertLevel,
    customMessage,
  });
}

/**
 * Maps UI Budget form payload to backend POST body.
 */
export function adaptBudgetPayload(uiBudget) {
  return {
    month: uiBudget.month,
    budget_amount: toApiAmount(uiBudget.budgetAmount),
    warning_threshold_pct: Number(uiBudget.warningThresholdPct) || 80,
    high_spending_threshold_pct: Number(uiBudget.highSpendingThresholdPct) || 90,
  };
}

// -------------------------------------------------------------
// Analytics Adapters
// -------------------------------------------------------------

/**
 * Maps category-wise spending response for Recharts.
 * Expected backend shape:
 * [ { category: "Vegetables", total: 4500, percentage_share: 35.2, item_count: 12 }, ... ]
 * or { categories: [ ... ] }
 */
export function adaptCategoryStats(raw) {
  if (!raw) return [];
  const data = raw.data || raw;
  const list = Array.isArray(data) ? data : (data.categories || data.items || []);

  return list.map((item) => {
    const rawTotal = item.total ?? item.amount ?? item.total_spent ?? 0;
    const amount = fromApiAmount(rawTotal);
    const percentage = Number(item.percentage_share ?? item.percentage ?? item.share ?? 0);
    const count = Number(item.item_count ?? item.count ?? item.transactions ?? 0);

    return {
      category: item.category || item.name || 'Miscellaneous',
      amount,
      percentage: Math.round(percentage * 10) / 10,
      count,
    };
  });
}

/**
 * Maps monthly summary response.
 * Expected backend shape:
 * {
 *   month: "2026-10",
 *   budget_amount: 20000,
 *   total_spent: 16500,
 *   daily_average: 550,
 *   top_category: "Vegetables and fruits"
 * }
 */
export function adaptMonthlySummary(raw, fallbackMonth = '') {
  if (!raw) {
    return {
      month: fallbackMonth,
      budgetAmount: 0,
      totalSpent: 0,
      dailyAverage: 0,
      topCategory: 'None',
    };
  }
  const data = raw.data || raw;

  return {
    month: data.month || fallbackMonth,
    budgetAmount: fromApiAmount(data.budget_amount ?? data.budgetAmount ?? 0),
    totalSpent: fromApiAmount(data.total_spent ?? data.totalSpent ?? data.spent ?? 0),
    dailyAverage: fromApiAmount(data.daily_average ?? data.dailyAverage ?? 0),
    topCategory: data.top_category || data.topCategory || 'None',
  };
}
