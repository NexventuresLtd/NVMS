import { api } from '../lib/api';

// Types
export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  is_default: boolean;
}

export interface Wallet {
  id: number;
  name: string;
  wallet_type: 'savings' | 'current' | 'cash' | 'investment' | 'other';
  balance: string;
  currency: number;
  currency_details: Currency;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WalletCreateData {
  name: string;
  wallet_type: 'savings' | 'current' | 'cash' | 'investment' | 'other';
  balance: string;
  currency: number;
  description?: string;
  is_active?: boolean;
}

export interface TransactionCategory {
  id: number;
  name: string;
  category_type: 'income' | 'expense' | 'both';
  description?: string;
  color: string;
  icon?: string;
  parent?: number;
  is_active: boolean;
}

export interface TransactionTag {
  id: number;
  name: string;
  color: string;
}

export interface Project {
  id: number | string;
  title: string;
  description?: string;
  status: string;
}

export interface Income {
  id: number;
  wallet: number;
  wallet_details: Wallet;
  category: number;
  category_details: TransactionCategory;
  tags: TransactionTag[];
  project?: Project | null;
  amount: string;
  description: string;
  date: string;
  is_recurring: boolean;
  recurrence_interval?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  recurrence_day?: number | null;
  next_occurrence?: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncomeCreateData {
  wallet: number;
  category: number;
  tags?: number[];
  project?: number | string | null;
  amount: string;
  description: string;
  date: string;
  is_recurring?: boolean;
  recurrence_interval?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  recurrence_day?: number | null;
}

export interface Expense {
  id: number;
  wallet: Wallet;
  category: TransactionCategory;
  tags: TransactionTag[];
  project?: Project | null;
  amount: string;
  description: string;
  date: string;
  is_recurring: boolean;
  recurrence_interval?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  recurrence_day?: number | null;
  next_occurrence?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCreateData {
  wallet: number;
  category: number;
  tags?: number[];
  project?: number | null;
  amount: string;
  description: string;
  date: string;
  is_recurring?: boolean;
  recurrence_interval?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  recurrence_day?: number | null;
}

export interface Subscription {
  id: number;
  wallet: Wallet;
  category: TransactionCategory;
  tags: TransactionTag[];
  project?: Project | null;
  name: string;
  amount: string;
  billing_cycle: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  next_billing_date: string;
  end_date?: string | null;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionCreateData {
  wallet: number;
  category: number;
  tags?: number[];
  project?: number | null;
  name: string;
  amount: string;
  billing_cycle: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string | null;
  description?: string;
  is_active?: boolean;
}

export interface Budget {
  id: number;
  category: TransactionCategory;
  amount: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string | null;
  spent?: string;
  remaining?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BudgetCreateData {
  category: number;
  amount: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string | null;
  is_active?: boolean;
}

export interface SavingsGoal {
  id: number;
  wallet: Wallet;
  name: string;
  target_amount: string;
  current_amount: string;
  deadline?: string | null;
  description?: string;
  is_achieved: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavingsGoalCreateData {
  wallet: number;
  name: string;
  target_amount: string;
  current_amount?: string;
  deadline?: string | null;
  description?: string;
}

export interface IncomeStats {
  total: string;
  this_month: string;
  this_year: string;
  count: number;
}

export interface ExpenseStats {
  total: string;
  this_month: string;
  this_year: string;
  count: number;
}

export interface SubscriptionStats {
  total_monthly_cost: string;
  active_count: number;
  total_count: number;
}

export interface BudgetStats {
  total_budgeted: string;
  total_spent: string;
  total_remaining: string;
  active_count: number;
}

export interface SavingsGoalStats {
  total_target: string;
  total_saved: string;
  completion_percentage: string;
  active_count: number;
}

export interface DashboardStats {
  total_balance: string;
  total_income: string;
  total_expenses: string;
  active_wallets: number;
  monthly_income: string;
  monthly_expenses: string;
  net_monthly: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

class WalletApi {
  // Currencies
  async getCurrencies(): Promise<Currency[]> {
    const response = await api.get('/wallet/currencies/');
    return response.data.results || response.data;
  }

  // Wallets
  async getWallets(): Promise<Wallet[]> {
    const response = await api.get('/wallet/wallets/');
    return response.data.results || response.data;
  }

  async getWallet(id: number): Promise<Wallet> {
    const response = await api.get(`/wallet/wallets/${id}/`);
    return response.data;
  }

  async createWallet(data: WalletCreateData): Promise<Wallet> {
    const response = await api.post('/wallet/wallets/', data);
    return response.data;
  }

  async updateWallet(id: number, data: Partial<WalletCreateData>): Promise<Wallet> {
    const response = await api.patch(`/wallet/wallets/${id}/`, data);
    return response.data;
  }

  async deleteWallet(id: number): Promise<void> {
    await api.delete(`/wallet/wallets/${id}/`);
  }

  // Categories
  async getCategories(type?: 'income' | 'expense' | 'both'): Promise<TransactionCategory[]> {
    const params = type ? `?category_type=${type}` : '';
    const response = await api.get(`/wallet/categories/${params}`);
    return response.data.results || response.data;
  }

  async createCategory(data: Partial<TransactionCategory>): Promise<TransactionCategory> {
    const response = await api.post('/wallet/categories/', data);
    return response.data;
  }

