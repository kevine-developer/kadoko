import { MOCK_WISHLISTS } from "@/mocks/wishlists.mock"; // Assurez-vous que le chemin est bon
import { Gift, GiftWishlist } from "@/types/gift";

/**
 * Récupère un cadeau via son ID en cherchant dans tous les groupes.
 * @param giftId L'identifiant du cadeau recherché
 * @returns L'objet Gift ou undefined si non trouvé
 */
export const getGiftById = (giftId: string): Gift | undefined => {
  // On utilise une boucle for...of pour pouvoir s'arrêter dès qu'on trouve (plus performant que map/filter)
  for (const group of MOCK_WISHLISTS) {
    const foundGift = group.gifts.find((g) => g.id === giftId);
    if (foundGift) {
      return foundGift;
    }
  }
  return undefined;
};

/**
 * Récupère le cadeau ET son groupe parent via l'ID du cadeau.
 * Utile si vous avez besoin d'afficher "Liste de X" dans le détail du cadeau.
 */
export const getGiftWithGroup = (
  giftId: string
): { gift: Gift; group: GiftWishlist } | null => {
  for (const group of MOCK_WISHLISTS) {
    const foundGift = group.gifts.find((g) => g.id === giftId);
    if (foundGift) {
      return { gift: foundGift, group };
    }
  }
  return null;
};