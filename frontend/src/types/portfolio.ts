// Portfolio related types

export interface TechnologyTag {
  id: number;
  name: string;
  color: string;
}

export interface ProjectTestimonial {
  id: number;
  client_name: string;
  client_position: string;
  client_company: string;
  client_image?: string;
  testimonial_text: string;
  rating: number;
  is_featured: boolean;
}

export interface Portfolio {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  project_type: ProjectType;
  client_name?: string;
  project_url?: string;
  repository_url?: string;
  case_study_url?: string;
  featured_image?: string;
  gallery_images: string[];
  technologies: TechnologyTag[];
  tech_stack_frontend?: string;
  tech_stack_backend?: string;
  tech_stack_database?: string;
  tech_stack_deployment?: string;
  start_date: string;
  end_date?: string;
  duration_months?: number;
  duration_display: string;
  team_size: number;
  budget_range?: string;
  status: ProjectStatus;
  is_featured: boolean;
  display_order: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  views_count: number;
  detailed_description?: string;
  challenges_faced?: string;
  key_features: string[];
  lessons_learned?: string;
  testimonials: ProjectTestimonial[];
  is_completed: boolean;
}

export interface PortfolioListItem {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  project_type: ProjectType;
  client_name?: string;
  featured_image?: string;
  technologies: TechnologyTag[];
  start_date: string;
  end_date?: string;
  duration_display: string;
  is_featured: boolean;
  status: ProjectStatus;
  views_count: number;
  tech_stack_frontend?: string;
  tech_stack_backend?: string;
}

export interface PortfolioCreateUpdate {
  title: string;
  slug?: string;
  description: string;
  short_description: string;
  project_type: ProjectType;
  client_name?: string;
  project_url?: string;
  repository_url?: string;
  case_study_url?: string;
  featured_image?: File | string;
  gallery_images: string[];
  technologies: number[];
  tech_stack_frontend?: string;
  tech_stack_backend?: string;
  tech_stack_database?: string;
  tech_stack_deployment?: string;
  start_date: string;
  end_date?: string;
  duration_months?: number;
  team_size: number;
  budget_range?: string;
  status: ProjectStatus;
  is_featured: boolean;
  display_order: number;
  detailed_description?: string;
  challenges_faced?: string;
  key_features: string[];
  lessons_learned?: string;
}

export interface PortfolioStats {
  total_projects: number;
  published_projects: number;
  featured_projects: number;
  total_views: number;
  technologies_used: number;
  avg_project_duration: number;
  latest_project?: PortfolioListItem;
}

// Enums
export type ProjectType = 
  | 'web_app'
  | 'mobile_app'
  | 'desktop_app'
  | 'api'
  | 'landing_page'
  | 'e_commerce'
  | 'dashboard'
  | 'other';

export type ProjectStatus = 'draft' | 'published' | 'archived';

// Filter types
export interface PortfolioFilters {
  status?: ProjectStatus;
  type?: ProjectType;
  featured?: boolean;
  technology?: string;
  search?: string;
}

// API Response types
export interface ApiResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}
