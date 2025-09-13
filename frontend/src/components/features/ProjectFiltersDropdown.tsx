import React, { useState, useRef, useEffect } from "react";
import { Filter, ChevronDown, X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import type { ProjectFilters } from "../../types/project";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
}

interface ProjectFiltersDropdownProps {
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
  users: User[];
  onClearFilters: () => void;
}

export const ProjectFiltersDropdown: React.FC<ProjectFiltersDropdownProps> = ({
  filters,
  onFiltersChange,
  users,
  onClearFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<ProjectFilters>(filters);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update temp filters when filters prop changes
  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    setIsOpen(false);
  };

  const handleTempFilterChange = (key: keyof ProjectFilters, value: any) => {
    setTempFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClearAll = () => {
    setTempFilters({});
    onClearFilters();
    setIsOpen(false);
  };

  // Count active filters
  const activeFiltersCount = Object.keys(filters).filter(
    (key) =>
      filters[key as keyof ProjectFilters] !== undefined &&
      filters[key as keyof ProjectFilters] !== "" &&
      filters[key as keyof ProjectFilters] !== null
  ).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative ${
          activeFiltersCount > 0 ? "border-primary-500 text-primary-700" : ""
        }`}
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
        <ChevronDown className="h-4 w-4 ml-2" />
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                Filter Projects
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={tempFilters.status || ""}
                onChange={(e) =>
                  handleTempFilterChange("status", e.target.value || undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {[
                  { key: "planning", label: "Planning" },
                  { key: "in_progress", label: "In Progress" },
                  { key: "review", label: "Under Review" },
                  { key: "on_hold", label: "On Hold" },
                  { key: "completed", label: "Completed" },
                  { key: "cancelled", label: "Cancelled" },
                ].map(({ key, label }) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={tempFilters.priority || ""}
                onChange={(e) =>
                  handleTempFilterChange(
                    "priority",
                    e.target.value || undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Priorities</option>
                {[
                  { key: "high", label: "High" },
                  { key: "medium", label: "Medium" },
                  { key: "low", label: "Low" },
                ].map(({ key, label }) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned User Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To
              </label>
              <select
                value={tempFilters.assigned_to || ""}
                onChange={(e) =>
                  handleTempFilterChange(
                    "assigned_to",
                    e.target.value || undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Users</option>
                <option value="unassigned">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id.toString()}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Client Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client
              </label>
              <Input
                placeholder="Filter by client..."
                value={tempFilters.client_name || ""}
                onChange={(e) =>
                  handleTempFilterChange(
                    "client_name",
                    e.target.value || undefined
                  )
                }
              />
            </div>

            {/* Due Date Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due After
                </label>
                <Input
                  type="date"
                  value={tempFilters.due_after || ""}
                  onChange={(e) =>
                    handleTempFilterChange(
                      "due_after",
                      e.target.value || undefined
                    )
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Before
                </label>
                <Input
                  type="date"
                  value={tempFilters.due_before || ""}
                  onChange={(e) =>
                    handleTempFilterChange(
                      "due_before",
                      e.target.value || undefined
                    )
                  }
                />
              </div>
            </div>

            {/* Overdue Toggle */}
            <div className="flex items-center">
              <input
                id="overdue-filter"
                type="checkbox"
                checked={tempFilters.is_overdue || false}
                onChange={(e) =>
                  handleTempFilterChange(
                    "is_overdue",
                    e.target.checked || undefined
                  )
                }
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="overdue-filter"
                className="ml-2 text-sm text-gray-700"
              >
                Show only overdue projects
              </label>
            </div>

            {/* Progress Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min %"
                  min="0"
                  max="100"
                  value={tempFilters.progress_min || ""}
                  onChange={(e) =>
                    handleTempFilterChange(
                      "progress_min",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                />
                <Input
                  type="number"
                  placeholder="Max %"
                  min="0"
                  max="100"
                  value={tempFilters.progress_max || ""}
                  onChange={(e) =>
                    handleTempFilterChange(
                      "progress_max",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              Clear All
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
