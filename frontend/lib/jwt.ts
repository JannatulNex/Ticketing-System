export type DecodedToken = { id?: number; role?: "ADMIN" | "CUSTOMER"; [k: string]: unknown };

export function decodeJwt(token?: string | null): DecodedToken | null {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
