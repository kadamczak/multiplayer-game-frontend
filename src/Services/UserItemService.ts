import type { ApiResponse } from "../Models/ApiResponse";
import type { UserItemResponse } from "../Models/UserItem";
import { authenticatedRequest } from "./ApiMethodHelpers";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const getCurrentUserItemsAPI = async (
  accessToken: string | null
): Promise<ApiResponse<UserItemResponse[]>> => {
  return authenticatedRequest<UserItemResponse[]>(
    `${API_BASE_URL}/v1/users/me/items`,
    accessToken,
    {
      method: 'GET',
    }
  );
};