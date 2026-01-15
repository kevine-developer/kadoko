import { GiftWishlist } from "@/types/gift";

export interface WishlistPhotoSummary {
  wishlistId: string;
  wishlistTitle: string;
  totalGifts: number;
  images: string[]; 
  wishlistVisibility: string;
}

/**
 * Extrait et regroupe les images de chaque groupe de cadeaux.
 * @param groups - La liste complète des groupes (GiftGroup[])
 * @param limit - (Optionnel) Limiter le nombre d'images par groupe (ex: 4 pour une grille)
 */
export const getWishlistPhotos = (
  wishlists: GiftWishlist[],
  limit?: number
): WishlistPhotoSummary[] => {
  return wishlists.map((wishlist) => {
    // 1. On mappe tous les cadeaux pour récupérer les URLs
    const allImages = wishlist.gifts
      .map((gift) => gift.imageUrl)
      // 2. On filtre pour retirer les 'undefined', 'null' ou chaînes vides
      .filter((url): url is string => !!url && url.length > 0);

    // 3. On applique la limite si elle est fournie
    const finalImages = limit ? allImages.slice(0, limit) : allImages;

    return {
      wishlistId: wishlist.id,
      wishlistTitle: wishlist.title,
      totalGifts: wishlist.gifts.length,
      images: finalImages,
      wishlistVisibility: wishlist.visibility,
    };
  });
};
