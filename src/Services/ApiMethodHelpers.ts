import type { ApiResponse, ProblemDetails } from "../Models/ApiResponse";
import { refreshTokenAPI } from "./AuthService";

// Helper function to parse error responses
const parseProblemDetails = async (response: Response): Promise<ProblemDetails> => {
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json') || contentType?.includes('application/problem+json')) {
    const errorData = await response.json();
    return {
      status: response.status,
      title: errorData.title || 'Request failed',
      errors: errorData.errors,
      type: errorData.type,
      detail: errorData.detail,
      instance: errorData.instance,
    };
  }

  // Fallback for non-JSON responses
  const text = await response.text();
  return {
    title: text || response.statusText || 'Request failed',
    status: response.status,
  };
};

// Generic fetch wrapper
export const apiRequest = async <T>(
  url: string,
  options: RequestInit
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(url, options);

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        return { success: true, data };
      }
      
      // For void responses (like register)
      return { success: true, data: undefined as T };
    }

    const problem = await parseProblemDetails(response);
    return { success: false, problem };

  } catch (error) {
    return {
      success: false,
      problem: {
        title: 'Unexpected error. Please try again.',
        status: 0,
        detail: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
};

// Authenticated fetch wrapper - includes Authorization header
export const authenticatedRequest = async <T>(
  url: string,
  accessToken: string | null,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add Authorization header if token exists
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return apiRequest<T>(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies (refresh token)
  });
};

export const authenticatedRequestWithRefresh = async <T>(
  url: string,
  accessToken: string | null,
  options: RequestInit = {},
  refreshCallback: (newToken: string) => void
): Promise<ApiResponse<T>> => {
  // First attempt with current token
  let result = await authenticatedRequest<T>(url, accessToken, options);

  // If unauthorized (401), try to refresh and retry
  if (!result.success && result.problem.status === 401) {
    const refreshResult = await refreshTokenAPI();

    if (refreshResult.success) {
      // Update token and retry the original request
      const newToken = refreshResult.data.accessToken;
      refreshCallback(newToken);
      
      // Retry with new token
      result = await authenticatedRequest<T>(url, newToken, options);
    }
  }

  return result;
};
