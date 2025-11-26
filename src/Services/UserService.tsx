import type { ApiResponse } from "../Models/ApiResponse";
import type { UserGameInfoResponse } from "../Models/UserModels";
import { authenticatedRequestWithRefresh } from "./ApiMethodHelpers";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const getUserGameInfoAPI = async (
  accessToken: string | null,
  onTokenRefresh: (newToken: string) => void
): Promise<ApiResponse<UserGameInfoResponse>> => {
  return authenticatedRequestWithRefresh<UserGameInfoResponse>(
    `${API_BASE_URL}/v1/users/me/game-info`,
    accessToken,
    onTokenRefresh,
    {
      method: 'GET',
    }
  );
};


export const deleteProfilePictureAPI = async (
  accessToken: string | null,
  onTokenRefresh: (newToken: string) => void
): Promise<ApiResponse<UserGameInfoResponse>> => {
  return authenticatedRequestWithRefresh<UserGameInfoResponse>(
    `${API_BASE_URL}/v1/users/me/profile-picture`,
    accessToken,
    onTokenRefresh,
    {
      method: 'DELETE',
    }
  );
};


export const uploadProfilePictureAPI = async (
  accessToken: string | null,
  onTokenRefresh: (newToken: string) => void,
  file: File
): Promise<ApiResponse<void>> => {
  const formData = new FormData();
  formData.append('file', file);

  return authenticatedRequestWithRefresh<void>(
    `${API_BASE_URL}/v1/users/me/profile-picture`,
    accessToken,
    onTokenRefresh,
    {
      method: 'POST',
      body: formData,
    }
  );
};