export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Helper to get the full API URL for a given path.
 * Ensures we don't double-slash or miss /api if needed.
 * By default, assumes paths passed in act as absolute paths from API root if they start with slash.
 * But since our server mounts at /api/..., we should include that.
 */
export const getApiUrl = (path: string) => {
  const baseUrl = API_URL.replace(/\/$/, ""); // Remove trailing slash
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // If the path already includes /api, just append
  if (cleanPath.startsWith("/api")) {
    return `${baseUrl}${cleanPath}`;
  }

  // Otherwise default to prepending /api
  return `${baseUrl}/api${cleanPath}`;
};
