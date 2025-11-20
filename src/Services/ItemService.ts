import type { ApiResponse } from "../Models/ApiResponse";
import type { ItemResponse, UserItemOfferResponse, UserItemSimplifiedResponse } from "../Models/ItemModels";
import { authenticatedRequestWithRefresh } from "./ApiMethodHelpers";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const getItemsAPI = async (
  accessToken: string | null,
  onTokenRefresh: (newToken: string) => void
): Promise<ApiResponse<ItemResponse[]>> => {
  return authenticatedRequestWithRefresh<ItemResponse[]>(
    `${API_BASE_URL}/v1/items`,
    accessToken,
    onTokenRefresh,
    {
      method: 'GET',
    }
  );
};

export const createItemAPI = async (
  accessToken: string | null,
  onTokenRefresh: (newToken: string) => void,
  itemData: { name: string; description: string }
): Promise<ApiResponse<ItemResponse>> => {
  return authenticatedRequestWithRefresh<ItemResponse>(
    `${API_BASE_URL}/v1/items`,
    accessToken,
    onTokenRefresh,
    {
      method: 'POST',
      body: JSON.stringify(itemData),
    }
  );
};

export const updateItemAPI = async (
  accessToken: string | null,
  onTokenRefresh: (newToken: string) => void,
  itemId: number,
  itemData: { name: string; description: string }
): Promise<ApiResponse<ItemResponse>> => {
  return authenticatedRequestWithRefresh<ItemResponse>(
    `${API_BASE_URL}/v1/items/${itemId}`,
    accessToken,
    onTokenRefresh,
    {
      method: 'PUT',
      body: JSON.stringify(itemData),
    }
  );
};

export const deleteItemAPI = async (
  accessToken: string | null,
  onTokenRefresh: (newToken: string) => void,
  itemId: number
): Promise<ApiResponse<void>> => {
  return authenticatedRequestWithRefresh<void>(
    `${API_BASE_URL}/v1/items/${itemId}`,
    accessToken,
    onTokenRefresh,
    {
      method: 'DELETE',
    }
  );
};

export const getCurrentUserItemsAPI = async (
  accessToken: string | null,
  onTokenRefresh: (newToken: string) => void
): Promise<ApiResponse<UserItemSimplifiedResponse[]>> => {
  return authenticatedRequestWithRefresh<UserItemSimplifiedResponse[]>(
    `${API_BASE_URL}/v1/users/me/items`,
    accessToken,
    onTokenRefresh,
    {
      method: 'GET',
    }
  );
};

export const getOffersAPI = async (
  accessToken: string | null,
  onTokenRefresh: (newToken: string) => void
): Promise<ApiResponse<UserItemOfferResponse[]>> => {
  return authenticatedRequestWithRefresh<UserItemOfferResponse[]>(
    `${API_BASE_URL}/v1/users/offers`,
    accessToken,
    onTokenRefresh,
    {
      method: 'GET',
    }
  );
};