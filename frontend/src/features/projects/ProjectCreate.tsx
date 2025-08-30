import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Save, ArrowLeft } from "lucide-react";
import projectsApi from "../../services/projectsApi";
import type { ProjectCreateData, ProjectTag, User } from "../../types/project";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_PRIORITY_LABELS,
} from "../../types/project";

export const ProjectCreate: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [tags, setTags] = useState<ProjectTag[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [formData, setFormData] = useState<ProjectCreateData>({
    title: "",
    description: "",
    status: "planning",
    priority: "medium",
    start_date: "",
    due_date: "",
    client_name: "",
    client_email: "",
    budget: undefined,
    estimated_hours: undefined,
    repository_url: "",
    live_url: "",
    staging_url: "",
    assigned_to_id: undefined,
    tag_ids: [],
  });

  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    try {
      const [tagsResponse, usersResponse] = await Promise.all([
        projectsApi.getTags(),
        projectsApi.getUsers(),
      ]);
      setTags(tagsResponse);
      setUsers(usersResponse);
    } catch (err) {
      console.error("Failed to load dropdown data:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Clean up the data before sending
      const cleanData = { ...formData };

      // Remove empty strings and convert to null/undefined
      if (!cleanData.start_date) delete cleanData.start_date;
      if (!cleanData.due_date) delete cleanData.due_date;
      if (!cleanData.client_name) delete cleanData.client_name;
      if (!cleanData.client_email) delete cleanData.client_email;
      if (!cleanData.repository_url) delete cleanData.repository_url;
      if (!cleanData.live_url) delete cleanData.live_url;
      if (!cleanData.staging_url) delete cleanData.staging_url;
      if (!cleanData.budget) delete cleanData.budget;
      if (!cleanData.estimated_hours) delete cleanData.estimated_hours;
      if (!cleanData.assigned_to_id) delete cleanData.assigned_to_id;

      const project = await projectsApi.createProject(cleanData);
      navigate(`/projects/${project.id}`);
    } catch (err: any) {
      console.error("Failed to create project:", err);
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" ? (value ? parseFloat(value) : undefined) : value,
    }));
  };

  const handleTagChange = (tagId: number, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      tag_ids: checked
        ? [...(prev.tag_ids || []), tagId]
        : (prev.tag_ids || []).filter((id) => id !== tagId),
    }));
  };

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/projects")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Project
          </h1>
          <p className="text-gray-600 mt-2">
            Fill in the details to create a new project.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title *
                  </label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter project title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the project goals, requirements, and scope"
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {Object.entries(PROJECT_STATUS_LABELS).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {Object.entries(PROJECT_PRIORITY_LABELS).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dates and Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>Dates & Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <Input
                      type="date"
                      name="due_date"
                      value={formData.due_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign To
                  </label>
                  <select
                    name="assigned_to_id"
                    value={formData.assigned_to_id || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.username})
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Name
                    </label>
                    <Input
                      name="client_name"
                      value={formData.client_name}
                      onChange={handleChange}
                      placeholder="Client or company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Email
                    </label>
                    <Input
                      type="email"
                      name="client_email"
                      value={formData.client_email}
                      onChange={handleChange}
                      placeholder="client@example.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Budget
                    </label>
                    <Input
                      type="number"
                      name="budget"
                      value={formData.budget || ""}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Hours
                    </label>
                    <Input
                      type="number"
                      name="estimated_hours"
                      value={formData.estimated_hours || ""}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* URLs */}
            <Card>
              <CardHeader>
                <CardTitle>Project URLs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repository URL
                  </label>
                  <Input
                    type="url"
                    name="repository_url"
                    value={formData.repository_url}
                    onChange={handleChange}
                    placeholder="https://github.com/..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Live URL
                    </label>
                    <Input
                      type="url"
                      name="live_url"
                      value={formData.live_url}
                      onChange={handleChange}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Staging URL
                    </label>
                    <Input
                      type="url"
                      name="staging_url"
                      value={formData.staging_url}
                      onChange={handleChange}
                      placeholder="https://staging.example.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={(formData.tag_ids || []).includes(tag.id)}
                          onChange={(e) =>
                            handleTagChange(tag.id, e.target.checked)
                          }
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span
                          className="px-2 py-1 rounded text-sm font-medium"
                          style={{
                            backgroundColor: tag.color + "20",
                            color: tag.color,
                          }}
                        >
                          {tag.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/projects")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Project
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
