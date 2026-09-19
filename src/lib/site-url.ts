import { headers } from "next/headers";

/**
 * Absolute origin for OpenGraph URLs. NEXT_PUBLIC_SITE_URL wins when set;
 * otherwise it is derived from the request so tunnels (ngrok, etc.) just work.
 */
export async function getBaseUrl(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv;

  const h = await headers();
  const forwardedHost = h.get("x-forwarded-host");
  const host = forwardedHost ?? h.get("host");
  if (!host) return "http://localhost:3000";

  const proto = h.get("x-forwarded-proto") ?? (forwardedHost ? "https" : "http");
  return `${proto}://${host}`;
}
