class MockDurableObjectStub {
  constructor(private readonly blockedKeys: Set<string>, private readonly key: string) {}

  async fetch(_url: string, init?: RequestInit): Promise<Response> {
    const body = JSON.parse(String(init?.body ?? "{}")) as { reason?: string };
    const composite = `${this.key}:${body.reason ?? "default"}`;

    if (this.blockedKeys.has(composite) || this.blockedKeys.has(this.key)) {
      return Response.json({ allowed: false, retryAfterSec: 30, reason: "rate_limited" });
    }

    return Response.json({ allowed: true });
  }
}

class MockDurableObjectNamespace {
  constructor(private readonly blockedKeys: Set<string>) {}

  idFromName(name: string): DurableObjectId {
    return name as unknown as DurableObjectId;
  }

  get(id: DurableObjectId): DurableObjectStub {
    const key = id as unknown as string;
    return new MockDurableObjectStub(this.blockedKeys, key) as unknown as DurableObjectStub;
  }
}

export function buildTestEnv(overrides: Partial<Env> = {}, blocked: string[] = []): Env {
  return {
    AUTH_ISSUER: "https://2loc.test",
    AUTH_AUDIENCE: "2loc-auth",
    BASE_URL: "https://2loc.test",
    AUTH_PRIVATE_JWK: '{"kty":"EC","crv":"P-256","x":"f83OJ3D2xF4m8IHxM7m9Vn0kGugHgdGXNq35p_MxN1M","y":"x_FEzRu9mYJ7fH8XIv2qxGn8pY-_bexdFvkbFr5jBqQ","d":"jpsQnnH8j6xP2L0N4xk2fA6x9Q4fYJVo9zc3rroWAtE"}',
    AUTH_PUBLIC_JWK: '{"kty":"EC","crv":"P-256","x":"f83OJ3D2xF4m8IHxM7m9Vn0kGugHgdGXNq35p_MxN1M","y":"x_FEzRu9mYJ7fH8XIv2qxGn8pY-_bexdFvkbFr5jBqQ"}',
    AUTH_KEY_ID: "2loc-test",
    TX_SIGNING_SECRET: "this-is-a-long-test-secret-with-over-32-chars",
    TX_COOKIE_NAME: "__Host-2loc_tx",
    TX_TTL_SECONDS: "600",
    JWT_TTL_SECONDS: "120",
    GOOGLE_CLIENT_ID: "google-client-id",
    GOOGLE_CLIENT_SECRET: "google-client-secret",
    GITHUB_CLIENT_ID: "github-client-id",
    GITHUB_CLIENT_SECRET: "github-client-secret",
    RATE_LIMITER: new MockDurableObjectNamespace(new Set(blocked)) as unknown as DurableObjectNamespace,
    ...overrides
  };
}
