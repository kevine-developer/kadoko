import { Timestamp } from "react-native-reanimated/lib/typescript/commonTypes";

export interface Item {
  id: string,
  wishlistId: string,
  title: string,
  description: string,
  imageUrl: string,
  productUrl: string | null,
  estimatedPrice: number,
  priority: "essential" | "nice" | "optional",
  size: string | null,
  color: string | null,
  notes: string,               // Notes privées du propriétaire
  createdAt: Timestamp,
  
  // Champs pour réservation
  isReserved: boolean,
  isCrowdfunding: boolean,
  crowdfundingGoal: number | null,
  crowdfundingCurrent: number | null
}
