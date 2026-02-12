interface Env {
  AUTH_ISSUER: string;
  AUTH_AUDIENCE: string;
  BASE_URL: string;
  AUTH_PRIVATE_JWK: string;
  AUTH_PUBLIC_JWK: string;
  AUTH_KEY_ID?: string;
  TX_SIGNING_SECRET: string;
  TX_COOKIE_NAME: string;
  TX_TTL_SECONDS: string;
  JWT_TTL_SECONDS: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  TURNSTILE_SECRET_KEY?: string;
  BLOCKLIST_DOMAINS?: string;
  RATE_LIMITER: DurableObjectNamespace;
}
