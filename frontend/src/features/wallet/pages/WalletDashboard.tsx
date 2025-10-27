import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import walletApi, { type DashboardStats } from "../../../services/walletApi";

const WalletDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await walletApi.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: string) => {
    return `$${parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wallet Overview</h1>
        <p className="text-gray-500 mt-2">
          Track your finances and manage your budget
        </p>
      </div>

      {/* Main Stats Cards */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Balance
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {formatCurrency(stats.total_balance)}
                  </p>
                </div>
                <div className="bg-primary-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Income
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {formatCurrency(stats.total_income)}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Expenses
                  </p>
                  <p className="text-2xl font-bold text-red-600 mt-2">
                    {formatCurrency(stats.total_expenses)}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Wallets
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stats.active_wallets}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Monthly Income
                </h3>
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(stats.monthly_income)}
              </p>
              <p className="text-sm text-gray-500 mt-2">This month</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Monthly Expenses
                </h3>
                <ArrowDownRight className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(stats.monthly_expenses)}
              </p>
              <p className="text-sm text-gray-500 mt-2">This month</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Net Monthly
                </h3>
                <DollarSign className="h-5 w-5 text-primary-600" />
              </div>
              <p
                className={`text-3xl font-bold ${
                  parseFloat(stats.net_monthly) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatCurrency(stats.net_monthly)}
              </p>
              <p className="text-sm text-gray-500 mt-2">Income - Expenses</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/wallet/income"
                className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  Add Income
                </span>
              </a>
              <a
                href="/wallet/expenses"
                className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <TrendingDown className="h-8 w-8 text-red-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  Add Expense
                </span>
              </a>
              <a
                href="/wallet/accounts"
                className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <CreditCard className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  Manage Wallets
                </span>
              </a>
              <a
                href="/wallet/budgets"
                className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <DollarSign className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  View Budgets
                </span>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WalletDashboard;
