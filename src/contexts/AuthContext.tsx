import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../lib/api';
import { extractErrorMessage } from '../lib/errorHandling';
import { isShowcaseMode } from '@/lib/showcaseMode';

interface Organization {
  id: number;
  name: string;
  org_id: string;
  description: string | null;
  is_active: boolean;
  logo_url: string | null;
  created_at?: string | null;
}

interface User {
  id: number;
  email: string;
  full_name: string | null;
  profile_photo_url: string | null;
  is_active: boolean;
  is_verified: boolean;
  role: {
    id: number;
    name: string;
    description: string;
  } | null;
  organization: Organization | null;
  auth_method?: string;
  cognito_user_id?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string, organization_name: string) => Promise<any>;
  confirmRegistration: (email: string, confirmationCode: string) => Promise<any>;
  resendConfirmationCode: (email: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
  isOwner: boolean;
  isManager: boolean;
  isViewer: boolean;
}

interface CognitoLoginResponse {
  success: boolean;
  access_token: string;
  id_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: number;
    email: string;
    full_name: string;
    role: string;
    organization_id: number;
    organization_name: string;
    organization_org_id: string;
    is_verified: boolean;
  };
}


// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

// Create axios instance for authenticated requests
const axiosAuth = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
axiosAuth.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle Cognito token refresh
axiosAuth.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post('/api/auth/refresh', {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken, id_token } = response.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', newRefreshToken);
          if (id_token) {
            localStorage.setItem('id_token', id_token);
          }

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return axiosAuth(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('id_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

const SHOWCASE_USER: User = {
  id: 1,
  email: 'demo.client@example.com',
  full_name: 'Alex Client',
  profile_photo_url: null,
  is_active: true,
  is_verified: true,
  role: { id: 1, name: 'admin', description: 'Demo' },
  organization: {
    id: 1,
    name: 'Demo Company BV',
    org_id: 'demo-org',
    description: null,
    is_active: true,
    logo_url: null,
  },
  auth_method: 'showcase',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() =>
    isShowcaseMode() ? SHOWCASE_USER : null,
  );
  const [loading, setLoading] = useState(() => !isShowcaseMode());
  const [error, setError] = useState<string | null>(null);

  // Fetch current user on mount and maintain authentication state
  useEffect(() => {
    if (isShowcaseMode()) {
      return;
    }

    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (token) {
        try {
          // Try to fetch user with current token
          const response = await axiosAuth.get('/api/users/me');
          setUser(response.data);
          setLoading(false);
          return;
        } catch (error: any) {
          console.log('Initial auth check failed, trying refresh...');

          // If access token failed, try refresh token
          if (refreshToken && error.response?.status === 401) {
            try {
              const refreshResponse = await axios.post('/api/auth/refresh', {
                refresh_token: refreshToken,
              });

              const { access_token, refresh_token: newRefreshToken, id_token } = refreshResponse.data;
              localStorage.setItem('access_token', access_token);
              localStorage.setItem('refresh_token', newRefreshToken);
              if (id_token) {
                localStorage.setItem('id_token', id_token);
              }

              // Try to fetch user again with new token
              const userResponse = await axiosAuth.get('/api/users/me');
              setUser(userResponse.data);
              setLoading(false);
              return;
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }
          }

          // Both access and refresh failed, clear tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('id_token');
          setUser(null);
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Automatic token refresh every 50 minutes (before 60 min expiration)
  useEffect(() => {
    if (isShowcaseMode() || !user) return;

    const REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes in milliseconds

    const refreshInterval = setInterval(async () => {
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          console.log('No refresh token found, skipping auto-refresh');
          return;
        }

        console.log('🔄 Auto-refreshing token (50 min interval)...');

        const response = await axios.post('/api/auth/refresh', {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken, id_token } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', newRefreshToken);
        if (id_token) {
          localStorage.setItem('id_token', id_token);
        }

        console.log('✅ Token refreshed successfully');
      } catch (error: any) {
        console.error('Token refresh error:', error?.response?.data?.detail || error.message);
        // If refresh fails, log the user out
        await logout();
      }
    }, REFRESH_INTERVAL);

    // Cleanup interval on unmount or when user logs out
    return () => {
      clearInterval(refreshInterval);
    };
  }, [user]); // Re-run when user state changes

  // Firebase-like behavior: Refresh token when tab becomes visible again
  useEffect(() => {
    if (isShowcaseMode() || !user) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const refreshToken = localStorage.getItem('refresh_token');
        const accessToken = localStorage.getItem('access_token');

        if (!refreshToken || !accessToken) return;

        try {
          // Decode token to check expiration (without verification)
          const tokenParts = accessToken.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const expirationTime = payload.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();
            const timeUntilExpiry = expirationTime - currentTime;

            // If token is expired OR expires in less than 10 minutes, refresh it
            // This handles both cases: coming back after days (expired) or just before expiration
            if (timeUntilExpiry < 10 * 60 * 1000) {
              console.log('🔄 Tab became visible - refreshing token (expired or expires soon)...');

              const response = await axios.post('/api/auth/refresh', {
                refresh_token: refreshToken,
              });

              const { access_token, refresh_token: newRefreshToken, id_token } = response.data;
              localStorage.setItem('access_token', access_token);
              localStorage.setItem('refresh_token', newRefreshToken);
              if (id_token) {
                localStorage.setItem('id_token', id_token);
              }

              console.log('✅ Token refreshed on tab visibility');
            }
          }
        } catch (error: any) {
          console.error('Token refresh on visibility error:', error?.response?.data?.detail || error.message);
          // Don't logout on visibility refresh failure - let the interval or API call handle it
        }
      }
    };

    // Add event listener for visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Firebase-like behavior: Check and refresh token on window focus
  useEffect(() => {
    if (isShowcaseMode() || !user) return;

    const handleFocus = async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      const accessToken = localStorage.getItem('access_token');

      if (!refreshToken || !accessToken) return;

      try {
        // Decode token to check expiration
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const expirationTime = payload.exp * 1000;
          const currentTime = Date.now();
          const timeUntilExpiry = expirationTime - currentTime;

          // If token is expired OR expires in less than 10 minutes, refresh it
          // This handles both cases: coming back after days (expired) or just before expiration
          if (timeUntilExpiry < 10 * 60 * 1000) {
            console.log('🔄 Window focused - refreshing token (expired or expires soon)...');

            const response = await axios.post('/api/auth/refresh', {
              refresh_token: refreshToken,
            });

            const { access_token, refresh_token: newRefreshToken, id_token } = response.data;
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', newRefreshToken);
            if (id_token) {
              localStorage.setItem('id_token', id_token);
            }

            console.log('✅ Token refreshed on window focus');
          }
        }
      } catch (error: any) {
        console.error('Token refresh on focus error:', error?.response?.data?.detail || error.message);
      }
    };

    // Add event listener for window focus
    window.addEventListener('focus', handleFocus);

    // Cleanup
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  const login = async (email: string, password: string) => {
    if (isShowcaseMode()) {
      setUser(SHOWCASE_USER);
      return;
    }
    try {
      setError(null);
      // In local development, allow a bypass login that issues legacy JWTs from the backend
      // so the rest of the API works without Cognito configured.
      const isDev =
        (process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || "development") === "development";
      const endpoint = isDev ? '/api/auth/dev-login' : '/api/auth/login';

      const response = await axios.post<CognitoLoginResponse>(endpoint, { email, password });

      const { access_token, id_token, refresh_token, user: userData } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('id_token', id_token);
      localStorage.setItem('refresh_token', refresh_token);

      // Create user object with organization info
      const user: User = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        is_active: true,
        is_verified: userData.is_verified,
        role: userData.role ? {
          id: 0, // We don't have role ID from Cognito response
          name: userData.role,
          description: ''
        } : null,
        organization: userData.organization_id ? {
          id: userData.organization_id,
          name: userData.organization_name,
          org_id: userData.organization_org_id || '',
          description: null,
          is_active: true,
          logo_url: null,
        } : null,
        profile_photo_url: null,
        auth_method: 'cognito'
      };

      setUser(user);
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error, 'Login failed');
      setError(errorMessage);
      throw error;
    }
  };

  const register = async (email: string, password: string, full_name: string, organization_name: string) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        full_name,
        organization_name,
      });

      return response.data; // Return registration result (may require confirmation)
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error, 'Registration failed');
      setError(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    if (isShowcaseMode()) {
      window.location.href = '/';
      return;
    }
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        // Cognito logout
        await axios.post('/api/auth/logout', {
          refresh_token: refreshToken,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('id_token');
      setUser(null);
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  const confirmRegistration = async (email: string, confirmationCode: string) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/confirm-registration', {
        email,
        confirmation_code: confirmationCode,
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error, 'Verification failed');
      setError(errorMessage);
      throw error;
    }
  };

  const resendConfirmationCode = async (email: string) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/resend-code', {
        email,
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error, 'Failed to resend code');
      setError(errorMessage);
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token');

      const response = await axios.post('/api/auth/refresh', {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token: newRefreshToken } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', newRefreshToken);
    } catch (error) {
      await logout();
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await axiosAuth.get('/api/users/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const hasRole = (roles: string[]): boolean => {
    if (!user || !user.role) return false;
    return roles.includes(user.role.name);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    confirmRegistration,
    resendConfirmationCode,
    logout,
    refreshToken,
    refreshUser,
    isAuthenticated: !!user,
    hasRole,
    isOwner: hasRole(['admin']),
    isManager: hasRole(['admin', 'manager']),
    isViewer: hasRole(['admin', 'manager', 'viewer']),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { axiosAuth };