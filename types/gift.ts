// ---------------------------------------------
// Shared types
// ---------------------------------------------

export type ISODateString = string;

// ---------------------------------------------
// Enums (domain-safe, UI-agnostic)
// ---------------------------------------------

export enum GiftStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  PURCHASED = "PURCHASED",
  ARCHIVED = "ARCHIVED",
}

export enum GiftPriority {
  ESSENTIAL = "ESSENTIAL",
  NICE = "NICE",
  OPTIONAL = "OPTIONAL",
}

export enum WishlistVisibility {
  PUBLIC = "PUBLIC",
  FRIENDS = "FRIENDS",
  PRIVATE = "PRIVATE",
}

export enum EventType {
  BIRTHDAY = "BIRTHDAY",
  WEDDING = "WEDDING",
  CHRISTMAS = "CHRISTMAS",
  OTHER = "OTHER",
}

// ---------------------------------------------
// Gift publication
// ---------------------------------------------

export interface GiftPublication {
  isPublished: boolean;
  publishedAt?: ISODateString;
}

// ---------------------------------------------
// Gift lifecycle
// ---------------------------------------------

export interface GiftReservation {
  userId: string;
  reservedAt: ISODateString;
}

export interface GiftPurchase {
  userId: string;
  purchasedAt: ISODateString;
}

// ---------------------------------------------
// Gift
// ---------------------------------------------

export interface Gift {
  id: string;
  wishlistId: string;

  title: string;
  description?: string;

  publication?: GiftPublication;

  imageUrl?: string;
  productUrl?: string;

  estimatedPrice?: number;

  status: GiftStatus;
  priority?: GiftPriority;

  reservation?: GiftReservation;
  purchase?: GiftPurchase;

  notes?: string;

  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ---------------------------------------------
// Wishlist
// ---------------------------------------------

export interface GiftWishlist {
  id: string;
  userId: string;

  title: string;
  description?: string;

  eventType: EventType;
  eventDate?: ISODateString;

  visibility: WishlistVisibility;
  allowedUsers?: string[]; // userIds

  gifts: Gift[];

  createdAt: ISODateString;
  updatedAt: ISODateString;
}
