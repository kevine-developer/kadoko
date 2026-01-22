import { authClient } from "../services/auth-client";

/**
 * Hook pour accéder aux fonctionnalités d'authentification de Better Auth
 */
export const useAuth = () => {
  return {
    signIn: authClient.signIn,
    signUp: authClient.signUp,
    signOut: authClient.signOut,
    useSession: authClient.useSession,
  };
};
