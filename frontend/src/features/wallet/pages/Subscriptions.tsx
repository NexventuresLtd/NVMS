import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Receipt,
  Edit,
  Trash2,
  X,
  Calendar,
  DollarSign,
} from "lucide-react";
import walletApi, {
  type Subscription,
  type SubscriptionStats,
  type Wallet,
  type TransactionCategory,
  type Project,
  type ReferenceData,
  type Currency,
} from "../../../services/walletApi";
import { formatCurrency as formatCurrencyUtil } from "../../../lib/utils";
import { SearchableSelect } from "../../../components/SearchableSelect";

const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(
    null
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);

  // Create lookup maps for efficient access
  const walletMap = useMemo(() => {
    const map = new Map<number, Wallet>();
    referenceData?.wallets.forEach((w) => map.set(w.id, w));
    return map;
  }, [referenceData]);

  const categoryMap = useMemo(() => {
    const map = new Map<number, TransactionCategory>();
    referenceData?.categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [referenceData]);

  const currencyMap = useMemo(() => {
    const map = new Map<number, Currency>();
    referenceData?.currencies.forEach((c) => map.set(c.id, c));
    return map;
  }, [referenceData]);

  const [formData, setFormData] = useState({
    wallet: "",
    category: "",
    project: "",
    name: "",
    amount: "",
    billing_cycle: "monthly" as
      | "monthly"
      | "yearly"
      | "quarterly"
      | "semi_annually",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [subsData, statsData, refData, projectsData] = await Promise.all([
        walletApi.getSubscriptions(),
        walletApi.getSubscriptionStats(),
        walletApi.getReferenceData(),
        walletApi.getProjects(),
      ]);

      setSubscriptions(subsData);
      setStats(statsData);
      setReferenceData(refData);
      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading subscription data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        wallet: parseInt(formData.wallet),
        category: parseInt(formData.category),
        project: formData.project ? formData.project : null,
        tags: [],
        name: formData.name,
        amount: formData.amount,
        billing_cycle: formData.billing_cycle,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        description: formData.description,
      };

      if (editingSubscription) {
        await walletApi.updateSubscription(editingSubscription.id, payload);
      } else {
        await walletApi.createSubscription(payload);
      }

      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving subscription:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this subscription?")) {
      try {
        await walletApi.deleteSubscription(id);
        await loadData();
      } catch (error) {
        console.error("Error deleting subscription:", error);
      }
    }
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      wallet: subscription.wallet.toString(),
      category: subscription.category.toString(),
      project: "",
      name: subscription.name,
      amount: subscription.amount,
      billing_cycle: subscription.billing_cycle,
      start_date: subscription.start_date,
      end_date: subscription.end_date || "",
      description: subscription.description || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubscription(null);
    setFormData({
      wallet: "",
      category: "",
      project: "",
      name: "",
      amount: "",
      billing_cycle: "monthly",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      description: "",
    });
  };

  const formatCurrency = (amount: string) => {
    return `$${parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getBillingCycleLabel = (cycle: string) => {
    return cycle.charAt(0).toUpperCase() + cycle.slice(1);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-500 mt-2">
            Manage recurring payments and subscriptions
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Subscription
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Monthly Cost
                </p>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  {formatCurrency(stats.total_monthly_cost)}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Subscriptions
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.active_count}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Receipt className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Subscriptions
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.total_count}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions List */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              No subscriptions yet
            </h2>
            <p className="text-gray-500 mt-2">
              Add your first subscription to track recurring payments
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Billing Cycle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Billing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((sub) => {
                  const wallet = walletMap.get(sub.wallet);
                  const category = categoryMap.get(sub.category);
                  const currency = currencyMap.get(sub.currency_original);

                  return (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Receipt className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {sub.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {wallet?.name || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: category?.color
                              ? `${category.color}20`
                              : "#f3f4f6",
                            color: category?.color || "#6b7280",
                          }}
                        >
                          {category?.name || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                        {formatCurrencyUtil(
                          parseFloat(sub.amount_original),
                          currency?.code || "RWF"
                        )}
                        <div className="text-xs text-gray-500 font-normal">
                          ≈{" "}
                          {formatCurrencyUtil(
                            parseFloat(sub.amount_rwf),
                            "RWF"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getBillingCycleLabel(sub.billing_cycle)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(sub.next_billing_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(sub)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sub.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingSubscription ? "Edit Subscription" : "Add Subscription"}
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
                    Subscription Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Netflix, Spotify, etc."
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
                    {referenceData?.wallets.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name}
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
                          c.category_type === "expense" ||
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
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Cycle *
                  </label>
                  <select
                    value={formData.billing_cycle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billing_cycle: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
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
                  {editingSubscription ? "Update" : "Add"} Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
