import type { ApiResponse, ProblemDetails } from "../Models/ApiResponse";
import { refreshTokenAPI } from "./AuthService";
const API_BASE_URL = import.meta.env.VITE_API_URL;


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

// implement request with automatic refresh
export const authenticatedRequestWithRefresh = async <T>(
  url: string,
  accessToken: string | null,
  onTokenRefresh: (newToken: string) => void,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  let response = await authenticatedRequest<T>(url, accessToken, options);

  // If unauthorized, attempt to refresh token and retry once
  if (!response.success && response.problem.status === 401) {
    const refreshResult = await refreshTokenAPI();

    if (refreshResult.success) {
      const newToken = refreshResult.data.accessToken;
      onTokenRefresh(newToken); // Update token in context

      // Retry original request with new token
      response = await authenticatedRequest<T>(url, newToken, options);
    } else {
      // Refresh failed, return original unauthorized response
      return response;
    }
  }

  return response;
}

// Image cache storage
// Key: URL, Value: { blob: string, etag: string, lastModified: string }
const imageCache: Map<string, { blob: string; etag: string; lastModified: string }> = new Map();


export const fetchImageWithCache = async (
  thumbnail_url: string,
  accessToken: string | null
): Promise<string | null> => {
  try {
    const url = API_BASE_URL + thumbnail_url;
    const headers: Record<string, string> = {};

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Check if we have cached version and add conditional headers
    if (imageCache.has(url)) {
      const cacheEntry = imageCache.get(url)!;
      if (cacheEntry.etag) {
        headers['If-None-Match'] = cacheEntry.etag;
      }
      if (cacheEntry.lastModified) {
        headers['If-Modified-Since'] = cacheEntry.lastModified;
      }
    }

    const response = await fetch(url, {
      headers,
      credentials: 'include',
    });

    // 304 Not Modified - return cached blob
    if (response.status === 304) {
      if (imageCache.has(url)) {
        return imageCache.get(url)!.blob;
      }
      return null;
    }

    if (!response.ok) {
      return null;
    }

    // Get the new image and extract caching headers from response
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const etag = response.headers.get('ETag') || '';
    const lastModified = response.headers.get('Last-Modified') || '';

    // Cache the blob with headers
    imageCache.set(url, {
      blob: objectUrl,
      etag: etag,
      lastModified: lastModified
    });

    return objectUrl;
  } catch (error) {
    console.error('Failed to fetch image:', error);
    return null;
  }
};

export const clearImageCache = (): void => {
  imageCache.forEach((entry) => {
    URL.revokeObjectURL(entry.blob);
  });
  imageCache.clear();
};
