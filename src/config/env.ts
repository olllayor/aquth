import { z } from "zod";

const envSchema = z.object({
  AUTH_ISSUER: z.string().url(),
  AUTH_AUDIENCE: z.string().min(1),
  BASE_URL: z.string().url(),
  AUTH_PRIVATE_JWK: z.string().min(1),
  AUTH_PUBLIC_JWK: z.string().min(1),
  AUTH_KEY_ID: z.string().min(1).optional(),
  TX_SIGNING_SECRET: z.string().min(32),
  TX_COOKIE_NAME: z.string().default("__Host-2loc_tx"),
  TX_TTL_SECONDS: z.coerce.number().int().positive().default(600),
  JWT_TTL_SECONDS: z.coerce.number().int().positive().default(120),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  BLOCKLIST_DOMAINS: z.string().optional()
});

export type AppConfig = z.infer<typeof envSchema>;

export function getConfig(env: unknown): AppConfig {
  return envSchema.parse(env);
}
