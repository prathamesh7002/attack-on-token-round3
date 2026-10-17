import { INITIAL_MOCK_USERS, INITIAL_MOCK_BUDGETS, INITIAL_MOCK_EXPENSES } from './data';
import { TOKEN_STORAGE_KEY } from '../../config/api';
import { DEFAULT_CATEGORIES } from '../../constants/categories';
import { computeAlertLevel } from '../../utils/alerts';
import { getCurrentMonth } from '../../utils/dates';

// In-memory state maintained across requests
class MockDatabase {
  constructor() {
    this.users = [...INITIAL_MOCK_USERS];
    this.budgets = [...INITIAL_MOCK_BUDGETS];
    this.expenses = [...INITIAL_MOCK_EXPENSES];
    this.nextExpenseId = 300;
    this.nextUserId = 10;
  }

  // Extract currently authenticated user from stored JWT mock token
  getCurrentUser() {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) return null;
      // Mock tokens are in format: mock-token-user-{id}
      const match = token.match(/mock-token-user-(\d+)/);
      if (!match) return null;
      const userId = parseInt(match[1], 10);
      return this.users.find((u) => u.id === userId) || null;
    } catch {
      return null;
    }
  }

  requireAuth() {
    const user = this.getCurrentUser();
    if (!user) {
      const err = new Error('Not authenticated');
      err.status = 401;
      err.message = 'Could not validate credentials';
      throw err;
    }
    return user;
  }
}

const db = new MockDatabase();

// Small artificial delay to mimic realistic network latency (50-150ms)
const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockAuthApi = {
  async login({ email, password }) {
    await delay();
    const user = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());
    if (!user || user.password !== password) {
      const err = new Error('Incorrect email or password');
      err.status = 401;
      err.message = 'Email or password is incorrect';
      throw err;
    }

    const token = `mock-token-user-${user.id}`;
    return {
      access_token: token,
      token_type: 'bearer',
      vendor: {
        id: user.id,
        vendor_name: user.vendor_name,
        owner_name: user.owner_name,
        email: user.email,
        phone: user.phone,
        stall_type: user.stall_type,
        location: user.location,
      },
    };
  },

  async register({ vendor_name, owner_name, email, password, confirm_password, phone, stall_type }) {
    await delay();
    if (password !== confirm_password) {
      const err = new Error('Passwords do not match');
      err.status = 422;
      err.fieldErrors = { confirm_password: 'Passwords do not match' };
      err.message = 'Passwords do not match';
      throw err;
    }

    const existing = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());
    if (existing) {
      const err = new Error('Email already registered');
      err.status = 400;
      err.fieldErrors = { email: 'This email is already registered' };
      err.message = 'This email is already registered';
      throw err;
    }

    const newUser = {
      id: db.nextUserId++,
      vendor_name: vendor_name?.trim() || 'My Street Food Stall',
      owner_name: owner_name?.trim() || 'Vendor',
      email: email.trim(),
      password,
      phone: phone || '',
      stall_type: stall_type || 'Other',
      location: '',
      created_at: new Date().toISOString(),
    };
    db.users.push(newUser);

    const token = `mock-token-user-${newUser.id}`;
    return {
      access_token: token,
      token_type: 'bearer',
      vendor: {
        id: newUser.id,
        vendor_name: newUser.vendor_name,
        owner_name: newUser.owner_name,
        email: newUser.email,
        phone: newUser.phone,
        stall_type: newUser.stall_type,
        location: newUser.location,
      },
    };
  },

  async me() {
    await delay();
    const user = db.requireAuth();
    return {
      id: user.id,
      vendor_name: user.vendor_name,
      owner_name: user.owner_name,
      email: user.email,
      phone: user.phone,
      stall_type: user.stall_type,
      location: user.location,
    };
  },

  async logout() {
    await delay(30);
    return { detail: 'Logged out successfully' };
  },
};

export const mockVendorApi = {
  async getProfile() {
    await delay();
    const user = db.requireAuth();
    return {
      id: user.id,
      stall_name: user.vendor_name,
      owner_name: user.owner_name,
      stall_type: user.stall_type,
      location: user.location || '',
      phone: user.phone || '',
    };
  },

  async updateProfile(payload) {
    await delay();
    const user = db.requireAuth();
    if (payload.stall_name !== undefined) user.vendor_name = payload.stall_name;
    if (payload.owner_name !== undefined) user.owner_name = payload.owner_name;
    if (payload.stall_type !== undefined) user.stall_type = payload.stall_type;
    if (payload.location !== undefined) user.location = payload.location;
    if (payload.phone !== undefined) user.phone = payload.phone;

    return {
      id: user.id,
      stall_name: user.vendor_name,
      owner_name: user.owner_name,
      stall_type: user.stall_type,
      location: user.location,
      phone: user.phone,
    };
  },
};

