import { api } from '../lib/api';
import type {
  Project,
  ProjectListItem,
  ProjectCreateData,
  ProjectFilters,
  ProjectStats,
  ProjectTag,
  User,
  ProjectNote,
} from '../types/project';

export interface ProjectsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProjectListItem[];
}

class ProjectsApi {
  // Project CRUD operations
  async getProjects(filters?: ProjectFilters): Promise<ProjectsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to.toString());
    if (filters?.is_overdue) params.append('is_overdue', 'true');
    if (filters?.search) params.append('search', filters.search);
    
    const response = await api.get(`/api/projects/?${params.toString()}`);
    return response.data;
  }

  async getProject(id: string): Promise<Project> {
    const response = await api.get(`/api/projects/${id}/`);
    return response.data;
  }

  async createProject(data: ProjectCreateData): Promise<Project> {
    const response = await api.post('/api/projects/', data);
    return response.data;
  }

  async updateProject(id: string, data: Partial<ProjectCreateData>): Promise<Project> {
    const response = await api.patch(`/api/projects/${id}/`, data);
    return response.data;
  }

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/api/projects/${id}/`);
  }

  // Project status and operations
  async updateProjectStatus(id: string, status: string): Promise<Project> {
    const response = await api.patch(`/api/projects/${id}/update_status/`, { status });
    return response.data;
  }

  async getMyProjects(): Promise<ProjectListItem[]> {
    const response = await api.get('/api/projects/my_projects/');
    return response.data;
  }

  async getProjectStats(): Promise<ProjectStats> {
    const response = await api.get('/api/projects/stats/');
    return response.data;
  }

  // Project notes
  async addProjectNote(projectId: string, content: string, isInternal: boolean = true): Promise<ProjectNote> {
    const response = await api.post(`/api/projects/${projectId}/add_note/`, {
      content,
      is_internal: isInternal,
    });
    return response.data;
  }

  // Project tags
  async getTags(): Promise<ProjectTag[]> {
    const response = await api.get('/api/project-tags/');
    return response.data.results || response.data;
  }

  async createTag(name: string, color: string = '#3B82F6'): Promise<ProjectTag> {
    const response = await api.post('/api/project-tags/', { name, color });
    return response.data;
  }

  async updateTag(id: number, data: Partial<ProjectTag>): Promise<ProjectTag> {
    const response = await api.patch(`/api/project-tags/${id}/`, data);
    return response.data;
  }

  async deleteTag(id: number): Promise<void> {
    await api.delete(`/api/project-tags/${id}/`);
  }

  // Users (for assignment)
  async getUsers(): Promise<User[]> {
    const response = await api.get('/api/users/');
    return response.data.results || response.data;
  }
}

export default new ProjectsApi();
