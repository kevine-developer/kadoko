import { authClient } from "../auth/auth-client";

export const wishlistService = {
  // Récupérer toutes les listes de l'utilisateur
  getMyWishlists: async () => {
    try {
      const response = await authClient.$fetch("/wishlists");
      return response as unknown as { success: boolean; wishlists: any[] };
    } catch (error) {
      console.error("Error getMyWishlists:", error);
      return { success: false, wishlists: [] };
    }
  },

  // Récupérer le détail d'une liste
  getWishlistById: async (id: string) => {
    try {
      const response = await authClient.$fetch(`/wishlists/${id}`);
      return response as unknown as { success: boolean; wishlist: any };
    } catch (error) {
      console.error("Error getWishlistById:", error);
      return { success: false, wishlist: null };
    }
  },

  // Créer une liste
  createWishlist: async (data: {
    title: string;
    description?: string;
    eventDate?: string;
    visibility?: string;
  }) => {
    try {
      const response = await authClient.$fetch("/wishlists", {
        method: "POST",
        body: data,
      });
      return response as unknown as { success: boolean; wishlist: any };
    } catch (error) {
      console.error("Error createWishlist:", error);
      return { success: false, message: "Erreur de création" };
    }
  },

  // Supprimer une liste
  deleteWishlist: async (id: string) => {
    try {
      const response = await authClient.$fetch(`/wishlists/${id}`, {
        method: "DELETE",
      });
      return response as unknown as { success: boolean; message: string };
    } catch (error) {
      console.error("Error deleteWishlist:", error);
      return { success: false, message: "Erreur de suppression" };
    }
  },
};
