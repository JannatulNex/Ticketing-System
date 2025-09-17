const DEFAULT_API = "http://localhost:4000/api";
const DEFAULT_SOCKET = DEFAULT_API.replace(/\/api$/, "");

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API).replace(/\/?$/, "");
export const SOCKET_BASE_URL = (process.env.NEXT_PUBLIC_SOCKET_URL ?? DEFAULT_SOCKET).replace(/\/?$/, "");

export const apiUrl = (path: string) => `${API_BASE_URL}/${path.replace(/^\/+/,'')}`;
export const backendUrl = (path: string) => `${SOCKET_BASE_URL}/${path.replace(/^\/+/,'')}`;
