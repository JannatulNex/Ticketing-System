const DEFAULT_API = "http://localhost:4000/api";
const DEFAULT_SOCKET = DEFAULT_API.replace(/\/api$/, "");

const envOrDefault = (value: string | undefined, fallback: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
};

const stripTrailingSlash = (value: string) => value.replace(/\/?$/, "");

export const API_BASE_URL = stripTrailingSlash(envOrDefault(process.env.NEXT_PUBLIC_API_URL, DEFAULT_API));
export const SOCKET_BASE_URL = stripTrailingSlash(envOrDefault(process.env.NEXT_PUBLIC_SOCKET_URL, DEFAULT_SOCKET));

export const apiUrl = (path: string) => `${API_BASE_URL}/${path.replace(/^\/+/,'')}`;
export const backendUrl = (path: string) => `${SOCKET_BASE_URL}/${path.replace(/^\/+/,'')}`;
