// mocks/gift-groups.mock.ts
import {
  GiftGroup,
  GiftPriority,
  GiftStatus,
  GroupVisibility,
} from "@/types/gift";

const NOW = new Date().toISOString();

export const MOCK_GIFT_GROUPS: GiftGroup[] = [
  {
    id: "group-001",
    userId: "user-luna-01",
    title: "Mes 30 ans 🎂",
    description: "Une petite liste pour marquer le coup.",
    eventType: "Anniversaire",
    eventDate: "2026-02-22T00:00:00.000Z",
    visibility: GroupVisibility.FRIENDS,
    allowedUsers: ["user-paul", "user-marie", "user-thomas"],
    createdAt: "2025-12-01T10:00:00.000Z",
    updatedAt: "2026-01-10T09:00:00.000Z",
    gifts: [
      {
        id: "gift-101",
        wishlistId: "group-001",
        title: "Casque Sony WH-1000XM5",
        description: "Pour me concentrer au travail.",
        imageUrl:
          "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000&auto=format&fit=crop",
        estimatedPrice: 350,
        status: GiftStatus.RESERVED,
        priority: GiftPriority.ESSENTIAL,
        reservedAt: "2026-01-05T14:00:00.000Z",
        createdAt: NOW,
        updatedAt: NOW,
      },
      {
        id: "gift-102",
        wishlistId: "group-001",
        title: "Nike Air Force 1",
        description: "Taille 38, blanc classique.",
        imageUrl:
          "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000&auto=format&fit=crop",
        estimatedPrice: 110,
        status: GiftStatus.PURCHASED,
        priority: GiftPriority.NICE,
        purchasedAt: "2026-01-08T18:30:00.000Z",
        createdAt: NOW,
        updatedAt: NOW,
      },
      {
        id: "gift-103",
        wishlistId: "group-001",
        title: "Livre Ottolenghi",
        description: "Simple ou Flavor.",
        imageUrl:
          "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop",
        estimatedPrice: 35,
        status: GiftStatus.ARCHIVED,
        priority: GiftPriority.OPTIONAL,
        createdAt: NOW,
        updatedAt: NOW,
      },
    ],
  },
];