export const mockExpenseApi = {
  async list({ month, category, search, limit = 50, offset = 0 } = {}) {
    await delay();
    const user = db.requireAuth();

    // STRICT ISOLATION: Only expenses belonging to this vendor
    let filtered = db.expenses.filter((e) => e.user_id === user.id);

    // Filter by month (YYYY-MM)
    if (month) {
      filtered = filtered.filter((e) => e.expense_date && e.expense_date.startsWith(month));
    }

    // Filter by category
    if (category && category !== 'all') {
      filtered = filtered.filter(
        (e) => e.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by search query (description or notes)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (e) =>
          (e.description && e.description.toLowerCase().includes(q)) ||
          (e.notes && e.notes.toLowerCase().includes(q))
      );
    }

    // Sort descending by date, then id
    filtered.sort((a, b) => {
      const dateDiff = new Date(b.expense_date) - new Date(a.expense_date);
      if (dateDiff !== 0) return dateDiff;
      return b.id - a.id;
    });

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      items: paginated,
      total,
      limit,
      offset,
    };
  },

  async create(payload) {
    await delay();
    const user = db.requireAuth();

    if (!payload.amount || Number(payload.amount) <= 0) {
      const err = new Error('Amount must be greater than zero');
      err.status = 422;
      err.fieldErrors = { amount: 'Please enter an amount greater than 0' };
      throw err;
    }

    const newExpense = {
      id: db.nextExpenseId++,
      user_id: user.id,
      description: payload.description || payload.category,
      amount: Number(payload.amount),
      category: payload.category || 'Miscellaneous',
      expense_date: payload.expense_date || new Date().toISOString().split('T')[0],
      payment_method: payload.payment_method || 'Cash',
      notes: payload.notes || '',
      created_at: new Date().toISOString(),
    };

    // Prepend so it appears instantly at top
    db.expenses.unshift(newExpense);
    return newExpense;
  },

  async getById(id) {
    await delay();
    const user = db.requireAuth();
    const expense = db.expenses.find((e) => e.id === Number(id));

    // Enforce data isolation: 404 if not found or belongs to another vendor
    if (!expense || expense.user_id !== user.id) {
      const err = new Error('Expense not found');
      err.status = 404;
      throw err;
    }
    return expense;
  },

  async update(id, payload) {
    await delay();
    const user = db.requireAuth();
    const expense = db.expenses.find((e) => e.id === Number(id));

    if (!expense || expense.user_id !== user.id) {
      const err = new Error('Expense not found');
      err.status = 404;
      throw err;
    }

    if (payload.description !== undefined) expense.description = payload.description;
    if (payload.amount !== undefined) expense.amount = Number(payload.amount);
    if (payload.category !== undefined) expense.category = payload.category;
    if (payload.expense_date !== undefined) expense.expense_date = payload.expense_date;
    if (payload.payment_method !== undefined) expense.payment_method = payload.payment_method;
    if (payload.notes !== undefined) expense.notes = payload.notes;

    return expense;
  },

  async delete(id) {
    await delay();
    const user = db.requireAuth();
    const index = db.expenses.findIndex((e) => e.id === Number(id) && e.user_id === user.id);

    if (index === -1) {
      const err = new Error('Expense not found');
      err.status = 404;
      throw err;
    }

    db.expenses.splice(index, 1);
    return { detail: 'Expense deleted successfully' };
  },

  async getCategories() {
    await delay(20);
    return DEFAULT_CATEGORIES.map((c) => c.name);
  },
};

