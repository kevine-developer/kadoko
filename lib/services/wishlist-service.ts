import { authClient } from "@/features/auth";
import { getApiUrl } from "../api-config";

export const wishlistService = {
  // Récupérer toutes les listes de l'utilisateur
  getMyWishlists: async () => {
    try {
      const response = await authClient.$fetch(getApiUrl("/wishlists"));
      return (response.data || {
        success: false,
        wishlists: [],
        message: "Erreur",
      }) as unknown as {
        success: boolean;
        wishlists: any[];
        message?: string;
      };
    } catch (error) {
      console.error("Error getMyWishlists:", error);
      return { success: false, wishlists: [] };
    }
  },

  // Récupérer le détail d'une liste
  getWishlistById: async (id: string) => {
    try {
      const response = await authClient.$fetch(getApiUrl(`/wishlists/${id}`));
      return (response.data || {
        success: false,
        wishlist: null,
        message: "Erreur",
      }) as unknown as {
        success: boolean;
        wishlist: any;
        message?: string;
      };
    } catch (error) {
      console.error("Error getWishlistById:", error);
      return { success: false, wishlist: null };
    }
  },

  // Récupérer les listes d'un utilisateur spécifique
  getUserWishlists: async (userId: string) => {
    try {
      const response = await authClient.$fetch(
        getApiUrl(`/wishlists/user/${userId}`),
      );
      return (response.data || {
        success: false,
        wishlists: [],
      }) as unknown as {
        success: boolean;
        wishlists: any[];
        message?: string;
      };
    } catch (error) {
      console.error("Error getUserWishlists:", error);
      return { success: false, wishlists: [] };
    }
  },

  // Créer une liste
  createWishlist: async (data: {
    title: string;
    description?: string;
    eventDate?: Date | null;
    visibility?: string;
    eventType?: string;
  }) => {
    try {
      const response = await authClient.$fetch(getApiUrl("/wishlists"), {
        method: "POST",
        body: data,
      });
      return (response.data || {
        success: false,
        message: "Erreur de création",
      }) as unknown as { success: boolean; wishlist?: any; message?: string };
    } catch (error) {
      console.error("Error createWishlist:", error);
      return { success: false, message: "Erreur de création" };
    }
  },

  // Mettre à jour une liste
  updateWishlist: async (
    id: string,
    data: {
      title?: string;
      description?: string;
      eventDate?: string | Date | null;
      visibility?: string;
      eventType?: string;
    },
  ) => {
    try {
      const response = await authClient.$fetch(getApiUrl(`/wishlists/${id}`), {
        method: "PATCH",
        body: data,
      });
      return (response.data || {
        success: false,
        message: "Erreur",
      }) as unknown as {
        success: boolean;
        wishlist?: any;
        message?: string;
      };
    } catch (error) {
      console.error("Error updateWishlist:", error);
      return { success: false, message: "Erreur de mise à jour" };
    }
  },

  // Supprimer une liste
  deleteWishlist: async (id: string) => {
    try {
      const response = await authClient.$fetch(getApiUrl(`/wishlists/${id}`), {
        method: "DELETE",
      });
      return (response.data || {
        success: false,
        message: "Erreur",
      }) as unknown as { success: boolean; message: string };
    } catch (error) {
      console.error("Error deleteWishlist:", error);
      return { success: false, message: "Erreur de suppression" };
    }
  },
};
