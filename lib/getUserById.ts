import { MOCK_USERS } from "@/mocks/users.mock";
import { User } from "@/types/user";

/**
 * Récupère un utilisateur via son ID.
 * @param userId L'identifiant de l'utilisateur recherché
 * @returns L'objet User ou undefined si non trouvé
 */
export const getUserById = (userId: string): User | undefined => {
  return MOCK_USERS.find((user) => user.id === userId);
};
