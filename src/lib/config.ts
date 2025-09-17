// lib/config.ts

/**
 * Default values (local dev environment)
 */
const DEFAULT_API = "http://localhost:4000/api";
const DEFAULT_SOCKET = "http://localhost:4000";

/**
 * Helper: return env var or fallback
 */
const envOrDefault = (value: string | undefined, fallback: string) => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
};

/**
 * Helper: remove only trailing slash
 */
const stripTrailingSlash = (value: string) =>
  value.endsWith("/") ? value.slice(0, -1) : value;

/**
 * Final base URLs
 */
export const API_BASE_URL = stripTrailingSlash(
  envOrDefault(process.env.NEXT_PUBLIC_API_URL, DEFAULT_API)
);

export const SOCKET_BASE_URL = stripTrailingSlash(
  envOrDefault(process.env.NEXT_PUBLIC_SOCKET_URL, DEFAULT_SOCKET)
);

/**
 * API helper (ensures no duplicate slashes)
 */
export const apiUrl = (path: string) =>
  `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;

/**
 * Backend helper (for serving uploads/attachments)
 * Example: backendUrl("/uploads/file.png")
 */
export const backendUrl = (path: string) =>
  `${SOCKET_BASE_URL}/${path.replace(/^\/+/, "")}`;

/**
 * Debug log (only in dev)
 */
if (typeof window !== "undefined") {
  console.log("🔗 API_BASE_URL:", API_BASE_URL);
  console.log("🔗 SOCKET_BASE_URL:", SOCKET_BASE_URL);
}
