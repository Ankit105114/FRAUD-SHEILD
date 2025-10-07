import { create } from 'zustand';

interface Transaction {
  transactionId: string;
  userId: string;
  amount: number;
  merchant: string;
  location: string;
  ipAddress: string;
  channel?: string;
}

interface User {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: any;
    token: string;
    dashboard?: any;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Try to parse error response for validation errors
        let errorMessage = `HTTP error! status: ${response.status}`;
        console.error('API Response not OK:', {
          status: response.status,
          statusText: response.statusText,
          url: url,
          headers: Object.fromEntries(response.headers.entries())
        });

        try {
          const errorData = await response.json();
          console.error('Error response data:', errorData);

          if (errorData.errors && Array.isArray(errorData.errors)) {
            // Handle validation errors
            const validationErrors = errorData.errors.map((err: any) =>
              `${err.field}: ${err.message}`
            ).join(', ');
            errorMessage = `Validation failed: ${validationErrors}`;
            console.error('Validation errors parsed:', validationErrors);
          } else if (errorData.message) {
            errorMessage = errorData.message;
            console.error('Error message from server:', errorData.message);
          } else {
            console.error('Unknown error response format:', errorData);
          }
        } catch (parseError) {
          console.error('Failed to parse error response as JSON:', parseError);
          // If we can't parse the error response, use the default message
        }

        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('API response successful:', responseData);
      return responseData;
    } catch (error) {
      console.error('API request failed:', error);

      // Provide more specific error information
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
          throw new Error('Network error. Please check your connection and server status.');
        }
        throw error;
      }

      throw new Error('An unexpected error occurred. Please try again.');
    }
  }

  // Authentication endpoints
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: User): Promise<AuthResponse> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Transaction endpoints
  async submitTransaction(transaction: Transaction, token: string): Promise<any> {
    return this.request('/api/transactions/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(transaction),
    });
  }

  async getTransactions(token: string): Promise<any> {
    return this.request('/api/transactions', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Analytics endpoints
  async getDashboard(token: string): Promise<any> {
    return this.request('/api/auth/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

export const apiService = new ApiService();
