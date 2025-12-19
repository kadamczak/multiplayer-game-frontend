export type FriendResponse = {
  userId: string;
  userName: string;
  profilePictureUrl?: string;
  friendsSince: string;
}


export type FriendRequestResponse = {
  id: string;

  requesterId: string;
  requesterUserName: string;
  requesterProfilePictureUrl?: string;

  receiverId: string;
  receiverUserName: string;
  receiverProfilePictureUrl?: string;

  status: string;
  createdAt: string;
  respondedAt?: string;
}