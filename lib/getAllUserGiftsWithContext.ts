import { getUserById } from "@/lib/getUserById";
import { getGiftById } from "@/lib/giftUtils";
import { getWishlistById } from "@/lib/wishlistUtils";
import { EventType, Gift } from "@/types/gift";
import { User, UserPurchasedGift, UserReservedGift } from "@/types/user";

type GiftEntry =
  | (UserReservedGift & { type: "reserved" })
  | (UserPurchasedGift & { type: "purchased" });

export type GiftWithFullContext = Gift & {
  wishlist: {
    id: string;
    title: string;
    eventDate: string | undefined;
    eventType: EventType;
    description: string | undefined;
  };
  owner: {
    id: string;
    fullName: string;
    avatarUrl: string | undefined;
  };
  reservedAt: string | undefined;
  purchasedAt: string | undefined;
};

export function getAllUserGiftsWithContext(user: User): GiftWithFullContext[] {
  const entries: GiftEntry[] = [
    ...user.reservedGifts.map((gift) => ({
      ...gift,
      type: "reserved" as const,
    })),
    ...user.purchasedGifts.map((gift) => ({
      ...gift,
      type: "purchased" as const,
    })),
  ];

  return entries
    .map((entry) => {
      const gift = getGiftById(entry.giftId);
      if (!gift) return null;

      const wishlist = getWishlistById(gift.wishlistId);
      if (!wishlist) return null;

      const owner = getUserById(wishlist.userId);
      if (!owner) return null;

      return {
        ...gift,
        reservedAt: entry.type === "reserved" ? entry.reservedAt : undefined,
        purchasedAt: entry.type === "purchased" ? entry.purchasedAt : undefined,
        wishlist: {
          id: wishlist.id,
          title: wishlist.title,
          eventDate: wishlist.eventDate,
          eventType: wishlist.eventType,
          description: wishlist.description,
        },
        owner: {
          id: owner.id,
          fullName: owner.fullName,
          avatarUrl: owner.avatarUrl,
        },
      };
    })
    .filter((gift): gift is GiftWithFullContext => gift !== null);
}
