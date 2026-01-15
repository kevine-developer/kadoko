// ---------------------------------------------
// Shared types
// ---------------------------------------------

export type ISODateString = string;

// ---------------------------------------------
// User
// ---------------------------------------------

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export interface UserReservedGift {
  giftId: string;
  reservedAt: ISODateString;
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
  username: string;
  fullName: string;
  email: string;

  description?: string;
  avatarUrl?: string;

  role: UserRole;

  friends: string[];       // userIds
  wishlists: string[];     // wishlistIds

  reservedGifts: UserReservedGift[];
  purchasedGifts: UserPurchasedGift[];

  createdAt: ISODateString;
  updatedAt: ISODateString;
}
