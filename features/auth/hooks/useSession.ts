import { authClient } from "../services/auth-client";
import type { UserPublic } from "../types";

/**
 * Hook spécialisé pour récupérer la session et l'utilisateur typé
 */
export const useSession = () => {
  const { data, isPending, error, refetch } = authClient.useSession();

  return {
    session: data,
    user: data?.user as unknown as UserPublic | undefined,
    isLoading: isPending,
    error,
    refetch,
  };
};
