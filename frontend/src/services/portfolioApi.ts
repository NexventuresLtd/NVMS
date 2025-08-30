import { api } from '../lib/api';
import type {
  Portfolio,
  PortfolioListItem,
  PortfolioCreateUpdate,
  PortfolioStats,
  TechnologyTag,
  ProjectTestimonial,
  PortfolioFilters,
  ApiResponse
} from '../types/portfolio';

const PORTFOLIO_BASE_URL = '/api/portfolio';

export const portfolioApi = {
  // Portfolio projects
  getProjects: async (filters: PortfolioFilters = {}): Promise<ApiResponse<PortfolioListItem>> => {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
    if (filters.technology) params.append('technology', filters.technology);
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get(`${PORTFOLIO_BASE_URL}/projects/?${params.toString()}`);
    return response.data;
  },

  getProject: async (slug: string): Promise<Portfolio> => {
    const response = await api.get(`${PORTFOLIO_BASE_URL}/projects/${slug}/`);
    return response.data;
  },

  createProject: async (data: PortfolioCreateUpdate): Promise<Portfolio> => {
    const formData = new FormData();
    
    // Handle file upload
    if (data.featured_image instanceof File) {
      formData.append('featured_image', data.featured_image);
    }
    
    // Append other fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'featured_image' && value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    const response = await api.post(`${PORTFOLIO_BASE_URL}/projects/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProject: async (slug: string, data: Partial<PortfolioCreateUpdate>): Promise<Portfolio> => {
    const formData = new FormData();
    
    // Handle file upload
    if (data.featured_image instanceof File) {
      formData.append('featured_image', data.featured_image);
    }
    
    // Append other fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'featured_image' && value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    const response = await api.patch(`${PORTFOLIO_BASE_URL}/projects/${slug}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProject: async (slug: string): Promise<void> => {
    await api.delete(`${PORTFOLIO_BASE_URL}/projects/${slug}/`);
  },

  getFeaturedProjects: async (): Promise<PortfolioListItem[]> => {
    const response = await api.get(`${PORTFOLIO_BASE_URL}/projects/featured/`);
    return response.data;
  },

  getProjectStats: async (): Promise<PortfolioStats> => {
    const response = await api.get(`${PORTFOLIO_BASE_URL}/projects/stats/`);
    return response.data;
  },

  getProjectsByTechnology: async (tech?: string): Promise<PortfolioListItem[] | TechnologyTag[]> => {
    const params = tech ? `?tech=${encodeURIComponent(tech)}` : '';
    const response = await api.get(`${PORTFOLIO_BASE_URL}/projects/by_technology/${params}`);
    return response.data;
  },

  // Technology tags
  getTechnologies: async (): Promise<TechnologyTag[]> => {
    const response = await api.get(`${PORTFOLIO_BASE_URL}/technologies/`);
    return response.data.results || response.data;
  },

  createTechnology: async (data: Omit<TechnologyTag, 'id'>): Promise<TechnologyTag> => {
    const response = await api.post(`${PORTFOLIO_BASE_URL}/technologies/`, data);
    return response.data;
  },

  updateTechnology: async (id: number, data: Partial<Omit<TechnologyTag, 'id'>>): Promise<TechnologyTag> => {
    const response = await api.patch(`${PORTFOLIO_BASE_URL}/technologies/${id}/`, data);
    return response.data;
  },

  deleteTechnology: async (id: number): Promise<void> => {
    await api.delete(`${PORTFOLIO_BASE_URL}/technologies/${id}/`);
  },

  getPopularTechnologies: async (): Promise<TechnologyTag[]> => {
    const response = await api.get(`${PORTFOLIO_BASE_URL}/technologies/popular/`);
    return response.data;
  },

  // Testimonials
  getTestimonials: async (projectSlug?: string): Promise<ProjectTestimonial[]> => {
    const params = projectSlug ? `?project=${projectSlug}` : '';
    const response = await api.get(`${PORTFOLIO_BASE_URL}/testimonials/${params}`);
    return response.data.results || response.data;
  },

  createTestimonial: async (data: Omit<ProjectTestimonial, 'id'>): Promise<ProjectTestimonial> => {
    const response = await api.post(`${PORTFOLIO_BASE_URL}/testimonials/`, data);
    return response.data;
  },

  updateTestimonial: async (id: number, data: Partial<Omit<ProjectTestimonial, 'id'>>): Promise<ProjectTestimonial> => {
    const response = await api.patch(`${PORTFOLIO_BASE_URL}/testimonials/${id}/`, data);
    return response.data;
  },

  deleteTestimonial: async (id: number): Promise<void> => {
    await api.delete(`${PORTFOLIO_BASE_URL}/testimonials/${id}/`);
  },

  getFeaturedTestimonials: async (): Promise<ProjectTestimonial[]> => {
    const response = await api.get(`${PORTFOLIO_BASE_URL}/testimonials/featured/`);
    return response.data;
  },
};

export default portfolioApi;
