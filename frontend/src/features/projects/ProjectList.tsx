import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, Table } from "../../components/ui";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ProjectFiltersDropdown } from "../../components/features/ProjectFiltersDropdown";
import {
  Plus,
  Search,
  Calendar,
  User,
  DollarSign,
  Grid3X3,
  List,
  X,
} from "lucide-react";
import projectsApi from "../../services/projectsApi";
import type { ProjectListItem, ProjectFilters } from "../../types/project";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  PROJECT_PRIORITY_COLORS,
} from "../../types/project";

export const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadProjectsAndUsers();
  }, [filters]);

  const loadProjectsAndUsers = async () => {
    try {
      setIsLoading(true);
      const [projectsResponse, usersResponse] = await Promise.all([
        projectsApi.getProjects(filters),
        projectsApi.getUsers(),
      ]);
      setProjects(projectsResponse.results || []);
      setUsers(usersResponse || []);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchQuery }));
  };

  const handleFiltersChange = (newFilters: ProjectFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Define custom sort orders for priority and status
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const statusOrder = {
    planning: 0,
    in_progress: 1,
    review: 2,
    on_hold: 3,
    completed: 4,
    cancelled: 5,
  };

  const sortedProjects = [...projects].sort((a, b) => {
    const aValue = a[sortBy as keyof ProjectListItem];
    const bValue = b[sortBy as keyof ProjectListItem];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    // Special handling for priority
    if (sortBy === "priority") {
      const aPriority =
        priorityOrder[aValue as keyof typeof priorityOrder] ?? 999;
      const bPriority =
        priorityOrder[bValue as keyof typeof priorityOrder] ?? 999;
      return sortOrder === "asc"
        ? aPriority - bPriority
        : bPriority - aPriority;
    }

    // Special handling for status
    if (sortBy === "status") {
      const aStatus = statusOrder[aValue as keyof typeof statusOrder] ?? 999;
      const bStatus = statusOrder[bValue as keyof typeof statusOrder] ?? 999;
      return sortOrder === "asc" ? aStatus - bStatus : bStatus - aStatus;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }

    // For dates
    const aDate = new Date(aValue as string).getTime();
    const bDate = new Date(bValue as string).getTime();
    return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "Not set";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Table columns definition
  const tableColumns = [
    {
      key: "title",
      label: "Project",
      sortable: true,
      render: (value: string, row: ProjectListItem) => (
        <div>
          <Link
            to={`/projects/${row.id}`}
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            {value}
          </Link>
          <p className="text-sm text-gray-500 truncate max-w-xs">
            {row.description}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            PROJECT_STATUS_COLORS[value as keyof typeof PROJECT_STATUS_COLORS]
          }`}
        >
          {PROJECT_STATUS_LABELS[value as keyof typeof PROJECT_STATUS_LABELS]}
        </span>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            PROJECT_PRIORITY_COLORS[
              value as keyof typeof PROJECT_PRIORITY_COLORS
            ]
          }`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: "progress_percentage",
      label: "Progress",
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">{value}%</span>
        </div>
      ),
    },
    {
      key: "assigned_to",
      label: "Assigned To",
      sortable: false,
      render: (value: any) =>
        value ? `${value.first_name} ${value.last_name}` : "Unassigned",
    },
    {
      key: "due_date",
      label: "Due Date",
      sortable: true,
      render: (value: string, row: ProjectListItem) => (
        <span className={row.is_overdue ? "text-red-600 font-medium" : ""}>
          {value ? formatDate(value) : "Not set"}
          {row.is_overdue && " (Overdue)"}
        </span>
      ),
    },
    {
      key: "client_name",
      label: "Client",
      sortable: true,
      render: (value: string) => value || "—",
    },
    {
      key: "budget",
      label: "Budget",
      sortable: true,
      render: (value: number) => (value ? formatCurrency(value) : "—"),
    },
  ];

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
                <Button onClick={loadProjectsAndUsers} className="mt-4">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
              <p className="text-gray-600 mt-2">
                Manage and track all your projects
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-white text-primary-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "table"
                      ? "bg-white text-primary-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Table View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              <Link to="/projects/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent>
            <div className="flex gap-4 items-start">
              <form onSubmit={handleSearch} className="flex gap-4 flex-1">
                <div className="flex-1">
                  <Input
                    placeholder="Search projects by title, description, or client..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    startIcon={<Search className="h-4 w-4 text-gray-400" />}
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>

              {/* Filters Dropdown */}
              <ProjectFiltersDropdown
                filters={filters}
                onFiltersChange={handleFiltersChange}
                users={users}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Active Filters Display */}
            {Object.keys(filters).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-700">
                    Active filters:
                  </span>

                  {filters.status && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      Status: {PROJECT_STATUS_LABELS[filters.status]}
                      <button
                        onClick={() =>
                          handleFiltersChange({ ...filters, status: undefined })
                        }
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}

                  {filters.priority && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                      Priority:{" "}
                      {filters.priority.charAt(0).toUpperCase() +
                        filters.priority.slice(1)}
                      <button
                        onClick={() =>
                          handleFiltersChange({
                            ...filters,
                            priority: undefined,
                          })
                        }
                        className="ml-1 text-orange-600 hover:text-orange-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}

                  {filters.assigned_to && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                      Assigned:{" "}
                      {filters.assigned_to === "unassigned"
                        ? "Unassigned"
                        : users.find(
                            (u) =>
                              u.id.toString() ===
                              filters.assigned_to?.toString()
                          )?.first_name +
                          " " +
                          users.find(
                            (u) =>
                              u.id.toString() ===
                              filters.assigned_to?.toString()
                          )?.last_name}
                      <button
                        onClick={() =>
                          handleFiltersChange({
                            ...filters,
                            assigned_to: undefined,
                          })
                        }
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}

                  {filters.is_overdue && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800">
                      Overdue Only
                      <button
                        onClick={() =>
                          handleFiltersChange({
                            ...filters,
                            is_overdue: undefined,
                          })
                        }
                        className="ml-1 text-red-600 hover:text-red-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}

                  {filters.client_name && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                      Client: {filters.client_name}
                      <button
                        onClick={() =>
                          handleFiltersChange({
                            ...filters,
                            client_name: undefined,
                          })
                        }
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}

                  {(filters.due_after || filters.due_before) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                      Due Date:{" "}
                      {filters.due_after && `After ${filters.due_after}`}
                      {filters.due_after && filters.due_before && " & "}
                      {filters.due_before && `Before ${filters.due_before}`}
                      <button
                        onClick={() =>
                          handleFiltersChange({
                            ...filters,
                            due_after: undefined,
                            due_before: undefined,
                          })
                        }
                        className="ml-1 text-indigo-600 hover:text-indigo-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}

                  {(filters.progress_min !== undefined ||
                    filters.progress_max !== undefined) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-teal-100 text-teal-800">
                      Progress: {filters.progress_min ?? 0}%-
                      {filters.progress_max ?? 100}%
                      <button
                        onClick={() =>
                          handleFiltersChange({
                            ...filters,
                            progress_min: undefined,
                            progress_max: undefined,
                          })
                        }
                        className="ml-1 text-teal-600 hover:text-teal-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}

                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project List */}
        {projects.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No projects found
                </h3>
                <p className="text-gray-500 mb-6">
                  {filters.search
                    ? "No projects match your search criteria."
                    : "Get started by creating your first project."}
                </p>
                <Link to="/projects/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : /* Projects Display */
        viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                      >
                        {project.title}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  {/* Status and Priority */}
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        PROJECT_STATUS_COLORS[project.status]
                      }`}
                    >
                      {PROJECT_STATUS_LABELS[project.status]}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        PROJECT_PRIORITY_COLORS[project.priority]
                      }`}
                    >
                      {project.priority.charAt(0).toUpperCase() +
                        project.priority.slice(1)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{project.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    {project.client_name && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>{project.client_name}</span>
                      </div>
                    )}

                    {project.due_date && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span
                          className={
                            project.is_overdue ? "text-red-600 font-medium" : ""
                          }
                        >
                          Due: {formatDate(project.due_date)}
                          {project.is_overdue && " (Overdue)"}
                        </span>
                      </div>
                    )}

                    {project.budget && (
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>{formatCurrency(project.budget)}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map((tag: any) => (
                        <span
                          key={tag.id}
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: tag.color + "20",
                            color: tag.color,
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          +{project.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                    <span>Created {formatDate(project.created_at)}</span>
                    {project.assigned_to && (
                      <span>
                        Assigned to {project.assigned_to.first_name}{" "}
                        {project.assigned_to.last_name}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Table View */
          <Table
            data={sortedProjects}
            columns={tableColumns}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        )}
      </div>
    </div>
  );
};
