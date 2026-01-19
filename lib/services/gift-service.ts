import { authClient } from "../auth/auth-client";

export const giftService = {
  // Récupérer un cadeau par son ID
  getGiftById: async (id: string) => {
    try {
      const response = await authClient.$fetch(`/gifts/${id}`);
      return response as unknown as { success: boolean; gift: any };
    } catch (error) {
      console.error("Error getGiftById:", error);
      return { success: false, message: "Erreur réseau" };
    }
  },

  // Ajouter un cadeau à une liste
  addGift: async (wishlistId: string, data: any) => {
    try {
      const response = await authClient.$fetch(`/gifts/${wishlistId}`, {
        method: "POST",
        body: data,
      });
      return response as unknown as { success: boolean; gift: any };
    } catch (error) {
      console.error("Error addGift:", error);
      return { success: false, message: "Erreur d'ajout" };
    }
  },

  // Réserver un cadeau
  reserveGift: async (id: string) => {
    try {
      const response = await authClient.$fetch(`/gifts/${id}`, {
        method: "PUT",
        body: { action: "reserve" },
      });
      return response as unknown as { success: boolean; gift: any };
    } catch (error) {
      console.error("Error reserveGift:", error);
      return { success: false, message: "Erreur de réservation" };
    }
  },

  // Marquer comme acheté
  purchaseGift: async (id: string) => {
    try {
      const response = await authClient.$fetch(`/gifts/${id}`, {
        method: "PUT",
        body: { action: "purchase" },
      });
      return response as unknown as { success: boolean; gift: any };
    } catch (error) {
      console.error("Error purchaseGift:", error);
      return { success: false, message: "Erreur d'achat" };
    }
  },

  // Supprimer un cadeau
  deleteGift: async (id: string) => {
    try {
      const response = await authClient.$fetch(`/gifts/${id}`, {
        method: "DELETE",
      });
      return response as unknown as { success: boolean; message: string };
    } catch (error) {
      console.error("Error deleteGift:", error);
      return { success: false, message: "Erreur de suppression" };
    }
  },

  // Récupérer le feed
  getFeed: async () => {
    try {
      const response = await authClient.$fetch("/feed");
      return response as unknown as {
        success: boolean;
        inspirations: any[];
        circles: any[];
      };
    } catch (error) {
      console.error("Error getFeed:", error);
      return { success: false, inspirations: [], circles: [] };
    }
  },
};
