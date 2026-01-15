import { GiftWishlist } from "@/types/gift";

export function getUserWishlists(
  allWishlists: GiftWishlist[],
  wishlistIds: string[] | undefined
): GiftWishlist[] {
  return allWishlists.filter((wishlist) =>
    wishlistIds?.includes(wishlist.id)
  );
}
