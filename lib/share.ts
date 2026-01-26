import * as Linking from "expo-linking";
import { Share } from "react-native";

/**
 * Partage un cadeau via deep link
 */
export const shareGift = async (giftId: string, title: string) => {
  try {
    const url = Linking.createURL(`/gifts/${giftId}`);
    await Share.share({
      message: `Découvre ce cadeau sur GiftFlow : ${title}\n${url}`,
      url,
    });
  } catch (error) {
    console.error("Erreur lors du partage:", error);
  }
};

/**
 * Partage une wishlist via deep link
 */
export const shareWishlist = async (wishlistId: string, title: string) => {
  try {
    const url = Linking.createURL(`/gifts/wishlists/${wishlistId}`);
    await Share.share({
      message: `Découvre ma liste "${title}" sur GiftFlow\n${url}`,
      url,
    });
  } catch (error) {
    console.error("Erreur lors du partage:", error);
  }
};
