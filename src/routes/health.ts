import type { Context } from "hono";

export function healthRoute(c: Context): Response {
  return c.json({ status: "ok" });
}
