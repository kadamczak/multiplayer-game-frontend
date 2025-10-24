import type { ApiResponse, ProblemDetails } from "../Models/ApiResponse";

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