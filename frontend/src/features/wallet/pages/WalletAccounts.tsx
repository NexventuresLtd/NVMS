import React, { useState, useEffect } from "react";
import {
  Plus,
  CreditCard,
  Edit,
  Trash2,
  X,
  Wallet as WalletIcon,
  ArrowRightLeft,
} from "lucide-react";
import walletApi, {
  type Wallet,
  type Currency,
} from "../../../services/walletApi";
import { formatCurrency } from "../../../lib/utils";

const WalletAccounts: React.FC = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    wallet_type: "current" as
      | "savings"
      | "current"
      | "cash"
      | "mobile_money"
      | "credit_card"
      | "investment"
      | "other",
    initial_balance: "0.00",
    currency: "",
    description: "",
    is_active: true,
  });

  const [transferData, setTransferData] = useState({
    source_wallet: "",
    target_wallet: "",
    amount: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [walletsData, currenciesData] = await Promise.all([
        walletApi.getWallets(),
        walletApi.getCurrencies(),
      ]);

      setWallets(walletsData);
      setCurrencies(currenciesData);
    } catch (error) {
      console.error("Error loading wallet data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        wallet_type: formData.wallet_type,
        initial_balance: formData.initial_balance,
        currency: parseInt(formData.currency),
        description: formData.description,
        is_active: formData.is_active,
      };

      if (editingWallet) {
        await walletApi.updateWallet(editingWallet.id, payload);
      } else {
        await walletApi.createWallet(payload);
      }

      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving wallet:", error);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await walletApi.transferFunds(
        parseInt(transferData.source_wallet),
        parseInt(transferData.target_wallet),
        transferData.amount
      );

      await loadData();
      handleCloseTransferModal();
      alert("Transfer completed successfully!");
    } catch (error) {
      console.error("Error transferring funds:", error);
      alert("Transfer failed. Please check your balance and try again.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this wallet?")) {
      try {
        await walletApi.deleteWallet(id);
        await loadData();
      } catch (error) {
        console.error("Error deleting wallet:", error);
      }
    }
  };

  const handleEdit = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setFormData({
      name: wallet.name,
      wallet_type: wallet.wallet_type,
      initial_balance: wallet.initial_balance,
      currency: wallet.currency_details.id.toString(),
      description: wallet.description || "",
      is_active: wallet.is_active,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWallet(null);
    setFormData({
      name: "",
      wallet_type: "current",
      initial_balance: "0.00",
      currency: "",
      description: "",
      is_active: true,
    });
  };

  const handleCloseTransferModal = () => {
    setIsTransferModalOpen(false);
    setTransferData({
      source_wallet: "",
      target_wallet: "",
      amount: "",
    });
  };

  const getWalletTypeColor = (type: string) => {
    switch (type) {
      case "savings":
        return "bg-green-100 text-green-800";
      case "current":
        return "bg-blue-100 text-blue-800";
      case "cash":
        return "bg-yellow-100 text-yellow-800";
      case "mobile_money":
        return "bg-purple-100 text-purple-800";
      case "credit_card":
        return "bg-red-100 text-red-800";
      case "investment":
        return "bg-indigo-100 text-indigo-800";
      case "other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalBalance = wallets.reduce(
    (sum, wallet) => sum + parseFloat(wallet.balance),
    0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wallets</h1>
          <p className="text-gray-500 mt-2">
            Manage your accounts and balances
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowRightLeft className="h-5 w-5 mr-2" />
            Transfer Funds
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Wallet
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary-100">
              Total Balance
            </p>
            <p className="text-4xl font-bold mt-2">
              {formatCurrency(totalBalance, "RWF")}
            </p>
            <p className="text-sm text-primary-100 mt-2">
              {wallets.length} active wallet{wallets.length !== 1 ? "s" : ""}
            </p>
          </div>
          <WalletIcon className="h-16 w-16 text-primary-200" />
        </div>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">Loading wallets...</p>
          </div>
        ) : wallets.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              No wallets yet
            </h2>
            <p className="text-gray-500 mt-2">
              Create your first wallet to start tracking your finances
            </p>
          </div>
        ) : (
          wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <CreditCard className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {wallet.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getWalletTypeColor(
                          wallet.wallet_type
                        )}`}
                      >
                        {wallet.wallet_type.charAt(0).toUpperCase() +
                          wallet.wallet_type.slice(1).replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Balance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(
                        parseFloat(wallet.balance),
                        wallet.currency_details.code
                      )}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Initial Balance:</span>
                    <span className="font-medium text-gray-700">
                      {formatCurrency(
                        parseFloat(wallet.initial_balance),
                        wallet.currency_details.code
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {wallet.currency_details.name} (
                    {wallet.currency_details.code})
                  </p>
                </div>

                {wallet.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {wallet.description}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(wallet)}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(wallet.id)}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Wallet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingWallet ? "Edit Wallet" : "Add Wallet"}
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
                    Wallet Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="My Savings Account"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wallet Type *
                  </label>
                  <select
                    value={formData.wallet_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        wallet_type: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="current">Current</option>
                    <option value="savings">Savings</option>
                    <option value="cash">Cash</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="investment">Investment</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Balance *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.initial_balance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        initial_balance: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Starting balance when wallet was created
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select currency</option>
                    {currencies.map((currency) => (
                      <option key={currency.id} value={currency.id}>
                        {currency.name} ({currency.symbol})
                      </option>
                    ))}
                  </select>
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

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Active wallet
                  </span>
                </label>
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
                  {editingWallet ? "Update" : "Create"} Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Funds Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                Transfer Funds
              </h2>
              <button
                onClick={handleCloseTransferModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Wallet *
                </label>
                <select
                  value={transferData.source_wallet}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      source_wallet: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select source wallet</option>
                  {wallets
                    .filter((w) => w.is_active)
                    .map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} -{" "}
                        {formatCurrency(
                          parseFloat(wallet.balance),
                          wallet.currency_details.code
                        )}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Wallet *
                </label>
                <select
                  value={transferData.target_wallet}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      target_wallet: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select destination wallet</option>
                  {wallets
                    .filter(
                      (w) =>
                        w.is_active &&
                        w.id.toString() !== transferData.source_wallet
                    )
                    .map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} -{" "}
                        {formatCurrency(
                          parseFloat(wallet.balance),
                          wallet.currency_details.code
                        )}
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
                  value={transferData.amount}
                  onChange={(e) =>
                    setTransferData({ ...transferData, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseTransferModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletAccounts;