export const mockBudgetApi = {
  async get({ month } = {}) {
    await delay();
    const user = db.requireAuth();
    const targetMonth = month || getCurrentMonth();

    // Look for user's configured budget for this month
    const budgetRecord = db.budgets.find(
      (b) => b.user_id === user.id && b.month === targetMonth
    );

    // Sum vendor's expenses for this month
    const monthExpenses = db.expenses.filter(
      (e) => e.user_id === user.id && e.expense_date && e.expense_date.startsWith(targetMonth)
    );
    const totalSpent = monthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const budgetAmount = budgetRecord ? Number(budgetRecord.budget_amount) : 0;
    const warningThresholdPct = budgetRecord?.warning_threshold_pct ?? 80;
    const highThresholdPct = budgetRecord?.high_spending_threshold_pct ?? 90;

    const remaining = budgetAmount > 0 ? Math.max(0, budgetAmount - totalSpent) : 0;
    const utilizationPct = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;
    const alertLevel = computeAlertLevel(totalSpent, budgetAmount, warningThresholdPct, highThresholdPct);

    return {
      month: targetMonth,
      budget_amount: budgetAmount,
      total_spent: totalSpent,
      remaining,
      utilization_pct: Math.round(utilizationPct * 10) / 10,
      alert_level: alertLevel,
      warning_threshold_pct: warningThresholdPct,
      high_spending_threshold_pct: highThresholdPct,
    };
  },

  async set({ month, budget_amount, warning_threshold_pct = 80, high_spending_threshold_pct = 90 }) {
    await delay();
    const user = db.requireAuth();
    const targetMonth = month || getCurrentMonth();

    let budgetRecord = db.budgets.find(
      (b) => b.user_id === user.id && b.month === targetMonth
    );

    if (budgetRecord) {
      budgetRecord.budget_amount = Number(budget_amount);
      budgetRecord.warning_threshold_pct = Number(warning_threshold_pct);
      budgetRecord.high_spending_threshold_pct = Number(high_spending_threshold_pct);
    } else {
      budgetRecord = {
        id: db.budgets.length + 1,
        user_id: user.id,
        month: targetMonth,
        budget_amount: Number(budget_amount),
        warning_threshold_pct: Number(warning_threshold_pct),
        high_spending_threshold_pct: Number(high_spending_threshold_pct),
      };
      db.budgets.push(budgetRecord);
    }

    return mockBudgetApi.get({ month: targetMonth });
  },

  async getAlerts({ month } = {}) {
    await delay();
    const status = await mockBudgetApi.get({ month });
    return {
      month: status.month,
      alert_level: status.alert_level,
      utilization_pct: status.utilization_pct,
      remaining: status.remaining,
      total_spent: status.total_spent,
      budget_amount: status.budget_amount,
    };
  },
};

export const mockAnalyticsApi = {
  async categoryWise({ month } = {}) {
    await delay();
    const user = db.requireAuth();
    const targetMonth = month || getCurrentMonth();

    const monthExpenses = db.expenses.filter(
      (e) => e.user_id === user.id && e.expense_date && e.expense_date.startsWith(targetMonth)
    );

    const totalSpent = monthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const categoryMap = {};

    monthExpenses.forEach((exp) => {
      const cat = exp.category || 'Miscellaneous';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { total: 0, count: 0 };
      }
      categoryMap[cat].total += Number(exp.amount) || 0;
      categoryMap[cat].count += 1;
    });

    const result = Object.entries(categoryMap).map(([category, stats]) => ({
      category,
      total: stats.total,
      percentage_share: totalSpent > 0 ? (stats.total / totalSpent) * 100 : 0,
      item_count: stats.count,
    }));

    // Sort descending by amount
    result.sort((a, b) => b.total - a.total);
    return result;
  },

  async monthlySummary({ month } = {}) {
    await delay();
    const user = db.requireAuth();
    const targetMonth = month || getCurrentMonth();

    const budgetStatus = await mockBudgetApi.get({ month: targetMonth });
    const categoryStats = await mockAnalyticsApi.categoryWise({ month: targetMonth });

    const totalSpent = budgetStatus.total_spent;
    const topCategory = categoryStats.length > 0 ? categoryStats[0].category : 'None';

    // Daily average based on current day of the month or total days in past month
    const [yearStr, monthNumStr] = targetMonth.split('-');
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthNumStr, 10) - 1;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const isCurrent = targetMonth === getCurrentMonth();
    const divisor = isCurrent ? Math.max(1, new Date().getDate()) : daysInMonth;

    const dailyAverage = totalSpent > 0 ? Math.round(totalSpent / divisor) : 0;

    return {
      month: targetMonth,
      budget_amount: budgetStatus.budget_amount,
      total_spent: totalSpent,
      daily_average: dailyAverage,
      top_category: topCategory,
    };
  },
};
