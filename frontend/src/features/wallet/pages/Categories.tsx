import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Tag, FolderOpen, Hash } from "lucide-react";
import walletApi from "../../../services/walletApi";
import {
  type TransactionCategory,
  type TransactionTag,
} from "../../../types/wallet";

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [tags, setTags] = useState<TransactionTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"categories" | "tags">(
    "categories"
  );

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<TransactionCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    category_type: "expense" as "income" | "expense" | "both",
    description: "",
    color: "#3B82F6",
  });

  // Tag Modal State
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TransactionTag | null>(null);
  const [tagFormData, setTagFormData] = useState({
    name: "",
    color: "#8B5CF6",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [categoriesData, tagsData] = await Promise.all([
        walletApi.getCategories(),
        walletApi.getTags(),
      ]);

      setCategories(categoriesData);
      setTags(tagsData);
    } catch (error) {
      console.error("Error loading categories and tags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Category Handlers
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await walletApi.updateCategory(editingCategory.id, categoryFormData);
      } else {
        await walletApi.createCategory(categoryFormData);
      }

      await loadData();
      handleCloseCategoryModal();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleCategoryDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await walletApi.deleteCategory(id);
        await loadData();
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  const handleCategoryEdit = (category: TransactionCategory) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      category_type: category.category_type,
      description: category.description || "",
      color: category.color,
    });
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryFormData({
      name: "",
      category_type: "expense",
      description: "",
      color: "#3B82F6",
    });
  };

  // Tag Handlers
  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await walletApi.updateTag(editingTag.id, tagFormData);
      } else {
        await walletApi.createTag(tagFormData);
      }

      await loadData();
      handleCloseTagModal();
    } catch (error) {
      console.error("Error saving tag:", error);
    }
  };

  const handleTagDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this tag?")) {
      try {
        await walletApi.deleteTag(id);
        await loadData();
      } catch (error) {
        console.error("Error deleting tag:", error);
      }
    }
  };

  const handleTagEdit = (tag: TransactionTag) => {
    setEditingTag(tag);
    setTagFormData({
      name: tag.name,
      color: tag.color,
    });
    setIsTagModalOpen(true);
  };

  const handleCloseTagModal = () => {
    setIsTagModalOpen(false);
    setEditingTag(null);
    setTagFormData({
      name: "",
      color: "#8B5CF6",
    });
  };

  const getCategoryTypeColor = (category_type: string) => {
    switch (category_type) {
      case "income":
        return "bg-green-100 text-green-800";
      case "expense":
        return "bg-red-100 text-red-800";
      case "both":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Categories & Tags
          </h1>
          <p className="text-gray-500 mt-2">
            Organize your transactions with categories and tags
          </p>
        </div>
      </div>

      {/* Tabs and Add Buttons */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("categories")}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "categories"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <FolderOpen className="h-5 w-5 mr-2" />
                  Categories ({categories.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab("tags")}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "tags"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <Hash className="h-5 w-5 mr-2" />
                  Tags ({tags.length})
                </div>
              </button>
            </nav>
            <button
              onClick={() =>
                activeTab === "categories"
                  ? setIsCategoryModalOpen(true)
                  : setIsTagModalOpen(true)
              }
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add {activeTab === "categories" ? "Category" : "Tag"}
            </button>
          </div>
        </div>

        {/* Categories Tab Content */}
        {activeTab === "categories" && (
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-700">
                  No categories yet
                </h2>
                <p className="text-gray-500 mt-2">
                  Create your first category to organize your transactions
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="bg-primary-100 p-2 rounded-lg mr-3">
                          <FolderOpen className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {category.name}
                          </h3>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${getCategoryTypeColor(
                              category.category_type
                            )}`}
                          >
                            {category.category_type}
                          </span>
                        </div>
                      </div>
                    </div>

                    {category.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {category.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-3 border-t">
                      <button
                        onClick={() => handleCategoryEdit(category)}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleCategoryDelete(category.id)}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tags Tab Content */}
        {activeTab === "tags" && (
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : tags.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-700">
                  No tags yet
                </h2>
                <p className="text-gray-500 mt-2">
                  Create your first tag to label your transactions
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                          <Tag className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">
                          #{tag.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t">
                      <button
                        onClick={() => handleTagEdit(tag)}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleTagDelete(tag.id)}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>
              <button
                onClick={handleCloseCategoryModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. Food, Salary, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={categoryFormData.category_type}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      category_type: e.target.value as
                        | "income"
                        | "expense"
                        | "both",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={categoryFormData.color}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      color: e.target.value,
                    })
                  }
                  className="w-full h-10 px-1 py-1 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={categoryFormData.description}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseCategoryModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingCategory ? "Update" : "Create"} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Tag Modal */}
      {isTagModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingTag ? "Edit Tag" : "Add Tag"}
              </h2>
              <button
                onClick={handleCloseTagModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleTagSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={tagFormData.name}
                  onChange={(e) =>
                    setTagFormData({ ...tagFormData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. urgent, work, personal, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={tagFormData.color}
                  onChange={(e) =>
                    setTagFormData({ ...tagFormData, color: e.target.value })
                  }
                  className="w-full h-10 px-1 py-1 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseTagModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingTag ? "Update" : "Create"} Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
