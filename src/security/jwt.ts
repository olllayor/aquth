import { exportJWK, importJWK, SignJWT } from "jose";
import type { AppConfig } from "../config/env";
import type { AuthTokenClaims } from "../types/claims";

export interface JwtSigner {
  sign(claims: Omit<AuthTokenClaims, "iat" | "exp" | "jti">): Promise<string>;
  getJwks(): Promise<{ keys: Record<string, unknown>[] }>;
}

export async function createJwtSigner(config: AppConfig): Promise<JwtSigner> {
  const privateJwk = JSON.parse(config.AUTH_PRIVATE_JWK) as { kid?: string } & Record<string, unknown>;
  const publicJwk = JSON.parse(config.AUTH_PUBLIC_JWK) as { kid?: string } & Record<string, unknown>;

  const privateKey = await importJWK(privateJwk as any, "ES256");
  const publicKey = await importJWK(publicJwk as any, "ES256");

  const kid = config.AUTH_KEY_ID ?? (privateJwk.kid || publicJwk.kid || "2loc-v1");

  return {
    async sign(claims) {
      return new SignJWT(claims)
        .setProtectedHeader({ alg: "ES256", typ: "JWT", kid })
        .setIssuedAt()
        .setJti(crypto.randomUUID())
        .setExpirationTime(`${config.JWT_TTL_SECONDS}s`)
        .sign(privateKey);
    },
    async getJwks() {
      const jwk = await exportJWK(publicKey);
      jwk.kid = kid;
      jwk.alg = "ES256";
      jwk.use = "sig";
      return { keys: [jwk as unknown as Record<string, unknown>] };
    }
  };
}
