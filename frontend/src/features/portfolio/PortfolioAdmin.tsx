import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  FolderPlus,
} from "lucide-react";
import portfolioApi from "../../services/portfolioApi";
import type {
  PortfolioListItem,
  PortfolioFilters,
} from "../../types/portfolio";

export const PortfolioAdmin: React.FC = () => {
  const [projects, setProjects] = useState<PortfolioListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<PortfolioFilters>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadProjects();
  }, [filters]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const response = await portfolioApi.getProjects(filters);
      setProjects(response.results || []);
    } catch (err) {
      setError("Failed to load projects");
      console.error("Error loading projects:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchQuery }));
  };

  const handleDeleteProject = async (slug: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await portfolioApi.deleteProject(slug);
        await loadProjects();
      } catch (err) {
        setError("Failed to delete project");
      }
    }
  };

  const handleToggleFeatured = async (project: PortfolioListItem) => {
    try {
      await portfolioApi.updateProject(project.slug, {
        is_featured: !project.is_featured,
      });
      await loadProjects();
    } catch (err) {
      setError("Failed to update project");
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Portfolio Administration
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your portfolio projects and showcase your work.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Project
              </Button>
              <Link to="/projects?filter=completed">
                <Button variant="outline" className="flex items-center gap-2">
                  <FolderPlus className="h-4 w-4" />
                  From Completed Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  startIcon={<Search className="h-4 w-4 text-gray-400" />}
                />
              </div>
              <Button type="submit" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Projects Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No projects yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Get started by creating your first portfolio project.
                </p>
                <Button variant="primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} hover>
                <CardContent>
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    {project.featured_image ? (
                      <img
                        src={project.featured_image}
                        alt={project.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {project.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {project.short_description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${
                          project.status === "published"
                            ? "bg-green-100 text-green-800"
                            : project.status === "draft"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      `}
                      >
                        {project.status}
                      </span>
                      {project.is_featured && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(`/portfolio/${project.slug}`, "_blank")
                          }
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProject(project.slug)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant={project.is_featured ? "primary" : "ghost"}
                        onClick={() => handleToggleFeatured(project)}
                      >
                        {project.is_featured ? "Unfeature" : "Feature"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
