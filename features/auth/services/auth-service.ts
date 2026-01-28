import { authClient } from "./auth-client";
import type {
  SignUpRequest,
  SignInRequest,
  AuthResponse,
  UserPublic,
} from "../types/index";

/**
 * Service d'authentification utilisant Better Auth
 */
class AuthService {
  constructor() {
    console.log(
      "AuthService initialized with API URL:",
      process.env.EXPO_PUBLIC_API_URL,
    );
  }
  /**
   * Inscrit un nouvel utilisateur
   */
  async signUp(data: SignUpRequest): Promise<AuthResponse> {
    try {
      console.log("Tentative d'inscription avec les données:", {
        ...data,
        password: "***",
      });
      const response = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        image: data.image,
      });

      if (response.error) {
        return {
          success: false,
          message: response.error.message || "Erreur lors de l'inscription",
          error: response.error.status?.toString() || "SIGNUP_FAILED",
        } as AuthResponse;
      }

      return {
        success: true,
        message: "Inscription réussie !",
        user: response.data?.user as unknown as UserPublic | undefined,
      };
    } catch (error) {
      console.error("Erreur signup:", error);
      return {
        success: false,
        message: "Une erreur est survenue lors de l'inscription",
        error: "SIGNUP_FAILED",
      } as AuthResponse;
    }
  }

  /**
   * Connecte un utilisateur
   */
  async signIn(data: SignInRequest): Promise<AuthResponse> {
    try {
      const response = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (response.error) {
        // Extraire le code d'erreur depuis le message si disponible
        const errorCode =
          (response.error as any)?.code ||
          response.error.status?.toString() ||
          "SIGNIN_FAILED";
        return {
          success: false,
          message: response.error.message || "Email ou mot de passe incorrect",
          error: response.error.status?.toString() || "SIGNIN_FAILED",
          errorCode: errorCode,
        } as AuthResponse;
      }

      return {
        success: true,
        message: "Connexion réussie !",
        user: response.data?.user as unknown as UserPublic | undefined,
      };
    } catch (error) {
      console.error("Erreur signin détaillée:", error);
      if (error instanceof Error) {
        console.error("Message d'erreur:", error.message);
        console.error("Stack trace:", error.stack);
      }
      return {
        success: false,
        message: "Email ou mot de passe incorrect (Erreur Réseau)",
        error: "SIGNIN_FAILED",
      } as AuthResponse;
    }
  }

  /**
   * Connecte un utilisateur via un fournisseur social (Google, etc.)
   */
  async signInWithSocial(provider: "google" | "facebook"): Promise<void> {
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/(tabs)",
      });
    } catch (error) {
      console.error(`Erreur signin social (${provider}):`, error);
      throw error;
    }
  }

  /**
   * Déconnecte l'utilisateur
   */
  async signOut(): Promise<{ success: boolean; message: string }> {
    try {
      await authClient.signOut();
      return {
        success: true,
        message: "Déconnexion réussie",
      };
    } catch (error) {
      console.error("Erreur signout:", error);
      return {
        success: false,
        message: "Erreur lors de la déconnexion",
      };
    }
  }

  /**
   * Récupère la session actuelle
   */
  async getSession(): Promise<{
    success: boolean;
    user?: UserPublic;
    message?: string;
  }> {
    try {
      const session = await authClient.getSession();

      if (!session.data) {
        return {
          success: false,
          message: "Aucune session active",
        };
      }

      return {
        success: true,
        user: session.data.user as unknown as UserPublic,
      };
    } catch (error) {
      console.error("Erreur getSession:", error);
      return {
        success: false,
        message: "Erreur lors de la récupération de la session",
      };
    }
  }

  /**
   * Demande de réinitialisation de mot de passe
   */
  async forgotPassword(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // On appelle la route personnalisée du backend
      const response = (await authClient.$fetch("/forgot-password", {
        method: "POST",
        body: { email },
      })) as any;

      return {
        success: true,
        message: response.message || "Un code de vérification a été envoyé",
      };
    } catch (error) {
      console.error("Erreur forgotPassword:", error);
      return {
        success: false,
        message: "Une erreur est survenue lors de la demande",
      };
    }
  }

  /**
   * Réinitialiser le mot de passe avec le code OTP
   */
  async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = (await authClient.$fetch("/reset-password", {
        method: "POST",
        body: { email, otp, newPassword },
      })) as any;

      return {
        success: true,
        message: response.message || "Mot de passe réinitialisé avec succès",
      };
    } catch (error) {
      console.error("Erreur resetPassword:", error);
      return {
        success: false,
        message: "Code invalide ou expiré",
      };
    }
  }
}

export const authService = new AuthService();
