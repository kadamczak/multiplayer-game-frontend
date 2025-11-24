import type { ChangePasswordRequest, ConfirmEmailRequest, DeleteAccountRequest, ForgotPasswordRequest, LoginRequestDto, RegisterRequestDto, ResetPasswordRequest, TokenResponseDto } from "../Models/IdentityModels";
import type { ApiResponse } from "../Models/ApiResponse";
import { apiRequest, authenticatedRequest, authenticatedRequestWithRefresh } from "./ApiMethodHelpers";

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


export const logoutAPI = async (
): Promise<ApiResponse<void>> => {
  return apiRequest<void>(
    `${API_BASE_URL}/v1/identity/logout`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'Browser'
      },
      credentials: 'include',
      body: JSON.stringify(null)
    }
  );
};


export const changePasswordAPI = async (
  accessToken: string | null,
  onTokenRefresh: (newToken: string) => void,
  data: ChangePasswordRequest,
): Promise<ApiResponse<void>> => {
  return authenticatedRequestWithRefresh<void>(
    `${API_BASE_URL}/v1/identity/change-password`,
    accessToken,
    onTokenRefresh,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'Browser'
      },
      body: JSON.stringify(data)
    }
  );
};


export const deleteAccountAPI = async (
  accessToken: string | null,
  onTokenRefresh: (newToken: string) => void,
  data: DeleteAccountRequest,
): Promise<ApiResponse<void>> => {
  return authenticatedRequestWithRefresh<void>(
    `${API_BASE_URL}/v1/identity/delete-account`,
    accessToken,
    onTokenRefresh,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'Browser'
      },
      body: JSON.stringify(data)
    }
  );
};


export const forgotPasswordAPI = async (
  data: ForgotPasswordRequest
): Promise<ApiResponse<void>> => {
  return apiRequest<void>(
    `${API_BASE_URL}/v1/identity/forgot-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    }
  );
};


export const resetPasswordAPI = async (
  data: ResetPasswordRequest
): Promise<ApiResponse<void>> => {
  return apiRequest<void>(
    `${API_BASE_URL}/v1/identity/reset-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    }
  );
}


export const confirmEmailAPI = async (
  data: ConfirmEmailRequest
): Promise<ApiResponse<void>> => {
  return apiRequest<void>(
    `${API_BASE_URL}/v1/identity/confirm-email`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    }
  );
}