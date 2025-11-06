import { api } from '../lib/api';
import type { PaginatedResponse } from '../types/common';
import type { Project } from '../types/project';
import type { Budget, BudgetCreateData, BudgetStats, Currency, DashboardStats, Expense, ExpenseCreateData, ExpenseStats, Income, IncomeCreateData, IncomeStats, ReferenceData, SavingsGoal, SavingsGoalCreateData, Subscription, SubscriptionCreateData, SubscriptionStats, TransactionCategory, TransactionTag, Wallet, WalletCreateData } from '../types/wallet';

class WalletApi {
  // Reference Data - Fetch all reference data in one request
  async getReferenceData(): Promise<ReferenceData> {
    const response = await api.get('/wallet/reference-data/');
    return response.data;
  }

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

  async getSavingsGoalStats(): Promise<SavingsGoal> {
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

  // Transfer between wallets
  async transferFunds(
    sourceWalletId: number,
    targetWalletId: number,
    amount: string
  ): Promise<{ message: string; source_balance: string; target_balance: string }> {
    const response = await api.post(`/wallet/wallets/${sourceWalletId}/transfer/`, {
      target_wallet_id: targetWalletId,
      amount: amount,
    });
    return response.data;
  }
}

export default new WalletApi();
