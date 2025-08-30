import React from "react";
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
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const quickActions = [
    {
      title: "Add Project",
      description: "Create a new portfolio project",
      icon: Plus,
      href: "/admin/portfolio?action=create",
      color: "bg-blue-500",
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
      value: "0",
      icon: FolderOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Team Members",
      value: "1",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Wallet Balance",
      value: "$0.00",
      icon: Wallet,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Active Tasks",
      value: "0",
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
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
