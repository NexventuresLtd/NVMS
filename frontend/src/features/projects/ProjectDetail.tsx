import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  ArrowLeft,
  Edit,
  Calendar,
  User,
  DollarSign,
  Clock,
  ExternalLink,
  Github,
  MessageSquare,
  Plus,
  Award,
  CheckCircle,
} from "lucide-react";
import projectsApi from "../../services/projectsApi";
import { ProjectDocuments } from "./ProjectDocuments";
import { ProjectAssignments } from "./ProjectAssignments";
import type { Project, User as UserType } from "../../types/project";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  PROJECT_PRIORITY_COLORS,
} from "../../types/project";

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isCreatingPortfolio, setIsCreatingPortfolio] = useState(false);

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  const loadProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      const [projectData, usersData] = await Promise.all([
        projectsApi.getProject(projectId),
        projectsApi.getUsers(),
      ]);
      setProject(projectData);
      setUsers(usersData);
    } catch (err) {
      console.error("Failed to load project:", err);
      setError("Failed to load project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !newNote.trim()) return;

    try {
      setIsAddingNote(true);
      await projectsApi.addProjectNote(project.id, newNote.trim());
      setNewNote("");
      await loadProject(project.id); // Reload to get updated notes
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDocumentsChange = (documents: any[]) => {
    if (project) {
      setProject({ ...project, documents });
    }
  };

  const handleAssignmentsChange = (assignments: any[]) => {
    if (project) {
      setProject({ ...project, assignments });
    }
  };

  const handleCreatePortfolioEntry = async () => {
    if (!project) return;

    try {
      setIsCreatingPortfolio(true);
      const response = await fetch(
        `/projects/${project.id}/create_portfolio_entry/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        await response.json();
        alert("Portfolio entry created successfully!");
        // Optionally navigate to portfolio admin or the new entry
        navigate(`/admin/portfolio`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to create portfolio entry");
      }
    } catch (err) {
      console.error("Failed to create portfolio entry:", err);
      alert("Failed to create portfolio entry");
    } finally {
      setIsCreatingPortfolio(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Project Not Found
                </h3>
                <p className="text-gray-500 mb-6">
                  {error || "The project you are looking for does not exist."}
                </p>
                <Link to="/projects">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Projects
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link to="/projects">
              <Button variant="ghost" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {project.title}
              </h1>
              <p className="text-gray-600 text-lg">{project.description}</p>

              <div className="flex items-center gap-4 mt-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    PROJECT_STATUS_COLORS[project.status]
                  }`}
                >
                  {PROJECT_STATUS_LABELS[project.status]}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    PROJECT_PRIORITY_COLORS[project.priority]
                  }`}
                >
                  {project.priority.charAt(0).toUpperCase() +
                    project.priority.slice(1)}{" "}
                  Priority
                </span>
                {project.is_overdue && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Overdue
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {project.status === "completed" && (
                <Button
                  onClick={handleCreatePortfolioEntry}
                  disabled={isCreatingPortfolio}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isCreatingPortfolio ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4 mr-2" />
                      Create Portfolio Entry
                    </>
                  )}
                </Button>
              )}
              <Link to={`/projects/${id}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Project Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Overall Progress</span>
                    <span>{project.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress_percentage}%` }}
                    ></div>
                  </div>
                </div>

                {project.estimated_hours && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Estimated Hours:</span>
                      <span className="font-medium ml-2">
                        {project.estimated_hours}h
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Actual Hours:</span>
                      <span className="font-medium ml-2">
                        {project.actual_hours}h
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project URLs */}
            {(project.repository_url ||
              project.live_url ||
              project.staging_url) && (
              <Card>
                <CardHeader>
                  <CardTitle>Project Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.repository_url && (
                    <a
                      href={project.repository_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary-600 hover:text-primary-700"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      Repository
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary-600 hover:text-primary-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Live Site
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                  {project.staging_url && (
                    <a
                      href={project.staging_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary-600 hover:text-primary-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Staging
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Project Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="mb-6">
                  <div className="flex gap-2">
                    <Input
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note..."
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={isAddingNote || !newNote.trim()}
                    >
                      {isAddingNote ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </form>

                {/* Notes List */}
                <div className="space-y-4">
                  {project.notes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-medium text-gray-900">
                            {note.author.first_name} {note.author.last_name}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            {formatDate(note.created_at)}
                          </span>
                        </div>
                        {note.is_internal && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                            Internal
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                  ))}

                  {project.notes.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No notes yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Project Documents */}
            <ProjectDocuments
              projectId={project.id}
              documents={project.documents || []}
              onDocumentsChange={handleDocumentsChange}
            />

            {/* Project Assignments */}
            <ProjectAssignments
              projectId={project.id}
              assignments={project.assignments || []}
              users={users}
              onAssignmentsChange={handleAssignmentsChange}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.client_name && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Client</p>
                      <p className="font-medium">{project.client_name}</p>
                    </div>
                  </div>
                )}

                {project.assigned_to && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Assigned To</p>
                      <p className="font-medium">
                        {project.assigned_to.first_name}{" "}
                        {project.assigned_to.last_name}
                      </p>
                    </div>
                  </div>
                )}

                {project.supervisor && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Supervisor</p>
                      <p className="font-medium">
                        {project.supervisor.first_name}{" "}
                        {project.supervisor.last_name}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <User className="h-4 w-4 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Created By</p>
                    <p className="font-medium">
                      {project.created_by.first_name}{" "}
                      {project.created_by.last_name}
                    </p>
                  </div>
                </div>

                {project.budget && (
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Budget</p>
                      <p className="font-medium">
                        {formatCurrency(project.budget)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.start_date && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium">
                        {formatDate(project.start_date)}
                      </p>
                    </div>
                  </div>
                )}

                {project.due_date && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p
                        className={`font-medium ${
                          project.is_overdue ? "text-red-600" : ""
                        }`}
                      >
                        {formatDate(project.due_date)}
                        {project.is_overdue && " (Overdue)"}
                      </p>
                    </div>
                  </div>
                )}

                {project.completed_date && (
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-3 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Completed</p>
                      <p className="font-medium">
                        {formatDate(project.completed_date)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">
                      {formatDate(project.created_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: tag.color + "20",
                          color: tag.color,
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
