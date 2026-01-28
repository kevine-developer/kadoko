import { authClient } from "@/features/auth";
import { getApiUrl } from "../api-config";

// ============================================
// TYPES
// ============================================

export interface PrivateInfo {
  clothing?: {
    topSize?: string;
    bottomSize?: string;
    shoeSize?: string;
  };
  jewelry?: {
    ringSize?: string;
    preference?: "GOLD" | "SILVER" | "BOTH" | "NONE";
  };
  diet?: {
    allergies?: string[];
    preferences?: string[];
  };
  delivery?: {
    type?: "HOME" | "RELAY" | "OFFICE";
    address?: {
      street?: string;
      city?: string;
      postalCode?: string;
      country?: string;
      additionalInfo?: string;
    };
    relayName?: string;
    instructions?: string;
  };
}

// ============================================
// HELPERS
// ============================================

export const userService = {
  // Récupérer le profil complet de l'utilisateur connecté
  getMe: async () => {
    try {
      const response = await authClient.$fetch(getApiUrl("/users/me"));
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
      const response = await authClient.$fetch(getApiUrl(`/users/${id}`));
      return (response.data || { success: false, user: null }) as unknown as {
        success: boolean;
        user: any;
      };
    } catch (error) {
      console.error("Error getUserById:", error);
      return { success: false, user: null };
    }
  },

  // Récupérer un profil par username (Pour Deep Link)
  getUserByUsername: async (username: string) => {
    try {
      const response = await authClient.$fetch(
        getApiUrl(`/users/profile/${username}`),
      );
      return (response.data || { success: false, user: null }) as unknown as {
        success: boolean;
        user: any;
      };
    } catch (error) {
      console.error("Error getUserByUsername:", error);
      return { success: false, user: null };
    }
  },

  // Rechercher des utilisateurs
  searchUsers: async (query: string) => {
    try {
      const response = await authClient.$fetch(
        getApiUrl(`/users/search?q=${encodeURIComponent(query)}`),
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

  // Vérifier la disponibilité d'un nom d'utilisateur
  checkUsernameAvailability: async (username: string) => {
    try {
      const response = await authClient.$fetch(
        getApiUrl(
          `/users/check-availability?username=${encodeURIComponent(username)}`,
        ),
      );
      return (response.data || {
        success: false,
        available: false,
      }) as unknown as {
        success: boolean;
        available: boolean;
        error?: string;
      };
    } catch (error) {
      console.error("Error checkUsernameAvailability:", error);
      return { success: false, available: false };
    }
  },

  // Récupérer des suggestions de noms d'utilisateur
  getUsernameSuggestions: async (username: string) => {
    try {
      const response = await authClient.$fetch(
        getApiUrl(
          `/users/suggestions?username=${encodeURIComponent(username)}`,
        ),
      );
      return (response.data || {
        success: false,
        suggestions: [],
      }) as unknown as {
        success: boolean;
        suggestions: string[];
      };
    } catch (error) {
      console.error("Error getUsernameSuggestions:", error);
      return { success: false, suggestions: [] };
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
    socialLinks?: any;
    preferences?: any;
  }) => {
    try {
      const response = await authClient.$fetch(getApiUrl("/users/me"), {
        method: "PATCH",
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

  // Supprimer mon propre compte
  deleteAccount: async (data: { password: string; otp?: string }) => {
    try {
      const response = await authClient.$fetch(getApiUrl("/users/me"), {
        method: "DELETE",
        body: data,
      });
      return (response.data || {
        success: false,
        message: "Erreur",
      }) as unknown as {
        success: boolean;
        message: string;
      };
    } catch (error) {
      console.error("Error deleteAccount:", error);
      return { success: false, message: "Erreur lors de la suppression" };
    }
  },

  // Mettre à jour les informations privées
  updatePrivateInfo: async (data: PrivateInfo) => {
    try {
      const response = await authClient.$fetch(
        getApiUrl("/auth/users/me/private-info"),
        {
          method: "PATCH",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      return (response.data || { success: false }) as unknown as {
        success: boolean;
        privateInfo?: PrivateInfo;
      };
    } catch (error) {
      console.error("Error updatePrivateInfo:", error);
      return { success: false };
    }
  },

  // Mettre à jour les informations privées d'un utilisateur (si ami)
  getPrivateInfo: async (userId: string) => {
    try {
      const response = await authClient.$fetch(
        getApiUrl(`/auth/users/${userId}`),
      );
      return (response.data || {
        success: false,
        privateInfo: null,
      }) as unknown as {
        success: boolean;
        user?: any;
      };
    } catch (error) {
      console.error("Error getPrivateInfo:", error);
      return { success: false, privateInfo: null };
    }
  },

  // Gestion des blocs
  getBlockedUsers: async () => {
    try {
      const response = await authClient.$fetch(
        getApiUrl("/auth/users/me/blocks"),
      );
      return (response.data || { success: false, users: [] }) as unknown as {
        success: boolean;
        users: any[];
      };
    } catch (error) {
      console.error("Error getBlockedUsers:", error);
      return { success: false, users: [] };
    }
  },

  blockUser: async (targetId: string) => {
    try {
      const response = await authClient.$fetch(
        getApiUrl(`/auth/users/block/${targetId}`),
        {
          method: "POST",
        },
      );
      return (response.data || { success: false }) as any;
    } catch (error) {
      console.error("Error blockUser:", error);
      return { success: false };
    }
  },

  unblockUser: async (targetId: string) => {
    try {
      const response = await authClient.$fetch(
        getApiUrl(`/auth/users/block/${targetId}`),
        {
          method: "DELETE",
        },
      );
      return (response.data || { success: false }) as any;
    } catch (error) {
      console.error("Error unblockUser:", error);
      return { success: false };
    }
  },

  // Gestion des sessions
  getSessions: async () => {
    try {
      const url = getApiUrl("/user-sessions");
      console.log(`[UserService] Appel getSessions sur: ${url}`);
      const response = await authClient.$fetch(url);
      console.log(
        "[UserService] Réponse getSessions:",
        JSON.stringify(response.data),
      );

      return (response.data || { success: false, sessions: [] }) as unknown as {
        success: boolean;
        sessions: any[];
      };
    } catch (error) {
      console.error("Error getSessions:", error);
      return { success: false, sessions: [] };
    }
  },

  revokeSession: async (id: string) => {
    try {
      const response = await authClient.$fetch(
        getApiUrl(`/user-sessions/${id}`),
        {
          method: "DELETE",
        },
      );
      return (response.data || { success: false }) as any;
    } catch (error) {
      console.error("Error revokeSession:", error);
      return { success: false };
    }
  },
};
