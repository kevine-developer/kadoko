import {
  EventType,
  GiftPriority,
  GiftStatus,
  GiftWishlist,
  WishlistVisibility,
} from "@/types/gift";

const NOW = new Date().toISOString();

export const MOCK_WISHLISTS: GiftWishlist[] = [
  // ============================================================
  // 1. KEVINE — ANNIVERSAIRE (TOUS STATUTS)
  // ============================================================
  {
    id: "wishlist-kevine-birthday",
    userId: "user-kevine",
    title: "Pour mon nouveau projet professionnel",
    description: "Une sélection qui me ferait vraiment plaisir.",
    eventType: EventType.BIRTHDAY,
    eventDate: "2026-02-22T00:00:00.000Z",
    visibility: WishlistVisibility.FRIENDS,
    allowedUsers: ["user-paul", "user-marie", "user-sophie"],
    createdAt: "2025-12-01T10:00:00.000Z",
    updatedAt: NOW,
    gifts: [
      {
        id: "gift-kevine-01",
        wishlistId: "wishlist-kevine-birthday",
        title: "Casque Sony WH-1000XM5",
        description: "Idéal pour le métro et le télétravail.",
        estimatedPrice: 320,
        imageUrl:
          "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80",
        productUrl: "https://www.sony.fr",
        status: GiftStatus.RESERVED,
        priority: GiftPriority.ESSENTIAL,
        publication: {
          isPublished: true,
          publishedAt: "2025-12-05T09:00:00.000Z",
        },
        reservation: {
          userId: "user-paul",
          reservedAt: "2026-01-05T12:00:00.000Z",
        },
        createdAt: NOW,
        updatedAt: NOW,
      },
      {
        id: "gift-kevine-02",
        wishlistId: "wishlist-kevine-birthday",
        title: "Clavier ergonomic",
        description: "Taille 38 – Blanc pastel",
        estimatedPrice: 110,
        imageUrl:
          "https://images.unsplash.com/photo-1653786146814-fc617f0de776?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        status: GiftStatus.PURCHASED,
        priority: GiftPriority.NICE,
        publication: {
          isPublished: true,
        },
        purchase: {
          userId: "user-sophie",
          purchasedAt: "2026-01-08T15:30:00.000Z",
        },
        createdAt: NOW,
        updatedAt: NOW,
      },
      {
        id: "gift-kevine-03",
        wishlistId: "wishlist-kevine-birthday",
        title: "Polaroid Now+",
        estimatedPrice: 150,
        imageUrl:
          "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
        status: GiftStatus.AVAILABLE,
        priority: GiftPriority.NICE,
        publication: {
          isPublished: true,
        },
        createdAt: NOW,
        updatedAt: NOW,
      },
      {
        id: "gift-kevine-04",
        wishlistId: "wishlist-kevine-birthday",
        title: "Livre « Ottolenghi – Flavor »",
        estimatedPrice: 35,
        imageUrl:
          "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80",
        status: GiftStatus.ARCHIVED,
        priority: GiftPriority.OPTIONAL,
        publication: {
          isPublished: false,
        },
        notes: "Finalement déjà acheté pour moi-même.",
        createdAt: NOW,
        updatedAt: NOW,
      },
    ],
  },

  // ============================================================
  // 2. KEVINE — LISTE PRIVÉE (NON PUBLIÉE)
  // ============================================================
  {
    id: "wishlist-kevine-private",
    userId: "user-kevine",
    title: "Projets personnels",
    description: "Idées à long terme, non partagées.",
    eventType: EventType.OTHER,
    visibility: WishlistVisibility.PRIVATE,
    createdAt: "2026-01-02T08:00:00.000Z",
    updatedAt: NOW,
    gifts: [
      {
        id: "gift-kevine-private-01",
        wishlistId: "wishlist-kevine-private",
        title: "Cours de poterie (3 mois)",
        estimatedPrice: 200,
        imageUrl:
          "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80",
        status: GiftStatus.AVAILABLE,
        priority: GiftPriority.NICE,
        publication: {
          isPublished: false,
        },
        createdAt: NOW,
        updatedAt: NOW,
      },
    ],
  },

  // ============================================================
  // 3. MARIE — CRÉMAILLÈRE (CADEAU DE COUPLE)
  // ============================================================
  {
    id: "wishlist-marie-house",
    userId: "user-marie",
    title: "Crémaillère 🏠",
    description: "Notre premier appartement.",
    eventType: EventType.OTHER,
    eventDate: "2026-03-15T18:00:00.000Z",
    visibility: WishlistVisibility.FRIENDS,
    allowedUsers: ["user-kevine", "user-paul", "user-sophie"],
    createdAt: "2026-01-15T09:00:00.000Z",
    updatedAt: NOW,
    gifts: [
      {
        id: "gift-marie-01",
        wishlistId: "wishlist-marie-house",
        title: "Cocotte Le Creuset",
        estimatedPrice: 280,
        imageUrl:
          "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80",
        status: GiftStatus.RESERVED,
        priority: GiftPriority.ESSENTIAL,
        reservation: {
          userId: "user-kevine",
          reservedAt: "2026-01-20T10:00:00.000Z",
        },
        publication: {
          isPublished: true,
        },
        createdAt: NOW,
        updatedAt: NOW,
      },
      {
        id: "gift-marie-02",
        wishlistId: "wishlist-marie-house",
        title: "Machine à café Nespresso",
        estimatedPrice: 90,
        imageUrl:
          "https://images.unsplash.com/photo-1608354580875-30bd4168b351?auto=format&fit=crop&w=800&q=80",
        status: GiftStatus.PURCHASED,
        priority: GiftPriority.ESSENTIAL,
        purchase: {
          userId: "user-paul",
          purchasedAt: "2026-01-25T14:00:00.000Z",
        },
        publication: {
          isPublished: true,
        },
        createdAt: NOW,
        updatedAt: NOW,
      },
    ],
  },

  // ============================================================
  // 4. PAUL — NOËL (ÉVÉNEMENT PASSÉ)
  // ============================================================
  {
    id: "wishlist-paul-xmas",
    userId: "user-paul",
    title: "Noël Tech 🎄",
    description: "Du matériel pour coder confortablement.",
    eventType: EventType.CHRISTMAS,
    eventDate: "2025-12-25T00:00:00.000Z",
    visibility: WishlistVisibility.FRIENDS,
    createdAt: "2025-11-15T09:00:00.000Z",
    updatedAt: NOW,
    gifts: [
      {
        id: "gift-paul-01",
        wishlistId: "wishlist-paul-xmas",
        title: "Clavier mécanique Keychron",
        estimatedPrice: 140,
        imageUrl:
          "https://images.unsplash.com/photo-1587829741301-dc798b91a91e?auto=format&fit=crop&w=800&q=80",
        status: GiftStatus.AVAILABLE,
        priority: GiftPriority.ESSENTIAL,
        publication: {
          isPublished: true,
        },
        createdAt: NOW,
        updatedAt: NOW,
      },
      {
        id: "gift-paul-02",
        wishlistId: "wishlist-paul-xmas",
        title: "Support laptop aluminium",
        estimatedPrice: 45,
        imageUrl:
          "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
        status: GiftStatus.PURCHASED,
        priority: GiftPriority.NICE,
        purchase: {
          userId: "user-kevine",
          purchasedAt: "2025-12-20T10:00:00.000Z",
        },
        publication: {
          isPublished: true,
        },
        createdAt: NOW,
        updatedAt: NOW,
      },
    ],
  },
  // ============================================================
  // 6. THOMAS — LISTE PUBLIQUE (OUVERTE À TOUS)
  // ============================================================
  {
    id: "wishlist-thomas-public",
    userId: "user-thomas",
    title: "Idées cadeaux – toute l’année",
    description: "Si un jour tu manques d’inspiration 😄",
    eventType: EventType.OTHER,
    visibility: WishlistVisibility.PUBLIC,
    createdAt: "2025-10-01T09:00:00.000Z",
    updatedAt: NOW,
    gifts: [
      {
        id: "gift-thomas-01",
        wishlistId: "wishlist-thomas-public",
        title: "Carte cadeau Librairie indépendante",
        estimatedPrice: 30,
        imageUrl:
          "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
        status: GiftStatus.AVAILABLE,
        priority: GiftPriority.OPTIONAL,
        publication: {
          isPublished: true,
        },
        createdAt: NOW,
        updatedAt: NOW,
      },
      {
        id: "gift-thomas-02",
        wishlistId: "wishlist-thomas-public",
        title: "Sweat éthique en coton bio",
        estimatedPrice: 75,
        imageUrl:
          "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
        status: GiftStatus.RESERVED,
        priority: GiftPriority.NICE,
        reservation: {
          userId: "user-anonymous-01",
          reservedAt: "2026-01-12T18:45:00.000Z",
        },
        publication: {
          isPublished: true,
        },
        createdAt: NOW,
        updatedAt: NOW,
      },
    ],
  },

  // ============================================================
  // 7. SOPHIE — WISHLIST VIDE (ÉTAT INITIAL)
  // ============================================================
  {
    id: "wishlist-sophie-empty",
    userId: "user-sophie",
    title: "À compléter plus tard",
    description: "Liste créée mais encore vide.",
    eventType: EventType.OTHER,
    visibility: WishlistVisibility.PRIVATE,
    createdAt: "2026-01-18T20:00:00.000Z",
    updatedAt: NOW,
    gifts: [],
  },

  // ============================================================
  // 8. PAUL — ÉVÉNEMENT PROFESSIONNEL
  // ============================================================
  {
    id: "wishlist-paul-conf",
    userId: "user-paul",
    title: "Conférence Dev 2026",
    description: "Préparer la conf sans exploser le budget.",
    eventType: EventType.OTHER,
    eventDate: "2026-06-10T08:00:00.000Z",
    visibility: WishlistVisibility.FRIENDS,
    allowedUsers: ["user-kevine", "user-thomas"],
    createdAt: "2026-01-05T11:00:00.000Z",
    updatedAt: NOW,
    gifts: [
      {
        id: "gift-paul-conf-01",
        wishlistId: "wishlist-paul-conf",
        title: "Sac à dos tech (laptop + matériel)",
        estimatedPrice: 120,
        imageUrl:
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
        status: GiftStatus.PURCHASED,
        priority: GiftPriority.ESSENTIAL,
        purchase: {
          userId: "user-paul", // auto-financé
          purchasedAt: "2026-01-07T09:30:00.000Z",
        },
        publication: {
          isPublished: true,
        },
        notes: "Achat anticipé pour usage pro.",
        createdAt: NOW,
        updatedAt: NOW,
      },
      {
        id: "gift-paul-conf-02",
        wishlistId: "wishlist-paul-conf",
        title: "Badge conférence (3 jours)",
        estimatedPrice: 450,
        imageUrl:
          "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=800&q=80",
        status: GiftStatus.ARCHIVED,
        priority: GiftPriority.ESSENTIAL,
        publication: {
          isPublished: false,
        },
        notes: "Pris en charge par l’entreprise.",
        createdAt: NOW,
        updatedAt: NOW,
      },
    ],
  },

  // ============================================================
  // 9. MARIE — LONG TERME (OBJECTIFS PERSONNELS)
  // ============================================================
  {
    id: "wishlist-marie-longterm",
    userId: "user-marie",
    title: "Objectifs long terme 🌱",
    description: "Des projets à réaliser sur plusieurs années.",
    eventType: EventType.OTHER,
    visibility: WishlistVisibility.FRIENDS,
    allowedUsers: ["user-thomas"],
    createdAt: "2025-06-01T09:00:00.000Z",
    updatedAt: NOW,
    gifts: [
      {
        id: "gift-marie-long-01",
        wishlistId: "wishlist-marie-longterm",
        title: "Formation photo avancée",
        estimatedPrice: 900,
        imageUrl:
          "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=800&q=80",
        status: GiftStatus.AVAILABLE,
        priority: GiftPriority.ESSENTIAL,
        publication: {
          isPublished: true,
        },
        notes: "Projet sérieux mais pas urgent.",
        createdAt: NOW,
        updatedAt: NOW,
      },
      {
        id: "gift-marie-long-02",
        wishlistId: "wishlist-marie-longterm",
        title: "Appareil photo hybride",
        estimatedPrice: 1800,
        imageUrl:
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
        status: GiftStatus.RESERVED,
        priority: GiftPriority.NICE,
        reservation: {
          userId: "user-thomas",
          reservedAt: "2026-01-22T21:15:00.000Z",
        },
        publication: {
          isPublished: true,
        },
        notes: "Cadeau envisagé à deux.",
        createdAt: NOW,
        updatedAt: NOW,
      },
    ],
  },
];
