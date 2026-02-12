import type { Context } from "hono";
import type { RateLimitResult } from "../types/api";

interface RateLimiterNamespace {
  idFromName(name: string): DurableObjectId;
  get(id: DurableObjectId): DurableObjectStub;
}

export async function enforceRateLimit(
  c: Context<{ Bindings: Env }>,
  key: string,
  limit: number,
  windowSec: number,
  reason: string
): Promise<RateLimitResult> {
  const namespace = c.env.RATE_LIMITER as unknown as RateLimiterNamespace;
  const id = namespace.idFromName(key);
  const stub = namespace.get(id);

  const response = await stub.fetch("http://rate-limit/check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ key, limit, windowSec, reason })
  });

  return (await response.json()) as RateLimitResult;
}

export function clientIp(c: Context): string {
  return c.req.header("CF-Connecting-IP") || "unknown";
}
