import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
}

interface TokenRefreshResponse {
  access: string;
  refresh?: string;
}

class AuthApi {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage on initialization
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    
    // Set up axios interceptors
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth header
    axios.interceptors.request.use(
      (config) => {
        if (this.accessToken && config.url?.startsWith(API_BASE_URL)) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          this.refreshToken &&
          originalRequest.url?.startsWith(API_BASE_URL)
        ) {
          originalRequest._retry = true;

          try {
            const response = await this.refreshAccessToken();
            this.setTokens(response.access, response.refresh || this.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${response.access}`;
            return axios(originalRequest);
          } catch (refreshError) {
            this.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/login/`,
        credentials
      );
      
      const { access, refresh } = response.data;
      this.setTokens(access, refresh);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async refreshAccessToken(): Promise<TokenRefreshResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post<TokenRefreshResponse>(
      `${API_BASE_URL}/auth/refresh/`,
      { refresh: this.refreshToken }
    );

    return response.data;
  }

  async verifyToken(token?: string): Promise<boolean> {
    try {
      const tokenToVerify = token || this.accessToken;
      if (!tokenToVerify) return false;

      await axios.post(`${API_BASE_URL}/auth/verify/`, {
        token: tokenToVerify,
      });
      
      return true;
    } catch {
      return false;
    }
  }

  private setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }
}

// Export a singleton instance
const authApi = new AuthApi();
export default authApi;
