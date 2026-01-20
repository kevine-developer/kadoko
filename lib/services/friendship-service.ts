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
};
