/**
 * API Service for Authentication
 * @fileoverview HTTP client for authentication endpoints
 */

interface ClientUser {
  id: number;
  username: string;
  email?: string | null;
  avatarUrl?: string | null;
}

const API_BASE_URL = `/api/v1`;

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fetch current authenticated user
   */
  async fetchMe(): Promise<ClientUser> {
    const response = await this.request<{ success: boolean; data: ClientUser }>('/auth/me');
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await this.request('/auth/logout', {
      method: 'POST',
    });
  }

  /**
   * Get GitHub OAuth URL (for redirect)
   */
  getGitHubAuthUrl(): string {
    return `${API_BASE_URL}/auth/github`;
  }
}

export const apiService = new ApiService();