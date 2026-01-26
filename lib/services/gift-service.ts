import { authClient } from "@/features/auth";
import { getApiUrl } from "../api-config";

export const giftService = {
  // Récupérer un cadeau par son ID
  getGiftById: async (id: string) => {
    try {
      const response = await authClient.$fetch(getApiUrl(`/gifts/${id}`));
      return (response.data || {
        success: false,
        message: "Erreur",
      }) as unknown as {
        success: boolean;
        gift: any;
      };
    } catch (error) {
      console.error("Error getGiftById:", error);
      return { success: false, message: "Erreur réseau" };
    }
  },

  // Ajouter un cadeau à une liste
  addGift: async (wishlistId: string, data: any) => {
    try {
      const response = await authClient.$fetch(
        getApiUrl(`/gifts/${wishlistId}`),
        {
          method: "POST",
          body: data,
        },
      );
      return (response.data || {
        success: false,
        message: "Erreur",
      }) as unknown as {
        success: boolean;
        gift: any;
      };
    } catch (error) {
      console.error("Error addGift:", error);
      return { success: false, message: "Erreur d'ajout" };
    }
  },

  // Réserver un cadeau
  reserveGift: async (id: string) => {
    try {
      const response = await authClient.$fetch(getApiUrl(`/gifts/${id}`), {
        method: "PATCH",
        body: { action: "reserve" },
      });
      return (response.data || {
        success: false,
        message: "Erreur",
      }) as unknown as {
        success: boolean;
        gift: any;
      };
    } catch (error) {
      console.error("Error reserveGift:", error);
      return { success: false, message: "Erreur de réservation" };
    }
  },

  // Marquer comme acheté
  purchaseGift: async (id: string) => {
    try {
      const response = await authClient.$fetch(getApiUrl(`/gifts/${id}`), {
        method: "PATCH",
        body: { action: "purchase" },
      });
      return (response.data || {
        success: false,
        message: "Erreur",
      }) as unknown as {
        success: boolean;
        gift: any;
      };
    } catch (error) {
      console.error("Error purchaseGift:", error);
      return { success: false, message: "Erreur d'achat" };
    }
  },

  // Mettre à jour un cadeau
  updateGift: async (id: string, data: any) => {
    try {
      const response = await authClient.$fetch(getApiUrl(`/gifts/${id}`), {
        method: "PATCH",
        body: data,
      });
      return (response.data || {
        success: false,
        message: "Erreur",
      }) as unknown as {
        success: boolean;
        gift: any;
      };
    } catch (error) {
      console.error("Error updateGift:", error);
      return { success: false, message: "Erreur de mise à jour" };
    }
  },

  // Publier un cadeau
  publishGift: async (id: string) => {
    try {
      const response = await authClient.$fetch(getApiUrl(`/gifts/${id}`), {
        method: "PATCH",
        body: { action: "publish" },
      });
      return (response.data || {
        success: false,
        message: "Erreur",
      }) as unknown as {
        success: boolean;
        gift: any;
      };
    } catch (error) {
      console.error("Error publishGift:", error);
      return { success: false, message: "Erreur de publication" };
    }
  },

  // Dépublier un cadeau
  unpublishGift: async (id: string) => {
    try {
      const response = await authClient.$fetch(getApiUrl(`/gifts/${id}`), {
        method: "PATCH",
        body: { action: "unpublish" },
      });
      return (response.data || {
        success: false,
        message: "Erreur",
      }) as unknown as {
        success: boolean;
        gift: any;
      };
    } catch (error) {
      console.error("Error unpublishGift:", error);
      return { success: false, message: "Erreur de dépublication" };
    }
  },

  // Libérer un cadeau (annuler réservation)
  releaseGift: async (id: string) => {
    try {
      const response = await authClient.$fetch(getApiUrl(`/gifts/${id}`), {
        method: "PATCH",
        body: { action: "release" },
      });
      return (response.data || {
        success: false,
        message: "Erreur",
      }) as unknown as {
        success: boolean;
        gift: any;
      };
    } catch (error) {
      console.error("Error releaseGift:", error);
      return { success: false, message: "Erreur de libération" };
    }
  },

  // Confirmer la réception d'un cadeau
  confirmReceipt: async (id: string) => {
    try {
      const response = await authClient.$fetch(getApiUrl(`/gifts/${id}`), {
        method: "PATCH",
        body: { action: "receive" },
      });
      return (response.data || {
        success: false,
        message: "Erreur",
      }) as unknown as {
        success: boolean;
        gift: any;
      };
    } catch (error) {
      console.error("Error confirmReceipt:", error);
      return { success: false, message: "Erreur de confirmation" };
    }
  },

  // Supprimer un cadeau
  deleteGift: async (id: string) => {
    try {
      const response = await authClient.$fetch(getApiUrl(`/gifts/${id}`), {
        method: "DELETE",
      });
      return (response.data || {
        success: false,
        message: "Erreur",
      }) as unknown as { success: boolean; message: string };
    } catch (error) {
      console.error("Error deleteGift:", error);
      return { success: false, message: "Erreur de suppression" };
    }
  },

  // Récupérer le feed
  getFeed: async () => {
    try {
      const response = await authClient.$fetch(getApiUrl("/feed"));

      return (response.data || {
        success: false,
        inspirations: [],
        received: [],
      }) as unknown as {
        success: boolean;
        inspirations: any[];
        received: any[];
      };
    } catch (error) {
      console.error("Error getFeed:", error);
      return { success: false, inspirations: [], received: [] };
    }
  },

  // Récupérer mes réservations
  getMyReservations: async () => {
    try {
      const response = await authClient.$fetch(
        getApiUrl("/gifts/reservations/me"),
      );
      return (response.data || {
        success: false,
        gifts: [],
      }) as unknown as {
        success: boolean;
        gifts: any[];
      };
    } catch (error) {
      console.error("Error getMyReservations:", error);
      return { success: false, gifts: [] };
    }
  },
};
