import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import {
  DollarSign,
  Clock,
  ExternalLink,
  Github,
  AlertTriangle,
} from "lucide-react";
import { ProgressSlider } from "./ProgressSlider";
import type { Project } from "../../types/project";

interface ProjectOverviewProps {
  project: Project;
  onProjectUpdate?: (project: Project) => void;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  project,
  onProjectUpdate,
}) => {
  const formatCurrency = (amount?: number) => {
    if (!amount) return "Not set";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleProgressUpdate = (newProgress: number) => {
    if (onProjectUpdate) {
      const updatedProject = {
        ...project,
        manual_progress: newProgress,
        progress_percentage: newProgress,
      };
      onProjectUpdate(updatedProject);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Slider */}
      <ProgressSlider
        projectId={project.id}
        currentProgress={project.progress_percentage}
        manualProgress={project.manual_progress}
        canEdit={project.can_edit_progress}
        onProgressUpdate={handleProgressUpdate}
      />

      {/* Project URLs */}
      {(project.repository_url || project.live_url || project.staging_url) && (
        <Card>
          <CardHeader>
            <CardTitle>Project Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.repository_url && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  <span className="text-sm font-medium">Repository</span>
                </div>
                <Link
                  to={project.repository_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  View Code
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
            {project.live_url && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <span className="text-sm font-medium">Live Site</span>
                </div>
                <Link
                  to={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  Visit Site
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
            {project.staging_url && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <span className="text-sm font-medium">Staging</span>
                </div>
                <Link
                  to={project.staging_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  View Staging
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Client Information */}
      {(project.client_name || project.client_email) && (
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.client_name && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Name</span>
                <span className="text-sm text-gray-900">
                  {project.client_name}
                </span>
              </div>
            )}
            {project.client_email && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Email</span>
                <a
                  href={`mailto:${project.client_email}`}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {project.client_email}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Project Stats */}
      {(project.budget || project.estimated_hours) && (
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.budget && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm font-medium text-gray-700">
                    Budget
                  </span>
                </div>
                <span className="text-sm text-gray-900">
                  {formatCurrency(project.budget)}
                </span>
              </div>
            )}
            {project.estimated_hours && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium text-gray-700">
                    Estimated Hours
                  </span>
                </div>
                <span className="text-sm text-gray-900">
                  {project.estimated_hours}h
                </span>
              </div>
            )}
            {project.actual_hours > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium text-gray-700">
                    Actual Hours
                  </span>
                </div>
                <span className="text-sm text-gray-900">
                  {project.actual_hours}h
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Overdue Warning */}
      {project.is_overdue && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                This project is overdue
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
