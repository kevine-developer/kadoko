
import { MOCK_WISHLISTS } from "@/mocks/wishlists.mock";
import { GiftWishlist } from "@/types/gift";

export function getWishlistById(
  wishlistId: string
): GiftWishlist | undefined {
  return MOCK_WISHLISTS.find(
    (wishlist) => wishlist.id === wishlistId
  );
}
