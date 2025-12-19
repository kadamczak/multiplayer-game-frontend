import type { ApiResponse } from "../Models/ApiResponse";
import type { FriendRequestResponse, FriendResponse } from "../Models/FriendModels";
import { pagedQueryToParams, type PagedQuery } from "../Models/PagedQuery";
import type { PagedResponse } from "../Models/PagedResponse";
import { authenticatedRequestWithRefresh } from "./ApiMethodHelpers";

const API_BASE_URL = import.meta.env.VITE_API_URL;


export const getReceivedFriendRequestsAPI = async (
  accessToken: string | null,
  onTokenRefresh: (newToken: string) => void,
  query: PagedQuery
): Promise<ApiResponse<PagedResponse<FriendRequestResponse>>> => {
  const params = pagedQueryToParams(query, true);

  return authenticatedRequestWithRefresh<PagedResponse<FriendRequestResponse>>(
    `${API_BASE_URL}/v1/friends/requests/received?${params.toString()}`,
    accessToken,
    onTokenRefresh,
    {
      method: 'GET',
    }
  );
};


export const getSentFriendRequestsAPI = async (
  accessToken: string | null,
  onTokenRefresh: (newToken: string) => void,
  query: PagedQuery
): Promise<ApiResponse<PagedResponse<FriendRequestResponse>>> => {
  const params = pagedQueryToParams(query, true);

  return authenticatedRequestWithRefresh<PagedResponse<FriendRequestResponse>>(
    `${API_BASE_URL}/v1/friends/requests/sent?${params.toString()}`,
    accessToken,
    onTokenRefresh,
    {
      method: 'GET',
    }
  );
};


export const getFriendsAPI = async (
  accessToken: string | null,
  onTokenRefresh: (newToken: string) => void,
  query: PagedQuery
): Promise<ApiResponse<PagedResponse<FriendResponse>>> => {
  const params = pagedQueryToParams(query, true);

  return authenticatedRequestWithRefresh<PagedResponse<FriendResponse>>(
    `${API_BASE_URL}/v1/friends?${params.toString()}`,
    accessToken,
    onTokenRefresh,
    {
      method: 'GET',
    }
  );
};


export const sendFriendRequestAPI = async (
  accessToken: string | null,
  onTokenRefresh: (newToken: string) => void,
  receiverId: string
): Promise<ApiResponse<void>> => {

  return authenticatedRequestWithRefresh<void>(
    `${API_BASE_URL}/v1/friends/requests`,
    accessToken,
    onTokenRefresh,
    {
      method: 'POST',
      body: JSON.stringify({ receiverId }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}


export const cancelFriendRequestAPI = async (
  accessToken: string | null,
  onTokenRefresh: (newToken: string) => void,
  requestId: string
): Promise<ApiResponse<void>> => {

  return authenticatedRequestWithRefresh<void>(
    `${API_BASE_URL}/v1/friends/requests/${requestId}`,
    accessToken,
    onTokenRefresh,
    {
      method: 'DELETE',
      body: JSON.stringify({ requestId }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}


export const acceptFriendRequestAPI = async (
  accessToken: string | null,
  onTokenRefresh: (newToken: string) => void,
  requestId: string
): Promise<ApiResponse<void>> => {

  return authenticatedRequestWithRefresh<void>(
    `${API_BASE_URL}/v1/friends/requests/${requestId}/accept`,
    accessToken,
    onTokenRefresh,
    {
      method: 'POST',
      body: JSON.stringify({ requestId }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}


export const rejectFriendRequestAPI = async (
  accessToken: string | null,
  onTokenRefresh: (newToken: string) => void,
  requestId: string
): Promise<ApiResponse<void>> => {

  return authenticatedRequestWithRefresh<void>(
    `${API_BASE_URL}/v1/friends/requests/${requestId}/reject`,
    accessToken,
    onTokenRefresh,
    {
      method: 'POST',
      body: JSON.stringify({ requestId }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}


export const removeFriendAPI = async (
  accessToken: string | null,
  onTokenRefresh: (newToken: string) => void,
  friendUserId: string
): Promise<ApiResponse<void>> => {

  return authenticatedRequestWithRefresh<void>(
    `${API_BASE_URL}/v1/friends/${friendUserId}`,
    accessToken,
    onTokenRefresh,
    {
      method: 'DELETE',
      body: JSON.stringify({ friendUserId }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}