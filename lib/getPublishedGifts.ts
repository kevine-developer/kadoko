import { Gift } from "@/types/gift";

/**
 * Filtre les cadeaux publiés dans une liste de gifts
 * @param gifts Liste de gifts à filtrer
 * @returns Gifts dont publish?.publish === true
 */
export function getPublishedGifts(gifts: Gift[]): Gift[] {
  return gifts.filter((gift) => gift.publication?.isPublished === true);
}



