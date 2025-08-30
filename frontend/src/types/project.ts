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
  created_by: User;
  budget?: number;
  estimated_hours?: number;
  actual_hours: number;
  repository_url?: string;
  live_url?: string;
  staging_url?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  progress_percentage: number;
  is_overdue: boolean;
  tags: ProjectTag[];
  notes: ProjectNote[];
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
  created_by: User;
  budget?: number;
  estimated_hours?: number;
  actual_hours: number;
  created_at: string;
  updated_at: string;
  progress_percentage: number;
  is_overdue: boolean;
  tags: ProjectTag[];
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
  tag_ids?: number[];
}

export interface ProjectFilters {
  status?: ProjectStatus;
  priority?: ProjectPriority;
  assigned_to?: number;
  is_overdue?: boolean;
  search?: string;
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
