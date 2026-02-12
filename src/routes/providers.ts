import type { Context } from "hono";
import type { ProviderInfo } from "../types/api";

const PROVIDERS: ProviderInfo[] = [
  { id: "google", name: "Google" },
  { id: "github", name: "GitHub" }
];

export function providersRoute(c: Context): Response {
  return c.json({ providers: PROVIDERS });
}
