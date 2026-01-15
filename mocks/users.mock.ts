import { User, UserRole } from "@/types/user";

const NOW = new Date().toISOString();

export const MOCK_USERS: User[] = [
  // ==================================================
  // 1. KEVINE — UTILISATRICE CENTRALE
  // ==================================================
  {
    id: "user-kevine",
    username: "kevine_dev",
    fullName: "Kevine Dev",
    email: "kevine@email.com",
    avatarUrl:
      "https://storage.googleapis.com/creatorspace-public/users%2Fclv4nmj6e008zmy01ocx0yx1q%2F35CVYq7wgsOhVkur-1000007286.png",
    description: "Fan de surprises et d'idées bien pensées ✨",
    role: UserRole.USER,

    friends: ["user-paul", "user-marie", "user-sophie"],
    wishlists: ["wishlist-kevine-birthday", "wishlist-kevine-private"],

    reservedGifts: [
      {
        giftId: "gift-marie-01",
        reservedAt: "2026-01-20T10:00:00.000Z",
      },
    ],

    purchasedGifts: [
      {
        giftId: "gift-paul-02",
        purchasedAt: "2025-12-20T10:00:00.000Z",
      },
    ],

    createdAt: "2025-10-15T09:12:00.000Z",
    updatedAt: NOW,
  },

  // ==================================================
  // 2. PAUL — UTILISATEUR ACTIF / ORGANISÉ
  // ==================================================
  {
    id: "user-paul",
    username: "polo_d",
    fullName: "Paul Durand",
    email: "paul@email.com",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    description: "Tech enthusiast, pragmatique 🎧",
    role: UserRole.USER,

    friends: ["user-kevine", "user-marie"],
    wishlists: ["wishlist-paul-xmas", "wishlist-paul-conf"],

    reservedGifts: [
      {
        giftId: "gift-kevine-01",
        reservedAt: "2026-01-05T12:00:00.000Z",
      },
    ],

    purchasedGifts: [
      {
        giftId: "gift-marie-02",
        purchasedAt: "2026-01-25T14:00:00.000Z",
      },
      {
        giftId: "gift-paul-conf-01", // auto-achat pro
        purchasedAt: "2026-01-07T09:30:00.000Z",
      },
    ],

    createdAt: "2025-11-01T14:30:00.000Z",
    updatedAt: NOW,
  },

  // ==================================================
  // 3. MARIE — UTILISATRICE STRUCTURÉE / LONG TERME
  // ==================================================
  {
    id: "user-marie",
    username: "marie_lf",
    fullName: "Marie Lefèvre",
    email: "marie@email.com",
    avatarUrl: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c",
    description: "Organisation, déco et projets durables 🌿",
    role: UserRole.USER,

    friends: ["user-kevine", "user-paul", "user-thomas"],
    wishlists: ["wishlist-marie-house", "wishlist-marie-longterm"],

    reservedGifts: [
      {
        giftId: "gift-kevine-04",
        reservedAt: "2026-01-10T09:00:00.000Z",
      },
    ],

    purchasedGifts: [],

    createdAt: "2025-11-03T10:00:00.000Z",
    updatedAt: NOW,
  },

  // ==================================================
  // 4. SOPHIE — UTILISATRICE MOBILE / PEU DE LISTES
  // ==================================================
  {
    id: "user-sophie",
    username: "so_travel",
    fullName: "Sophie Bernard",
    email: "sophie@email.com",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    description: "Toujours entre deux destinations ✈️",
    role: UserRole.USER,

    friends: ["user-kevine"],
    wishlists: ["wishlist-sophie-japan", "wishlist-sophie-empty"],

    reservedGifts: [],

    purchasedGifts: [
      {
        giftId: "gift-kevine-02",
        purchasedAt: "2026-01-08T15:30:00.000Z",
      },
    ],

    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: NOW,
  },

  // ==================================================
  // 5. THOMAS — UTILISATEUR PASSIF / OBSERVATEUR
  // ==================================================
  {
    id: "user-thomas",
    username: "tom_tom",
    fullName: "Thomas Petit",
    email: "thomas@email.com",
    avatarUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
    description: "Plutôt discret, mais fiable.",
    role: UserRole.USER,

    friends: ["user-marie"],
    wishlists: ["wishlist-thomas-public"],

    reservedGifts: [
      {
        giftId: "gift-marie-long-02",
        reservedAt: "2026-01-22T21:15:00.000Z",
      },
    ],

    purchasedGifts: [],

    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: NOW,
  },
];
