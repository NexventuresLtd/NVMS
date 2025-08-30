import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Link } from "react-router-dom";
import {
  Briefcase,
  FolderOpen,
  MessageSquare,
  Megaphone,
  Wallet,
  Users,
  BarChart3,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import projectsApi from "../../services/projectsApi";
import type { ProjectStats } from "../../types/project";

export const Dashboard: React.FC = () => {
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);

  useEffect(() => {
    loadProjectStats();
  }, []);

  const loadProjectStats = async () => {
    try {
      const stats = await projectsApi.getProjectStats();
      setProjectStats(stats);
    } catch (err) {
      console.error("Failed to load project stats:", err);
    }
  };

  const quickActions = [
    {
      title: "New Project",
      description: "Create a new project",
      icon: Plus,
      href: "/projects/create",
      color: "bg-blue-500",
    },
    {
      title: "Add Portfolio Entry",
      description: "Create a new portfolio entry",
      icon: Briefcase,
      href: "/admin/portfolio?action=create",
      color: "bg-green-500",
    },
    {
      title: "View Portfolio",
      description: "Manage portfolio projects",
      icon: Briefcase,
      href: "/admin/portfolio",
      color: "bg-primary-500",
    },
    {
      title: "Messages",
      description: "Internal team messaging",
      icon: MessageSquare,
      href: "/messages",
      color: "bg-green-500",
    },
    {
      title: "Bulletin Board",
      description: "Company announcements",
      icon: Megaphone,
      href: "/bulletin",
      color: "bg-yellow-500",
    },
  ];

  const stats = [
    {
      title: "Total Projects",
      value: projectStats?.total.toString() || "0",
      icon: FolderOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Completed Projects",
      value: projectStats?.by_status.completed.toString() || "0",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "In Progress",
      value: projectStats?.by_status.in_progress.toString() || "0",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Overdue Projects",
      value: projectStats?.overdue.toString() || "0",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to NVMS Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your projects, team, and company operations from one place.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent>
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} hover className="group">
                <Link to={action.href}>
                  <CardContent>
                    <div className="text-center">
                      <div
                        className={`inline-flex p-3 rounded-lg ${action.color} text-white mb-4`}
                      >
                        <action.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {action.description}
                      </p>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                No projects yet.{" "}
                <Link
                  to="/admin/portfolio"
                  className="text-primary-600 hover:text-primary-500"
                >
                  Create your first project
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                No messages yet. Start communicating with your team.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
