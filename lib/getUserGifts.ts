import { getUserById } from "@/lib/getUserById";
import { getGiftById } from "@/lib/giftUtils";
import { getWishlistById } from "@/lib/wishlistUtils";
import { Gift } from "@/types/gift";
import {
  User,
  UserReservedGift,
  UserPurchasedGift,
} from "@/types/user";

type GiftContext = {
  wishlist: {
    id: string;
    title: string;
    eventDate?: string;
  };
  owner: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
};

type ReservedGiftWithContext = Gift &
  GiftContext & {
    reservedAt: string;
  };

type PurchasedGiftWithContext = Gift &
  GiftContext & {
    purchasedAt: string;
  };

export function getUserReservedGiftsWithContext(
  user: User
): ReservedGiftWithContext[] {
  return user.reservedGifts
    .map((entry: UserReservedGift) => {
      const gift = getGiftById(entry.giftId);
      if (!gift) return null;

      const wishlist = getWishlistById(gift.wishlistId);
      if (!wishlist) return null;

      const owner = getUserById(wishlist.userId);
      if (!owner) return null;

      return {
        ...gift,
        reservedAt: entry.reservedAt,
        wishlist: {
          id: wishlist.id,
          title: wishlist.title,
          eventDate: wishlist.eventDate,
        },
        owner: {
          id: owner.id,
          fullName: owner.fullName,
          avatarUrl: owner.avatarUrl,
        },
      };
    })
    .filter(Boolean) as ReservedGiftWithContext[];
}

export function getUserPurchasedGiftsWithContext(
  user: User
): PurchasedGiftWithContext[] {
  return user.purchasedGifts
    .map((entry: UserPurchasedGift) => {
      const gift = getGiftById(entry.giftId);
      if (!gift) return null;

      const wishlist = getWishlistById(gift.wishlistId);
      if (!wishlist) return null;

      const owner = getUserById(wishlist.userId);
      if (!owner) return null;

      return {
        ...gift,
        purchasedAt: entry.purchasedAt,
        wishlist: {
          id: wishlist.id,
          title: wishlist.title,
          eventDate: wishlist.eventDate,
        },
        owner: {
          id: owner.id,
          fullName: owner.fullName,
          avatarUrl: owner.avatarUrl,
        },
      };
    })
    .filter(Boolean) as PurchasedGiftWithContext[];
}
