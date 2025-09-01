import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  Users,
  UserPlus,
  UserMinus,
  Crown,
  Code,
  Palette,
  Bug,
  Briefcase,
  Phone,
} from "lucide-react";
import projectsApi from "../../services/projectsApi";
import type {
  ProjectAssignment,
  ProjectAssignmentCreate,
  AssignmentRole,
  User,
} from "../../types/project";
import {
  ASSIGNMENT_ROLE_LABELS,
  ASSIGNMENT_ROLE_COLORS,
} from "../../types/project";

interface ProjectAssignmentsProps {
  projectId: string;
  assignments: ProjectAssignment[];
  users: User[];
  onAssignmentsChange: (assignments: ProjectAssignment[]) => void;
}

export const ProjectAssignments: React.FC<ProjectAssignmentsProps> = ({
  projectId,
  assignments,
  users,
  onAssignmentsChange,
}) => {
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentData, setAssignmentData] = useState<ProjectAssignmentCreate>({
    user_id: 0,
    role: "developer",
    notes: "",
  });

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentData.user_id) return;

    setIsAssigning(true);
    try {
      const newAssignment = await projectsApi.assignUser(projectId, assignmentData);
      onAssignmentsChange([...assignments, newAssignment]);
      
      // Reset form
      setAssignmentData({
        user_id: 0,
        role: "developer",
        notes: "",
      });
      setShowAssignForm(false);
    } catch (error) {
      console.error("Failed to assign user:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemove = async (assignmentId: number) => {
    if (!confirm("Are you sure you want to remove this assignment?")) return;

    try {
      await projectsApi.removeAssignment(projectId, assignmentId);
      onAssignmentsChange(assignments.filter(assignment => assignment.id !== assignmentId));
    } catch (error) {
      console.error("Failed to remove assignment:", error);
    }
  };

  const getRoleIcon = (role: AssignmentRole) => {
    switch (role) {
      case 'supervisor':
        return <Crown className="h-4 w-4" />;
      case 'developer':
        return <Code className="h-4 w-4" />;
      case 'designer':
        return <Palette className="h-4 w-4" />;
      case 'tester':
        return <Bug className="h-4 w-4" />;
      case 'project_manager':
        return <Briefcase className="h-4 w-4" />;
      case 'client_contact':
        return <Phone className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getAvailableUsers = () => {
    const assignedUserIds = assignments.map(assignment => assignment.user.id);
    return users.filter(user => !assignedUserIds.includes(user.id));
  };

  const groupedAssignments = assignments.reduce((acc, assignment) => {
    if (!acc[assignment.role]) {
      acc[assignment.role] = [];
    }
    acc[assignment.role].push(assignment);
    return acc;
  }, {} as Record<string, ProjectAssignment[]>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Team Assignments ({assignments.length})
          </CardTitle>
          {getAvailableUsers().length > 0 && (
            <Button
              onClick={() => setShowAssignForm(!showAssignForm)}
              size="sm"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign User
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showAssignForm && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium mb-4">Assign Team Member</h4>
            <form onSubmit={handleAssign} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User *
                  </label>
                  <select
                    value={assignmentData.user_id}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, user_id: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value={0}>Select a user</option>
                    {getAvailableUsers().map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.username})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={assignmentData.role}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, role: e.target.value as AssignmentRole }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    {Object.entries(ASSIGNMENT_ROLE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={assignmentData.notes}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about this assignment"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={isAssigning || !assignmentData.user_id}>
                  {isAssigning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign User
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAssignForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {assignments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No team members assigned yet</p>
            <p className="text-sm">Assign developers, designers, testers, and supervisors to the project</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedAssignments).map(([role, roleAssignments]) => (
              <div key={role}>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  {getRoleIcon(role as AssignmentRole)}
                  <span className="ml-2">{ASSIGNMENT_ROLE_LABELS[role as AssignmentRole]}</span>
                  <span className="ml-2 text-sm text-gray-500">({roleAssignments.length})</span>
                </h4>
                <div className="space-y-2 ml-6">
                  {roleAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h5 className="font-medium text-gray-900">
                              {assignment.user.first_name} {assignment.user.last_name}
                            </h5>
                            <span className="text-sm text-gray-500">
                              ({assignment.user.username})
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${ASSIGNMENT_ROLE_COLORS[assignment.role]}`}>
                              {ASSIGNMENT_ROLE_LABELS[assignment.role]}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span>
                              Assigned by {assignment.assigned_by.first_name} {assignment.assigned_by.last_name}
                            </span>
                            <span>
                              on {new Date(assignment.assigned_date).toLocaleDateString()}
                            </span>
                          </div>
                          {assignment.notes && (
                            <p className="text-sm text-gray-600 mt-1">
                              {assignment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemove(assignment.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {getAvailableUsers().length === 0 && assignments.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              All available users have been assigned to this project.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
