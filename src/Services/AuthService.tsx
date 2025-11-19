import type { LoginRequestDto, RegisterRequestDto, TokenResponseDto } from "../Models/IdentityModels";
import type { ApiResponse } from "../Models/ApiResponse";
import { apiRequest, authenticatedRequest } from "./ApiMethodHelpers";

const API_BASE_URL = import.meta.env.VITE_API_URL

export const registerAPI = async (
  data: RegisterRequestDto
): Promise<ApiResponse<void>> => {

  return apiRequest<void>(`${API_BASE_URL}/v1/identity/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  });
};

export const loginAPI = async (
  data: LoginRequestDto
): Promise<ApiResponse<TokenResponseDto>> => {

  return apiRequest<TokenResponseDto>(`${API_BASE_URL}/v1/identity/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Type': 'Browser'
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
};


export const refreshTokenAPI = async (): Promise<ApiResponse<TokenResponseDto>> => {
  return apiRequest<TokenResponseDto>(`${API_BASE_URL}/v1/identity/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Type': 'Browser'
    },
    credentials: 'include',
    body: '""', // Add empty JSON string for optional [FromBody] string? parameter
  });
}


export const logoutAPI = async (): Promise<ApiResponse<void>> => {
  return authenticatedRequest<void>(
    `${API_BASE_URL}/v1/identity/logout`,
    null,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'Browser'
      },
      body: JSON.stringify(null)
    }
  );
};