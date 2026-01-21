import { authClient } from "../auth/auth-client";
import { getApiUrl } from "../api-config";

export const friendshipService = {
  /**
   * Récupérer mes amis et mes demandes
   */
  getMyFriendships: async () => {
    try {
      const response = await authClient.$fetch(getApiUrl("/friendships/me"));
      return (response.data || {
        success: false,
        friends: [],
        requestsReceived: [],
        requestsSent: [],
      }) as unknown as {
        success: boolean;
        friends: any[];
        requestsReceived: any[];
        requestsSent: any[];
      };
    } catch (error) {
      console.error("Error getMyFriendships:", error);
      return {
        success: false,
        friends: [],
        requestsReceived: [],
        requestsSent: [],
      };
    }
  },

  /**
   * Envoyer une demande d'ami
   */
  sendRequest: async (userId: string) => {
    try {
      const response = await authClient.$fetch(
        getApiUrl(`/friendships/request/${userId}`),
        {
          method: "POST",
        },
      );
      return (response.data || { success: false, message: "Erreur" }) as any;
    } catch (error) {
      console.error("Error sendRequest:", error);
      return { success: false, message: "Erreur réseau" };
    }
  },

  /**
   * Accepter une demande d'ami
   */
  acceptRequest: async (friendshipId: string) => {
    try {
      const response = await authClient.$fetch(
        getApiUrl(`/friendships/accept/${friendshipId}`),
        {
          method: "POST",
        },
      );
      return (response.data || { success: false, message: "Erreur" }) as any;
    } catch (error) {
      console.error("Error acceptRequest:", error);
      return { success: false, message: "Erreur réseau" };
    }
  },

  /**
   * Annuler une demande d'ami envoyée (via l'ID de l'utilisateur destinataire)
   */
  cancelRequest: async (userId: string) => {
    try {
      const friendshipsRes = await friendshipService.getMyFriendships();
      if (!friendshipsRes.success) return friendshipsRes;

      const request = friendshipsRes.requestsSent.find(
        (r: any) => r.receiverId === userId || r.id === userId,
      );
      if (!request) return { success: false, message: "Demande non trouvée" };

      return await friendshipService.removeFriendship(request.friendshipId);
    } catch (error) {
      console.error("Error cancelRequest:", error);
      return { success: false, message: "Erreur réseau" };
    }
  },

  /**
   * Supprimer une amitié ou refuser une demande
   */
  removeFriendship: async (friendshipId: string) => {
    try {
      const response = await authClient.$fetch(
        getApiUrl(`/friendships/${friendshipId}`),
        {
          method: "DELETE",
        },
      );
      return (response.data || { success: false, message: "Erreur" }) as any;
    } catch (error) {
      console.error("Error removeFriendship:", error);
      return { success: false, message: "Erreur réseau" };
    }
  },

  /**
   * Récupérer les cadeaux réservés par moi pour un ami spécifique
   */
  getFriendReservations: async (friendId: string) => {
    try {
      const response = await authClient.$fetch(
        getApiUrl(`/friendships/reservations/${friendId}`),
      );
      return (response.data || { success: false, gifts: [] }) as unknown as {
        success: boolean;
        gifts: any[];
      };
    } catch (error) {
      console.error("Error getFriendReservations:", error);
      return { success: false, gifts: [] };
    }
  },
};
