// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3344/v1';

// Custom events for session management
export const SESSION_EXPIRED_EVENT = 'session-expired';
export const SESSION_REVOKED_EVENT = 'session-revoked';

export const dispatchSessionExpired = (message: string) => {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { message } }));
};

export const dispatchSessionRevoked = (message: string) => {
  window.dispatchEvent(new CustomEvent(SESSION_REVOKED_EVENT, { detail: { message } }));
};

// API Client with authentication
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(isHeartbeat = false): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...(isHeartbeat ? { 'X-Heartbeat': 'true' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    // Handle manual redirects (302, 301, etc.) - treat as unauthorized
    if (response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400)) {
      const message = 'Your session has expired';
      
      // Clear token and user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Dispatch session expired event
      dispatchSessionExpired(message);
      
      // Delay redirect slightly to allow toast to show
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      
      throw new Error(message);
    }

    if (!response.ok) {
      if (response.status === 401) {
        // Get the error message and code from backend
        const errorData = await response.json().catch(() => ({ message: 'Your session has expired' }));
        const message = errorData.message || 'Your session has expired';
        const code = errorData.code;
        
        // Clear token and user data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Check if this is a session revoked error (logged in elsewhere)
        if (code === 'SESSION_REVOKED') {
          // Dispatch session revoked event for special handling
          dispatchSessionRevoked(message);
          
          // Redirect to session revoked page
          window.location.href = '/session-revoked';
          
          // Return a rejected promise with a specific error to prevent further execution
          // The redirect will happen before this promise resolves
          return Promise.reject(new Error('SESSION_REVOKED'));
        } else {
          // Regular session expiry - redirect to dedicated session expired page
          dispatchSessionExpired(message);
          
          // Redirect to session expired page
          window.location.href = '/session-expired';
          
          // Return a rejected promise with a specific error to prevent further execution
          // The redirect will happen before this promise resolves
          return Promise.reject(new Error('SESSION_EXPIRED'));
        }
      }

      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'An error occurred');
    }

    return response.json();
  }

  async get<T>(endpoint: string, options?: { isHeartbeat?: boolean }): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(options?.isHeartbeat),
      redirect: 'manual', // Don't follow redirects automatically
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      redirect: 'manual', // Don't follow redirects automatically
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      redirect: 'manual', // Don't follow redirects automatically
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      redirect: 'manual', // Don't follow redirects automatically
    });
    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
