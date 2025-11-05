import React, { useState, useEffect } from "react";
import {
  Plus,
  PiggyBank,
  Edit,
  Trash2,
  X,
  Target,
  TrendingUp,
  Calendar,
} from "lucide-react";
import walletApi, {
  type SavingsGoal,
  type SavingsGoalStats,
  type Wallet,
} from "../../../services/walletApi";

const SavingsGoals: React.FC = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [stats, setStats] = useState<SavingsGoalStats | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [formData, setFormData] = useState({
    wallet: "",
    name: "",
    target_amount: "",
    current_amount: "0.00",
    deadline: "",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [goalsData, statsData, walletsData] = await Promise.all([
        walletApi.getSavingsGoals(),
        walletApi.getSavingsGoalStats(),
        walletApi.getWallets(),
      ]);

      setGoals(goalsData);
      setStats(statsData);
      setWallets(walletsData);
    } catch (error) {
      console.error("Error loading savings goals data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        wallet: parseInt(formData.wallet),
        name: formData.name,
        target_amount: formData.target_amount,
        current_amount: formData.current_amount,
        deadline: formData.deadline || null,
        description: formData.description,
      };

      if (editingGoal) {
        await walletApi.updateSavingsGoal(editingGoal.id, payload);
      } else {
        await walletApi.createSavingsGoal(payload);
      }

      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving savings goal:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this savings goal?")) {
      try {
        await walletApi.deleteSavingsGoal(id);
        await loadData();
      } catch (error) {
        console.error("Error deleting savings goal:", error);
      }
    }
  };

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setFormData({
      wallet: goal.wallet.id.toString(),
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      deadline: goal.deadline || "",
      description: goal.description || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
    setFormData({
      wallet: "",
      name: "",
      target_amount: "",
      current_amount: "0.00",
      deadline: "",
      description: "",
    });
  };

  const formatCurrency = (amount: string) => {
    return `$${parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getProgressPercentage = (current: string, target: string) => {
    const currentNum = parseFloat(current);
    const targetNum = parseFloat(target);
    return Math.min((currentNum / targetNum) * 100, 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Savings Goals</h1>
          <p className="text-gray-500 mt-2">
            Set and achieve your savings targets
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Goal
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Target
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats.total_target)}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Saved</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {formatCurrency(stats.total_saved)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <PiggyBank className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {stats.completion_percentage}%
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Goals
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.active_count}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              No savings goals yet
            </h2>
            <p className="text-gray-500 mt-2">
              Create your first savings goal to start saving for the future
            </p>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = getProgressPercentage(
              goal.current_amount,
              goal.target_amount
            );
            const daysRemaining = goal.deadline
              ? getDaysRemaining(goal.deadline)
              : null;

            return (
              <div
                key={goal.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-primary-100 p-3 rounded-lg mr-3">
                      <PiggyBank className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {goal.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {goal.wallet.name}
                      </p>
                    </div>
                  </div>
                  {goal.status == 'completed' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Achieved!
                    </span>
                  )}
                </div>

                {goal.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {goal.description}
                  </p>
                )}

                <div className="mb-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(goal.current_amount)} /{" "}
                      {formatCurrency(goal.target_amount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all bg-primary-600"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {progress.toFixed(1)}% completed
                    </span>
                    {daysRemaining !== null && (
                      <span
                        className={`text-xs font-medium ${
                          daysRemaining < 0 ? "text-red-600" : "text-blue-600"
                        }`}
                      >
                        {daysRemaining < 0
                          ? `${Math.abs(daysRemaining)} days overdue`
                          : `${daysRemaining} days left`}
                      </span>
                    )}
                  </div>
                </div>

                {goal.deadline && (
                  <div className="text-xs text-gray-500 mb-4">
                    Target date: {new Date(goal.deadline).toLocaleDateString()}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingGoal ? "Edit Savings Goal" : "Add Savings Goal"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="New Car, Vacation, etc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wallet *
                  </label>
                  <select
                    value={formData.wallet}
                    onChange={(e) =>
                      setFormData({ ...formData, wallet: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select wallet</option>
                    {wallets.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.target_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        target_amount: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.current_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        current_amount: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingGoal ? "Update" : "Create"} Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsGoals;
