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