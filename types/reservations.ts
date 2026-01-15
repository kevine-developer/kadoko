
export interface Reservation {
  id: string,
  itemId: string,
  wishlistId: string,
  reservedBy: string,          // userId
  reservedAt: Date,
  status: "reserved" | "purchased" | "gifted" | "cancelled",
  
  // Pour cagnottes
  isCrowdfundingContribution: boolean,
  contributionAmount: number | null,
  paymentIntentId: string | null  // MangoPay transaction ID
}
