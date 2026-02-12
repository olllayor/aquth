import type { Context } from "hono";
import { getConfig } from "../config/env";
import { createJwtSigner } from "../security/jwt";

export async function jwksRoute(c: Context<{ Bindings: Env }>): Promise<Response> {
  const config = getConfig(c.env);
  const signer = await createJwtSigner(config);
  const jwks = await signer.getJwks();
  return c.json(jwks);
}
