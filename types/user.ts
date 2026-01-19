// ---------------------------------------------
// Shared types
// ---------------------------------------------

export type ISODateString = string;

// ---------------------------------------------
// User
// ---------------------------------------------

export enum UserRole {
  USER = "USER",
}

export interface UserReservedGift {
  giftId: string;
  reservedAt: ISODateString;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface UserPurchasedGift {
  giftId: string;
  purchasedAt: ISODateString;
}

/**
 * Public user model (frontend-safe)
 */
export interface User {
  id: string;
  username?: string | null;
  name: string; // Harmonisé avec Better Auth
  email: string;
  description?: string | null;
  image?: string | null; // Harmonisé avec Better Auth
  socialLinks?: SocialLink[];
  isPublic: boolean;
  role: UserRole;
  emailVerified: boolean;

  friends: string[]; // userIds
  wishlists: string[]; // wishlistIds

  reservedGifts: UserReservedGift[];
  purchasedGifts: UserPurchasedGift[];

  createdAt: ISODateString;
  updatedAt: ISODateString;

  // Friend-related
  friendRequests: string[]; // userIds
  pendingFriendRequests: string[]; // userIds
  blockedUsers: string[]; // userIds
}
