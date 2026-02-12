import type { Context } from "hono";
import { z } from "zod";
import { getConfig } from "../config/env";
import { buildGithubAuthUrl } from "../providers/github";
import { buildGoogleAuthUrl } from "../providers/google";
import { clearTransactionCookie, setTransactionCookie } from "../security/cookies";
import { clientIp, enforceRateLimit } from "../security/rate-limit";
import { validateRedirectUri } from "../security/redirect-uri";
import {
  createCodeChallenge,
  hashRedirectUri,
  randomString,
  sealTransaction
} from "../security/state";
import { renderProviderPicker } from "../ui/provider-picker";

const authQuerySchema = z.object({
  redirect_uri: z.string().min(1),
  provider: z.enum(["google", "github"]).optional(),
  state: z.string().max(1024).optional(),
  nonce: z.string().max(1024).optional()
});

export async function authRoute(c: Context<{ Bindings: Env }>): Promise<Response> {
  const config = getConfig(c.env);
  const parsed = authQuerySchema.safeParse(c.req.query());

  if (!parsed.success) {
    return c.text("Invalid request", 400);
  }

  const blocklist = new Set(
    (config.BLOCKLIST_DOMAINS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );

  let redirectUri: URL;
  try {
    redirectUri = validateRedirectUri(parsed.data.redirect_uri, blocklist);
  } catch {
    return c.text("Invalid redirect_uri", 400);
  }

  const ip = clientIp(c);
  const ipLimit = await enforceRateLimit(c, `auth:ip:${ip}`, 60, 600, "auth_ip");
  if (!ipLimit.allowed) {
    return redirectWithFragment(redirectUri.toString(), {
      error: "rate_limited",
      error_description: "Too many requests. Try again shortly.",
      ...(parsed.data.state ? { state: parsed.data.state } : {})
    });
  }

  const originLimit = await enforceRateLimit(c, `auth:origin:${redirectUri.origin}`, 300, 600, "auth_origin");
  if (!originLimit.allowed) {
    return redirectWithFragment(redirectUri.toString(), {
      error: "rate_limited",
      error_description: "Too many requests. Try again shortly.",
      ...(parsed.data.state ? { state: parsed.data.state } : {})
    });
  }

  if (!parsed.data.provider) {
    clearTransactionCookie(c, config.TX_COOKIE_NAME);
    return c.html(
      renderProviderPicker({
        redirectUri: redirectUri.toString(),
        state: parsed.data.state,
        nonce: parsed.data.nonce
      })
    );
  }

  const codeVerifier = randomString(64);
  const codeChallenge = await createCodeChallenge(codeVerifier);
  const csrfState = randomString(24);
  const now = Math.floor(Date.now() / 1000);

  const txPayload = {
    tx_id: crypto.randomUUID(),
    redirect_uri: redirectUri.toString(),
    redirect_uri_hash: await hashRedirectUri(redirectUri.toString()),
    provider: parsed.data.provider,
    code_verifier: codeVerifier,
    csrf_state: csrfState,
    app_state: parsed.data.state,
    nonce: parsed.data.nonce,
    iat: now,
    exp: now + config.TX_TTL_SECONDS
  };

  const sealed = await sealTransaction(txPayload, config.TX_SIGNING_SECRET);
  setTransactionCookie(c, config.TX_COOKIE_NAME, sealed, config.TX_TTL_SECONDS);

  const callbackUrl = `${config.BASE_URL}/callback/${parsed.data.provider}`;
  const authorizationUrl = parsed.data.provider === "google"
    ? buildGoogleAuthUrl({
      clientId: config.GOOGLE_CLIENT_ID,
      redirectUri: callbackUrl,
      state: csrfState,
      codeChallenge
    })
    : buildGithubAuthUrl({
      clientId: config.GITHUB_CLIENT_ID,
      redirectUri: callbackUrl,
      state: csrfState,
      codeChallenge
    });

  return c.redirect(authorizationUrl, 302);
}

function redirectWithFragment(redirectUri: string, payload: Record<string, string>): Response {
  const url = new URL(redirectUri);
  url.hash = new URLSearchParams(payload).toString();
  return Response.redirect(url.toString(), 302);
}
