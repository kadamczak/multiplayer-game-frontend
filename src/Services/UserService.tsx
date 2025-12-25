import type { ApiResponse } from "../Models/ApiResponse";
import { pagedQueryToParams, type PagedQuery } from "../Models/PagedQuery";
import type { PagedResponse } from "../Models/PagedResponse";
import type { UserGameInfoResponse, UserSearchResultResponse } from "../Models/UserModels";
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


export const searchFriendableUsersAPI = async (
  accessToken: string | null,
  onTokenRefresh: (newToken: string) => void,
  query: PagedQuery
): Promise<ApiResponse<PagedResponse<UserSearchResultResponse>>> => {
  const params = pagedQueryToParams(query, true);

  return authenticatedRequestWithRefresh<PagedResponse<UserSearchResultResponse>>(
    `${API_BASE_URL}/v1/users/friendable?${params.toString()}`,
    accessToken,
    onTokenRefresh,
    {
      method: 'GET',
    }
  );
};