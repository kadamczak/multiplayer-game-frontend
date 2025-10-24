import type { LoginRequestDto, RegisterRequestDto, TokenResponseDto } from "../Models/Identity";

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

    const responseData = await response.json();
    
    if (responseData.errors) {
      return {
        success: false,
        title: responseData.title || 'Validation failed.',
        errors: responseData.errors
      };
    }

    return {
      success: false,
      title: responseData.title || 'Registration failed.'
    };

  } catch (error) {
    return { success: false, title: 'Unknown error. Please try again.' };
  }
};

export const login = async (
  data: LoginRequestDto
): Promise<{ 
  success: boolean; 
  title?: string;
  errors?: Record<string, string[]>;
  body?: TokenResponseDto;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/identity/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'Browser'
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (response.ok) {
      return { success: true, body: responseData.body };
    }
    
    if (responseData.errors) {
      return {
        success: false,
        title: responseData.title || 'Validation failed.',
        errors: responseData.errors
      };
    }

    return {
      success: false,
      title: responseData.title || 'Login failed.'
    };

  } catch (error) {
    return { success: false, title: 'Unknown error. Please try again.' };
  }
};