import { authClient } from "../auth/auth-client";
import { getApiUrl } from "../api-config";

export const userService = {
  // Récupérer le profil complet de l'utilisateur connecté
  getMe: async () => {
    try {
      const response = await authClient.$fetch(getApiUrl("/auth/users/me"));
      return (response.data || { success: false, user: null }) as unknown as {
        success: boolean;
        user: any;
      };
    } catch (error) {
      console.error("Error getMe:", error);
      return { success: false, user: null };
    }
  },

  // Récupérer le profil public d' un utilisateur
  getUserById: async (id: string) => {
    try {
      const response = await authClient.$fetch(getApiUrl(`/auth/users/${id}`));
      return (response.data || { success: false, user: null }) as unknown as {
        success: boolean;
        user: any;
      };
    } catch (error) {
      console.error("Error getUserById:", error);
      return { success: false, user: null };
    }
  },

  // Rechercher des utilisateurs
  searchUsers: async (query: string) => {
    try {
      const response = await authClient.$fetch(
        getApiUrl(`/auth/users/search?q=${encodeURIComponent(query)}`),
      );
      console.log("Search response:", response);

      if (response && response.data) {
        return response.data as unknown as { success: boolean; users: any[] };
      }

      if (response && response.error) {
        console.error("Search error:", response.error);
      }

      return { success: false, users: [] };
    } catch (error) {
      console.error("Error searchUsers:", error);
      return { success: false, users: [] };
    }
  },

  // Mettre à jour le profil de l'utilisateur connecté
  updateProfile: async (data: {
    name?: string;
    username?: string;
    description?: string;
    avatarUrl?: string;
    coverUrl?: string;
    isPublic?: boolean;
  }) => {
    try {
      const response = await authClient.$fetch(getApiUrl("/auth/users/me"), {
        method: "PUT",
        body: data,
      });
      return (response.data || {
        success: false,
        message: "Erreur",
        user: null,
      }) as unknown as {
        success: boolean;
        message: string;
        user: any;
      };
    } catch (error) {
      console.error("Error updateProfile:", error);
      return { success: false, message: "Erreur de mise à jour", user: null };
    }
  },
};
