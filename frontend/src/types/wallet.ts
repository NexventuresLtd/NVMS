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
  wallet_type: 'savings' | 'current' | 'cash' | 'mobile_money' | 'credit_card' | 'investment' | 'other';
  initial_balance: string;
  balance: string;
  currency: number;
  currency_details: Currency;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_income?: string;
  total_expense?: string;
  currency_code?: string;
  currency_symbol?: string;
  balance_rwf?: string;
}

export interface WalletCreateData {
  name: string;
  wallet_type: 'savings' | 'current' | 'cash' | 'mobile_money' | 'credit_card' | 'investment' | 'other';
  initial_balance: string;
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
  title: string;
  wallet: number;
  category: number;
  project?: string | null;
  tags?: number[];
  amount: string;
  amount_rwf: string;
  amount_original: string;
  currency_original: number;
  description: string;
  date: string;
  is_recurring: boolean;
  recurrence_type: string;
  recurrence_type_display?: string;
  recurrence_day?: number | null;
  next_occurrence?: string | null;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

// Full income details (when fetching single item)
export interface IncomeDetail extends Income {
  wallet_details: Wallet;
  category_details: TransactionCategory;
  tags_details: TransactionTag[];
  project_details?: Project | null;
  currency_original_details?: Currency;
  created_by_details?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface IncomeCreateData {
  title: string;
  wallet: number;
  category: number;
  tags?: number[];
  project?: number | string | null;
  amount_original: string;
  currency_original: number;
  description: string;
  date: string;
  is_recurring?: boolean;
  recurrence_interval?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  recurrence_day?: number | null;
}

export interface Expense {
  id: number;
  title: string;
  wallet: number;
  category: number;
  project?: string | null;
  tags?: number[];
  amount: string;
  amount_rwf: string;
  amount_original: string;
  currency_original: number;
  description: string;
  date: string;
  is_recurring: boolean;
  recurrence_type: string;
  recurrence_type_display?: string;
  recurrence_day?: number | null;
  next_occurrence?: string | null;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

// Full expense details (when fetching single item)
export interface ExpenseDetail extends Expense {
  wallet_details: Wallet;
  category_details: TransactionCategory;
  tags_details: TransactionTag[];
  project_details?: Project | null;
  currency_original_details?: Currency;
  created_by_details?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface ExpenseCreateData {
  title: string;
  wallet: number;
  category: number;
  tags?: number[];
  project?: string | null;
  amount_original: string;
  currency_original: number;
  description: string;
  date: string;
  is_recurring?: boolean;
  recurrence_interval?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  recurrence_day?: number | null;
}

export interface Subscription {
  id: number;
  name: string;
  wallet: number;
  category: number;
  currency_original: number;
  amount: string;
  amount_rwf: string;
  amount_original: string;
  billing_cycle: 'monthly' | 'quarterly' | 'semi_annually' | 'yearly';
  billing_cycle_display?: string;
  status: 'active' | 'paused' | 'cancelled';
  status_display?: string;
  start_date: string;
  next_billing_date: string;
  end_date?: string | null;
  days_until_renewal?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Full subscription details (when fetching single item)
export interface SubscriptionDetail extends Subscription {
  wallet_details: Wallet;
  category_details: TransactionCategory;
  currency_original_details?: Currency;
}

export interface SubscriptionCreateData {
  wallet: number;
  category: number;
  tags?: number[];
  project?: string | null;
  name: string;
  amount: string;
  billing_cycle: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'quarterly' | 'semi_annually';
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
  status: 'active' | 'completed' | 'cancelled';
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
  currency: string;
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
  currency: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ReferenceData {
  wallets: Wallet[];
  currencies: Currency[];
  categories: TransactionCategory[];
  tags: TransactionTag[];
}