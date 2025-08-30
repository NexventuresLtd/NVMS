import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ArrowLeft, Save } from "lucide-react";
import projectsApi from "../../services/projectsApi";
import type {
  Project,
  ProjectCreateData,
  ProjectTag,
  User,
} from "../../types/project";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_PRIORITY_LABELS,
} from "../../types/project";

export const ProjectEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [tags, setTags] = useState<ProjectTag[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);

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
    if (id) {
      loadProject();
      loadDropdownData();
    }
  }, [id]);

  const loadProject = async () => {
    if (!id) return;

    try {
      setIsLoadingProject(true);
      const projectData = await projectsApi.getProject(id);
      setProject(projectData);

      // Populate form with project data
      setFormData({
        title: projectData.title,
        description: projectData.description,
        status: projectData.status,
        priority: projectData.priority,
        start_date: projectData.start_date || "",
        due_date: projectData.due_date || "",
        client_name: projectData.client_name || "",
        client_email: projectData.client_email || "",
        budget: projectData.budget,
        estimated_hours: projectData.estimated_hours,
        repository_url: projectData.repository_url || "",
        live_url: projectData.live_url || "",
        staging_url: projectData.staging_url || "",
        assigned_to_id: projectData.assigned_to?.id,
        tag_ids: projectData.tags.map((tag) => tag.id),
      });
    } catch (err) {
      console.error("Failed to load project:", err);
      setError("Failed to load project");
    } finally {
      setIsLoadingProject(false);
    }
  };

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
    if (!id) return;

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

      await projectsApi.updateProject(id, cleanData);
      navigate(`/projects/${id}`);
    } catch (err: any) {
      console.error("Failed to update project:", err);
      setError(err.response?.data?.message || "Failed to update project");
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

  const handleTagToggle = (tagId: number) => {
    setFormData((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids?.includes(tagId)
        ? prev.tag_ids.filter((id) => id !== tagId)
        : [...(prev.tag_ids || []), tagId],
    }));
  };

  if (isLoadingProject) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Project not found
            </h3>
            <p className="text-gray-500 mb-6">
              The project you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate("/projects")}>
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/projects/${id}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Project
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
          <p className="mt-2 text-gray-600">
            Update project details and settings.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your project"
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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

          {/* Dates and Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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

          {/* Budget and Time */}
          <Card>
            <CardHeader>
              <CardTitle>Budget & Time Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget ($)
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Hours
                  </label>
                  <Input
                    type="number"
                    name="estimated_hours"
                    value={formData.estimated_hours || ""}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Links */}
          <Card>
            <CardHeader>
              <CardTitle>Project Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repository URL
                </label>
                <Input
                  type="url"
                  name="repository_url"
                  value={formData.repository_url}
                  onChange={handleChange}
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Live URL
                  </label>
                  <Input
                    type="url"
                    name="live_url"
                    value={formData.live_url}
                    onChange={handleChange}
                    placeholder="https://your-project.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Staging URL
                  </label>
                  <Input
                    type="url"
                    name="staging_url"
                    value={formData.staging_url}
                    onChange={handleChange}
                    placeholder="https://staging.your-project.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned To
                </label>
                <select
                  name="assigned_to_id"
                  value={formData.assigned_to_id || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.tag_ids?.includes(tag.id) || false}
                      onChange={() => handleTagToggle(tag.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{tag.name}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/projects/${id}`)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