  async updateCategory(id: number, data: Partial<TransactionCategory>): Promise<TransactionCategory> {
    const response = await api.patch(`/wallet/categories/${id}/`, data);
    return response.data;
  }

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/wallet/categories/${id}/`);
  }

  // Tags
  async getTags(): Promise<TransactionTag[]> {
    const response = await api.get('/wallet/tags/');
    return response.data.results || response.data;
  }

  async createTag(data: Partial<TransactionTag>): Promise<TransactionTag> {
    const response = await api.post('/wallet/tags/', data);
    return response.data;
  }

  async updateTag(id: number, data: Partial<TransactionTag>): Promise<TransactionTag> {
    const response = await api.patch(`/wallet/tags/${id}/`, data);
    return response.data;
  }

  async deleteTag(id: number): Promise<void> {
    await api.delete(`/wallet/tags/${id}/`);
  }

  // Income
  async getIncome(params?: Record<string, string>): Promise<PaginatedResponse<Income>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    const response = await api.get(`/wallet/incomes/${queryString}`);
    return response.data;
  }

  async getIncomeById(id: number): Promise<Income> {
    const response = await api.get(`/wallet/incomes/${id}/`);
    return response.data;
  }

  async createIncome(data: IncomeCreateData): Promise<Income> {
    const response = await api.post('/wallet/incomes/', data);
    return response.data;
  }

  async updateIncome(id: number, data: Partial<IncomeCreateData>): Promise<Income> {
    const response = await api.patch(`/wallet/incomes/${id}/`, data);
    return response.data;
  }

  async deleteIncome(id: number): Promise<void> {
    await api.delete(`/wallet/incomes/${id}/`);
  }

  async getIncomeStats(): Promise<IncomeStats> {
    const response = await api.get('/wallet/incomes/stats/');
    return response.data;
  }

  // Expenses
  async getExpenses(params?: Record<string, string>): Promise<PaginatedResponse<Expense>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    const response = await api.get(`/wallet/expenses/${queryString}`);
    return response.data;
  }

  async getExpenseById(id: number): Promise<Expense> {
    const response = await api.get(`/wallet/expenses/${id}/`);
    return response.data;
  }

  async createExpense(data: ExpenseCreateData): Promise<Expense> {
    const response = await api.post('/wallet/expenses/', data);
    return response.data;
  }

  async updateExpense(id: number, data: Partial<ExpenseCreateData>): Promise<Expense> {
    const response = await api.patch(`/wallet/expenses/${id}/`, data);
    return response.data;
  }

  async deleteExpense(id: number): Promise<void> {
    await api.delete(`/wallet/expenses/${id}/`);
  }

  async getExpenseStats(): Promise<ExpenseStats> {
    const response = await api.get('/wallet/expenses/stats/');
    return response.data;
  }

  // Subscriptions
  async getSubscriptions(): Promise<Subscription[]> {
    const response = await api.get('/wallet/subscriptions/');
    return response.data.results || response.data;
  }

  async getSubscriptionById(id: number): Promise<Subscription> {
    const response = await api.get(`/wallet/subscriptions/${id}/`);
    return response.data;
  }

  async createSubscription(data: SubscriptionCreateData): Promise<Subscription> {
    const response = await api.post('/wallet/subscriptions/', data);
    return response.data;
  }

  async updateSubscription(id: number, data: Partial<SubscriptionCreateData>): Promise<Subscription> {
    const response = await api.patch(`/wallet/subscriptions/${id}/`, data);
    return response.data;
  }

  async deleteSubscription(id: number): Promise<void> {
    await api.delete(`/wallet/subscriptions/${id}/`);
  }

  async getSubscriptionStats(): Promise<SubscriptionStats> {
    const response = await api.get('/wallet/subscriptions/stats/');
    return response.data;
  }

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    const response = await api.get('/wallet/budgets/');
    return response.data.results || response.data;
  }

  async getBudgetById(id: number): Promise<Budget> {
    const response = await api.get(`/wallet/budgets/${id}/`);
    return response.data;
  }

  async createBudget(data: BudgetCreateData): Promise<Budget> {
    const response = await api.post('/wallet/budgets/', data);
    return response.data;
  }

  async updateBudget(id: number, data: Partial<BudgetCreateData>): Promise<Budget> {
    const response = await api.patch(`/wallet/budgets/${id}/`, data);
    return response.data;
  }

  async deleteBudget(id: number): Promise<void> {
    await api.delete(`/wallet/budgets/${id}/`);
  }

  async getBudgetStats(): Promise<BudgetStats> {
    const response = await api.get('/wallet/budgets/stats/');
    return response.data;
  }

  // Savings Goals
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    const response = await api.get('/wallet/savings-goals/');
    return response.data.results || response.data;
  }

  async getSavingsGoalById(id: number): Promise<SavingsGoal> {
    const response = await api.get(`/wallet/savings-goals/${id}/`);
    return response.data;
  }

  async createSavingsGoal(data: SavingsGoalCreateData): Promise<SavingsGoal> {
    const response = await api.post('/wallet/savings-goals/', data);
    return response.data;
  }

  async updateSavingsGoal(id: number, data: Partial<SavingsGoalCreateData>): Promise<SavingsGoal> {
    const response = await api.patch(`/wallet/savings-goals/${id}/`, data);
    return response.data;
  }

  async deleteSavingsGoal(id: number): Promise<void> {
    await api.delete(`/wallet/savings-goals/${id}/`);
  }

  async getSavingsGoalStats(): Promise<SavingsGoalStats> {
    const response = await api.get('/wallet/savings-goals/stats/');
    return response.data;
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    const response = await api.get('/projects/');
    return response.data.results || response.data;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get('/wallet/dashboard/stats/');
    return response.data;
  }
}

export default new WalletApi();
