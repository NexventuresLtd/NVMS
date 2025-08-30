import React, { useState, useEffect } from "react";
import { X, CheckCircle, Calendar, User } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import projectsApi from "../../services/projectsApi";
import portfolioApi from "../../services/portfolioApi";
import type { ProjectListItem } from "../../types/project";

interface CompletedProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (project: ProjectListItem) => void;
}

export const CompletedProjectsModal: React.FC<CompletedProjectsModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<ProjectListItem[]>(
    []
  );

  useEffect(() => {
    if (isOpen) {
      loadCompletedProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    // Filter projects based on search query
    if (searchQuery.trim()) {
      const filtered = projects.filter(
        (project) =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          project.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [projects, searchQuery]);

  const loadCompletedProjects = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await projectsApi.getProjects({ status: "completed" });
      setProjects(response.results);
    } catch (err) {
      console.error("Failed to load completed projects:", err);
      setError("Failed to load completed projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProject = async (project: ProjectListItem) => {
    try {
      // Create portfolio project from the selected project
      const portfolioData = {
        title: project.title,
        short_description: project.description.substring(0, 200),
        description: project.description,
        project_type: "web_app" as const,
        status: "draft" as const,
        technologies: [],
        key_features: [],
        repository_url: "",
        is_featured: false,
        gallery_images: [],
        start_date:
          project.start_date || new Date().toISOString().split("T")[0],
        team_size: 1,
        display_order: 0,
      };

      await portfolioApi.createProject(portfolioData);
      onSelect(project);
      onClose();
    } catch (err) {
      console.error("Failed to create portfolio project:", err);
      setError("Failed to create portfolio project from selected project");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Select Completed Project
          </h2>
          <Button variant="ghost" onClick={onClose} className="p-2">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <Input
            placeholder="Search completed projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">
                Loading completed projects...
              </p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? "No projects found" : "No completed projects"}
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Complete some projects first to add them to your portfolio"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((project) => (
                <Card key={project.id} hover className="cursor-pointer">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {project.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {project.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          {project.client_name && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{project.client_name}</span>
                            </div>
                          )}
                          {project.start_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(
                                  project.start_date
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                          <span
                            className={`
                            px-2 py-1 text-xs font-medium rounded-full
                            ${
                              project.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : project.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          `}
                          >
                            {project.priority} priority
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleSelectProject(project)}
                        >
                          Add to Portfolio
                        </Button>
                      </div>

                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {project.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag.id}
                              className="px-2 py-1 text-xs rounded-full text-white"
                              style={{ backgroundColor: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ))}
                          {project.tags.length > 3 && (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                              +{project.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
