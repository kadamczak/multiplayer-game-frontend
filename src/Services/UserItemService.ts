import type { ApiResponse } from "../Models/ApiResponse";
import type { UserItemResponse } from "../Models/UserItem";
import { authenticatedRequestWithRefresh } from "./ApiMethodHelpers";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const getCurrentUserItemsAPI = async (
  accessToken: string | null,
  onTokenRefresh: (newToken: string) => void
): Promise<ApiResponse<UserItemResponse[]>> => {
  return authenticatedRequestWithRefresh<UserItemResponse[]>(
    `${API_BASE_URL}/v1/users/me/items`,
    accessToken,
    onTokenRefresh,
    {
      method: 'GET',
    }
  );
};