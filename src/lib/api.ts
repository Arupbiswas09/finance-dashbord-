// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Accounting Platform";
export const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || "development";

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  login: '/api/auth/login',
  register: '/api/auth/register',
  logout: '/api/auth/logout',
  refresh: '/api/auth/refresh',
  forgotPassword: '/api/auth/forgot-password',
  confirmPassword: '/api/auth/confirm-password',
  confirmRegistration: '/api/auth/confirm-registration',
  resendCode: '/api/auth/resend-code',
  validateToken: '/api/auth/validate-token',

  // Health
  health: '/health',
  healthDetailed: '/api/health/detailed',
  healthLive: '/api/health/live',
  healthReady: '/api/health/ready',

  // Users
  users: '/api/users',
  profile: '/api/users/me',

  // Organizations
  organizations: '/api/organizations',

  // Clients
  clients: '/api/clients',
  clientsSync: '/api/clients/sync',

  // Reports
  reports: '/api/reports',
  reportsGenerate: '/api/reports/generate',

  // Newsletters
  newsletters: '/api/newsletters',
  newslettersGenerate: '/api/newsletters/generate',

  // Email Lists
  emailLists: '/api/email-lists',

  // Dashboard
  dashboardStats: '/api/dashboard/stats',
  dashboardActivity: '/api/dashboard/recent-activity',
  dashboardActions: '/api/dashboard/quick-actions',

  // Chat
  chatConversations: '/api/chat/conversations',
  chatConversation: (id: number) => `/api/chat/conversations/${id}`,
  chatMessages: (id: number) => `/api/chat/conversations/${id}/messages`,

  // Report indexing
  reportIndexPdf: (id: number) => `/api/reports/${id}/index-pdf`,
  reportIndexingStatus: (id: number) => `/api/reports/${id}/indexing-status`,

  // Knowledge Bases
  knowledgeBases: '/api/knowledge-bases',
  knowledgeBase: (id: number) => `/api/knowledge-bases/${id}`,
  knowledgeBaseDocuments: (kbId: number) => `/api/knowledge-bases/${kbId}/documents`,
  knowledgeBaseDocument: (kbId: number, docId: number) => `/api/knowledge-bases/${kbId}/documents/${docId}`,
  knowledgeBaseDocumentIndex: (kbId: number, docId: number) => `/api/knowledge-bases/${kbId}/documents/${docId}/index`,
} as const;

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Helper function for API calls with proper error handling
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = buildApiUrl(endpoint);
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
};