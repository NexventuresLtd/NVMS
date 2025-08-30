import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Search, Filter, ExternalLink } from "lucide-react";
import portfolioApi from "../../services/portfolioApi";
import type {
  PortfolioListItem,
  PortfolioFilters,
} from "../../types/portfolio";

export const PortfolioList: React.FC = () => {
  const [projects, setProjects] = useState<PortfolioListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<PortfolioFilters>({
    status: "published",
  });
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

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Portfolio
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our collection of successful projects and innovative
            solutions we've delivered for clients across various industries.
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search projects by name, technology, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  startIcon={<Search className="h-4 w-4 text-gray-400" />}
                />
              </div>
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
            <p className="mt-4 text-gray-500">Loading portfolio...</p>
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No projects found
                </h3>
                <p className="text-gray-500">
                  {searchQuery
                    ? "Try adjusting your search terms."
                    : "Portfolio coming soon!"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Card key={project.id} hover className="group overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  {project.featured_image ? (
                    <img
                      src={project.featured_image}
                      alt={project.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <span className="text-primary-600 font-medium">
                        {project.title}
                      </span>
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {project.title}
                        </h3>
                        {project.is_featured && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 line-clamp-3">
                        {project.short_description}
                      </p>
                    </div>

                    {project.client_name && (
                      <div>
                        <span className="text-sm text-gray-500">Client: </span>
                        <span className="text-sm font-medium text-gray-700">
                          {project.client_name}
                        </span>
                      </div>
                    )}

                    {/* Technologies */}
                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.slice(0, 3).map((tech) => (
                            <span
                              key={tech.id}
                              className="px-2 py-1 text-xs font-medium rounded-full"
                              style={{
                                backgroundColor: `${tech.color}15`,
                                color: tech.color,
                              }}
                            >
                              {tech.name}
                            </span>
                          ))}
                          {project.technologies.length > 3 && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                              +{project.technologies.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-sm text-gray-500">
                        {project.duration_display}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button className="text-primary-600 hover:text-primary-700 transition-colors">
                          <span className="sr-only">View project</span>
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Button (if pagination is implemented) */}
        {projects.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-500">Showing {projects.length} projects</p>
          </div>
        )}
      </div>
    </div>
  );
};
