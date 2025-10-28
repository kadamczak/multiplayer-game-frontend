// ASP.NET Core Problem Details response format
export type ProblemDetails = {
    status: number;
    title: string;
    errors?: Record<string, string[]>;

    type?: string; // optional for now
    detail?: string;
    instance?: string;
}

// Generic API response wrapper
export type ApiResponse<T = void> = 
  | { success: true; data: T }
  | { success: false; problem: ProblemDetails }

// Helper to check if response is successful
export const isSuccess = <T>(response: ApiResponse<T>): response is { success: true; data: T } => {
  return response.success;
}

// Helper to extract field errors for react-hook-form
export const getFieldErrors = (problem?: ProblemDetails): Record<string, string> | undefined => {
  if (!problem?.errors) return undefined;
  
  const fieldErrors: Record<string, string> = {};
  
  for (const [field, messages] of Object.entries(problem.errors)) {
    // Convert PascalCase to camelCase to match form field names
    const camelCaseField = field.charAt(0).toLowerCase() + field.slice(1);
    fieldErrors[camelCaseField] = messages.join('\n');
  }
  
  return fieldErrors;
}
