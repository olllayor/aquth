interface Bucket {
  count: number;
  resetAt: number;
}

interface RateLimitRequest {
  key: string;
  limit: number;
  windowSec: number;
  reason?: string;
}

export class RateLimiterDO implements DurableObject {
  constructor(private readonly state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("method not allowed", { status: 405 });
    }

    const body = (await request.json()) as RateLimitRequest;
    const now = Date.now();
    const storageKey = `rl:${body.key}:${body.reason ?? "default"}`;
    const existing = (await this.state.storage.get<Bucket>(storageKey)) ?? null;

    let bucket = existing;
    if (!bucket || bucket.resetAt <= now) {
      bucket = {
        count: 0,
        resetAt: now + body.windowSec * 1000
      };
    }

    if (bucket.count >= body.limit) {
      const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      return Response.json({
        allowed: false,
        retryAfterSec,
        reason: body.reason ?? "rate_limited"
      });
    }

    bucket.count += 1;

    await this.state.storage.put(storageKey, bucket);

    return Response.json({ allowed: true });
  }
}
