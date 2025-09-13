// Project related types
export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date?: string;
  due_date?: string;
  completed_date?: string;
  client_name?: string;
  client_email?: string;
  assigned_to?: User;
  supervisor?: User;
  created_by: User;
  budget?: number;
  estimated_hours?: number;
  actual_hours: number;
  manual_progress?: number;
  repository_url?: string;
  live_url?: string;
  staging_url?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  progress_percentage: number;
  is_overdue: boolean;
  can_edit_progress: boolean;
  tags: ProjectTag[];
  notes: ProjectNote[];
  documents: ProjectDocument[];
  assignments: ProjectAssignment[];
  document_count: number;
  team_members: User[];
}

export interface ProjectListItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date?: string;
  due_date?: string;
  client_name?: string;
  assigned_to?: User;
  supervisor?: User;
  created_by: User;
  budget?: number;
  estimated_hours?: number;
  actual_hours: number;
  created_at: string;
  updated_at: string;
  progress_percentage: number;
  is_overdue: boolean;
  tags: ProjectTag[];
  document_count: number;
  team_member_count: number;
}

export interface ProjectCreateData {
  title: string;
  description: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  start_date?: string;
  due_date?: string;
  client_name?: string;
  client_email?: string;
  budget?: number;
  estimated_hours?: number;
  repository_url?: string;
  live_url?: string;
  staging_url?: string;
  assigned_to_id?: number;
  supervisor_id?: number;
  tag_ids?: number[];
}

export interface ProjectFilters {
  status?: ProjectStatus;
  priority?: ProjectPriority;
  assigned_to?: number | string;
  is_overdue?: boolean;
  search?: string;
  client_name?: string;
  due_after?: string;
  due_before?: string;
  progress_min?: number;
  progress_max?: number;
}

export interface ProjectStats {
  total: number;
  by_status: Record<ProjectStatus, number>;
  by_priority: Record<ProjectPriority, number>;
  overdue: number;
  completed_this_month: number;
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface ProjectTag {
  id: number;
  name: string;
  color: string;
}

export interface ProjectNote {
  id: number;
  content: string;
  is_internal: boolean;
  author: User;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 
  | 'planning' 
  | 'in_progress' 
  | 'testing' 
  | 'completed' 
  | 'on_hold' 
  | 'cancelled';

export type ProjectPriority = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'urgent';

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planning',
  in_progress: 'In Progress',
  testing: 'Testing',
  completed: 'Completed',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
};

export const PROJECT_PRIORITY_LABELS: Record<ProjectPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  planning: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  testing: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  on_hold: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const PROJECT_PRIORITY_COLORS: Record<ProjectPriority, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

// Document types
export type DocumentType = 
  | 'contract' 
  | 'srs' 
  | 'plan' 
  | 'design' 
  | 'proposal' 
  | 'invoice' 
  | 'other';

export interface ProjectDocument {
  id: number;
  title: string;
  document_type: DocumentType;
  file: string;
  description: string;
  version: string;
  uploaded_by: User;
  is_confidential: boolean;
  created_at: string;
  updated_at: string;
  file_size_mb: number;
  file_extension: string;
}

// Assignment types
export type AssignmentRole = 
  | 'supervisor' 
  | 'developer' 
  | 'designer' 
  | 'tester' 
  | 'project_manager' 
  | 'client_contact';

export interface ProjectAssignment {
  id: number;
  user: User;
  role: AssignmentRole;
  assigned_by: User;
  assigned_date: string;
  is_active: boolean;
  notes: string;
}

export interface ProjectAssignmentCreate {
  user_id: number;
  role: AssignmentRole;
  notes?: string;
}

export interface ProjectDocumentCreate {
  title: string;
  document_type: DocumentType;
  file: File;
  description?: string;
  version?: string;
  is_confidential?: boolean;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  contract: 'Contract',
  srs: 'Software Requirements Specification',
  plan: 'Project Plan',
  design: 'Design Document',
  proposal: 'Proposal',
  invoice: 'Invoice',
  other: 'Other',
};

export const ASSIGNMENT_ROLE_LABELS: Record<AssignmentRole, string> = {
  supervisor: 'Supervisor',
  developer: 'Developer',
  designer: 'Designer',
  tester: 'Tester',
  project_manager: 'Project Manager',
  client_contact: 'Client Contact',
};

export const ASSIGNMENT_ROLE_COLORS: Record<AssignmentRole, string> = {
  supervisor: 'bg-purple-100 text-purple-800',
  developer: 'bg-blue-100 text-blue-800',
  designer: 'bg-pink-100 text-pink-800',
  tester: 'bg-green-100 text-green-800',
  project_manager: 'bg-indigo-100 text-indigo-800',
  client_contact: 'bg-gray-100 text-gray-800',
};
