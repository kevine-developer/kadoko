// ============================================
// Types de Requêtes d'Authentification
// ============================================

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  username?: string;
  image?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

// ============================================
// Types de Réponses d'Authentification
// ============================================

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: UserPublic;
  sessionId?: string;
  error?: string;
  errorCode?: string; // Code d'erreur spécifique (ex: ACCOUNT_DELETION_IN_PROGRESS)
}

export interface AuthErrorResponse {
  success: false;
  error: string;
  message: string;
}

// ============================================
// Types Utilisateur Publics
// ============================================

export type UserRole = "USER" | "ADMIN";

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  username?: string | null;
  image?: string | null;
  description?: string | null;
  coverUrl?: string | null;
  isPublic: boolean;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  hasPassword?: boolean;
}

// ============================================
// Type Guards
// ============================================

export function isAuthErrorResponse(
  response: AuthResponse | AuthErrorResponse,
): response is AuthErrorResponse {
  return !response.success && "error" in response;
}
