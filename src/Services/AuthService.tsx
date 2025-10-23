import type { RegisterRequestDto } from "../Models/Identity";

const API_BASE_URL = import.meta.env.VITE_API_URL

export const register = async (
  data: RegisterRequestDto
): Promise<{ 
  success: boolean; 
  title?: string;
  errors?: Record<string, string[]>;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/identity/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return { success: true };
    }

    const errorData = await response.json();
    
    if (errorData.errors) {
      return {
        success: false,
        title: errorData.title || 'Validation failed',
        errors: errorData.errors
      };
    }

    return {
      success: false,
      title: errorData.title || 'Registration failed'
    };

  } catch (error) {
    return { success: false, title: 'Network error. Please try again.' };
  }
};