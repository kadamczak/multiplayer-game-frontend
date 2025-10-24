import type { LoginRequestDto, RegisterRequestDto, TokenResponseDto } from "../Models/Identity";
import type { ApiResponse } from "../Models/ApiResponse";
import { apiRequest } from "./ApiMethods";

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
