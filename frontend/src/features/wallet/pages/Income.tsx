import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  TrendingUp,
  Calendar,
  DollarSign,
  X,
  Edit,
  Trash2,
} from "lucide-react";
import walletApi, {
  type Income as IncomeType,
  type IncomeStats,
  type Wallet,
  type TransactionCategory,
  type Project,
  type Currency,
  type ReferenceData,
} from "../../../services/walletApi";
import { formatCurrency } from "../../../lib/utils";
import { SearchableSelect } from "../../../components/SearchableSelect";
import { GroupPermission } from "../../../components/GroupPermission";

const Income: React.FC = () => {
  const [income, setIncome] = useState<IncomeType[]>([]);
  const [stats, setStats] = useState<IncomeStats | null>(null);
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(
    null
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingIncome, setEditingIncome] = useState<IncomeType | null>(null);

  // Create lookup maps for O(1) access
  const walletMap = useMemo(() => {
    if (!referenceData) return new Map<number, Wallet>();
    return new Map(referenceData.wallets.map((w) => [w.id, w]));
  }, [referenceData]);

  const categoryMap = useMemo(() => {
    if (!referenceData) return new Map<number, TransactionCategory>();
    return new Map(referenceData.categories.map((c) => [c.id, c]));
  }, [referenceData]);

  const currencyMap = useMemo(() => {
    if (!referenceData) return new Map<number, Currency>();
    return new Map(referenceData.currencies.map((c) => [c.id, c]));
  }, [referenceData]);

  const [formData, setFormData] = useState({
    wallet: "",
    category: "",
    project: "",
    tags: [] as number[],
    amount_original: "",
    currency_original: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    is_recurring: false,
    recurrence_interval: "" as "daily" | "weekly" | "monthly" | "yearly" | "",
    recurrence_day: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load income stats, reference data, and projects in parallel
      const [incomeResponse, statsResponse, refData, projectsData] =
        await Promise.all([
          walletApi.getIncome(),
          walletApi.getIncomeStats(),
          walletApi.getReferenceData(),
          walletApi.getProjects(),
        ]);

      setIncome(incomeResponse.results);
      setStats(statsResponse);
      setReferenceData(refData);
      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: `Income of ${formData.amount_original} for project ${formData.project}`,
        wallet: parseInt(formData.wallet),
        category: parseInt(formData.category),
        project: formData.project ?? null,
        tags: formData.tags,
        amount_original: formData.amount_original,
        currency_original: parseInt(formData.currency_original),
        description: formData.description,
        date: formData.date,
        is_recurring: formData.is_recurring,
        recurrence_interval:
          formData.is_recurring && formData.recurrence_interval
            ? formData.recurrence_interval
            : null,
        recurrence_day:
          formData.is_recurring && formData.recurrence_day
            ? parseInt(formData.recurrence_day)
            : null,
      };

      if (editingIncome) {
        await walletApi.updateIncome(editingIncome.id, payload);
      } else {
        await walletApi.createIncome(payload);
      }

      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving income:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this income?")) {
      try {
        await walletApi.deleteIncome(id);
        await loadData();
      } catch (error) {
        console.error("Error deleting income:", error);
      }
    }
  };

  const handleEdit = (income: IncomeType) => {
    setEditingIncome(income);
    setFormData({
      wallet: income.wallet.toString(),
      category: income.category.toString(),
      project: income.project?.toString() || "",
      tags: income.tags || [],
      amount_original: income.amount_original,
      currency_original: income.currency_original.toString(),
      description: income.description,
      date: income.date,
      is_recurring: income.is_recurring,
      recurrence_interval: income.recurrence_type as
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly"
        | "",
      recurrence_day: income.recurrence_day?.toString() || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIncome(null);
    setFormData({
      wallet: "",
      category: "",
      project: "",
      tags: [],
      amount_original: "",
      currency_original: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      is_recurring: false,
      recurrence_interval: "",
      recurrence_day: "",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Income</h1>
          <p className="text-gray-500 mt-2">Track your income transactions</p>
        </div>
        <GroupPermission group="Finance Managers">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Income
          </button>
        </GroupPermission>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Income
                </p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {formatCurrency(parseFloat(stats.total), stats.currency)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(parseFloat(stats.this_month), stats.currency)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Year</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(parseFloat(stats.this_year), stats.currency)}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Transactions
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.count}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Income List */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : income.length === 0 ? (
          <div className="p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              No income records yet
            </h2>
            <p className="text-gray-500 mt-2">
              Add your first income transaction to get started
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <GroupPermission group="Finance Managers">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </GroupPermission>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {income.map((item) => {
                  const wallet = walletMap.get(item.wallet);
                  const category = categoryMap.get(item.category);
                  const currency = currencyMap.get(item.currency_original);

                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.description}
                        {item.is_recurring && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Recurring
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category && (
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${category.color}20`,
                              color: category.color,
                            }}
                          >
                            {category.name}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {wallet?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {formatCurrency(
                          parseFloat(item.amount_original),
                          currency?.code || "RWF"
                        )}
                        <div className="text-xs text-gray-500 font-normal">
                          ≈ {formatCurrency(parseFloat(item.amount_rwf), "RWF")}
                        </div>
                      </td>
                      <GroupPermission group="Finance Managers">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </GroupPermission>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Income Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingIncome ? "Edit Income" : "Add Income"}
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
                    {referenceData?.wallets.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} ({wallet.currency_details.symbol}
                        {wallet.balance})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select category</option>
                    {referenceData?.categories
                      .filter(
                        (c) =>
                          c.category_type === "income" ||
                          c.category_type === "both"
                      )
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project (Optional)
                  </label>
                  <SearchableSelect
                    options={projects.map((project) => ({
                      id: project.id,
                      label: project.title,
                    }))}
                    value={formData.project}
                    onChange={(value) =>
                      setFormData({ ...formData, project: value.toString() })
                    }
                    placeholder="Search projects..."
                    emptyLabel="No project"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency *
                  </label>
                  <select
                    value={formData.currency_original}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currency_original: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select currency</option>
                    {referenceData?.currencies.map((currency) => (
                      <option key={currency.id} value={currency.id}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount_original}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount_original: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Enter description..."
                  required
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_recurring}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_recurring: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Recurring income
                  </span>
                </label>
              </div>

              {formData.is_recurring && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recurrence Interval
                    </label>
                    <select
                      value={formData.recurrence_interval}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recurrence_interval: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select interval</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day of Month (1-31)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.recurrence_day}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recurrence_day: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="15"
                    />
                  </div>
                </div>
              )}

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
                  {editingIncome ? "Update" : "Add"} Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Income;
