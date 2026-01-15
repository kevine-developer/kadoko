export interface Friendship {
  id: string,
  userId1: string,             // Ordre alphabétique pour éviter doublons
  userId2: string,
  status: "pending" | "accepted" | "blocked",
  requestedBy: string,         // userId qui a initié
  createdAt: Date,
  acceptedAt: Date | null
}
