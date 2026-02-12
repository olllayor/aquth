import type { Context } from "hono";
import { getConfig } from "../config/env";
import {
  exchangeGithubCode,
  fetchGithubProfile
} from "../providers/github";
import {
  exchangeGoogleCode,
  fetchGoogleProfile
} from "../providers/google";
import { clearTransactionCookie, getTransactionCookie } from "../security/cookies";
import { createJwtSigner } from "../security/jwt";
import { clientIp, enforceRateLimit } from "../security/rate-limit";
import { validateRedirectUri } from "../security/redirect-uri";
import { hashRedirectUri, unsealTransaction } from "../security/state";
import type { ProviderId } from "../types/claims";
import type { AuthErrorCode } from "../types/errors";
import { ERROR_DESCRIPTIONS } from "../types/errors";
import { renderErrorPage } from "../ui/error-page";

function redirectWithFragment(redirectUri: string, payload: Record<string, string>): Response {
  const url = new URL(redirectUri);
  url.hash = new URLSearchParams(payload).toString();
  return Response.redirect(url.toString(), 302);
}

function providerFromParam(value: string): ProviderId | null {
  return value === "google" || value === "github" ? value : null;
}

export async function callbackRoute(c: Context<{ Bindings: Env }>): Promise<Response> {
  const config = getConfig(c.env);
  const provider = providerFromParam(c.req.param("provider"));

  if (!provider) {
    return c.html(renderErrorPage("invalid_request", "Unsupported provider."), 400);
  }

  const txToken = getTransactionCookie(c, config.TX_COOKIE_NAME);
  if (!txToken) {
    return c.html(renderErrorPage("state_mismatch", ERROR_DESCRIPTIONS.state_mismatch), 400);
  }

  let tx;
  try {
    tx = await unsealTransaction(txToken, config.TX_SIGNING_SECRET);
  } catch {
    clearTransactionCookie(c, config.TX_COOKIE_NAME);
    return c.html(renderErrorPage("state_mismatch", ERROR_DESCRIPTIONS.state_mismatch), 400);
  }

  let redirectUri: URL;
  try {
    redirectUri = validateRedirectUri(tx.redirect_uri);
  } catch {
    clearTransactionCookie(c, config.TX_COOKIE_NAME);
    return c.html(renderErrorPage("invalid_redirect_uri", ERROR_DESCRIPTIONS.invalid_redirect_uri), 400);
  }

  const callbackLimit = await enforceRateLimit(
    c,
    `callback:ip:${clientIp(c)}:${provider}`,
    120,
    600,
    "callback_ip"
  );

  if (!callbackLimit.allowed) {
    clearTransactionCookie(c, config.TX_COOKIE_NAME);
    return redirectWithFragment(redirectUri.toString(), {
      error: "rate_limited",
      error_description: ERROR_DESCRIPTIONS.rate_limited,
      ...(tx.app_state ? { state: tx.app_state } : {})
    });
  }

  const requestState = c.req.query("state");
  if (!requestState || requestState !== tx.csrf_state || tx.provider !== provider) {
    clearTransactionCookie(c, config.TX_COOKIE_NAME);
    return redirectWithFragment(redirectUri.toString(), {
      error: "state_mismatch",
      error_description: ERROR_DESCRIPTIONS.state_mismatch,
      ...(tx.app_state ? { state: tx.app_state } : {})
    });
  }

  const redirectUriHash = await hashRedirectUri(redirectUri.toString());
  if (redirectUriHash !== tx.redirect_uri_hash) {
    clearTransactionCookie(c, config.TX_COOKIE_NAME);
    return redirectWithFragment(redirectUri.toString(), {
      error: "state_mismatch",
      error_description: ERROR_DESCRIPTIONS.state_mismatch,
      ...(tx.app_state ? { state: tx.app_state } : {})
    });
  }

  const providerError = c.req.query("error");
  if (providerError) {
    clearTransactionCookie(c, config.TX_COOKIE_NAME);
    const code: AuthErrorCode = providerError === "access_denied" ? "provider_denied" : "provider_error";
    return redirectWithFragment(redirectUri.toString(), {
      error: code,
      error_description: ERROR_DESCRIPTIONS[code],
      ...(tx.app_state ? { state: tx.app_state } : {})
    });
  }

  const code = c.req.query("code");
  if (!code) {
    clearTransactionCookie(c, config.TX_COOKIE_NAME);
    return redirectWithFragment(redirectUri.toString(), {
      error: "provider_error",
      error_description: ERROR_DESCRIPTIONS.provider_error,
      ...(tx.app_state ? { state: tx.app_state } : {})
    });
  }

  const callbackUrl = `${config.BASE_URL}/callback/${provider}`;

  try {
    const profile = provider === "google"
      ? await (async () => {
        const token = await exchangeGoogleCode({
          code,
          clientId: config.GOOGLE_CLIENT_ID,
          clientSecret: config.GOOGLE_CLIENT_SECRET,
          redirectUri: callbackUrl,
          codeVerifier: tx.code_verifier
        });

        return fetchGoogleProfile(token.access_token);
      })()
      : await (async () => {
        const token = await exchangeGithubCode({
          code,
          clientId: config.GITHUB_CLIENT_ID,
          clientSecret: config.GITHUB_CLIENT_SECRET,
          redirectUri: callbackUrl,
          codeVerifier: tx.code_verifier
        });

        return fetchGithubProfile(token.access_token);
      })();

    const signer = await createJwtSigner(config);
    const jwt = await signer.sign({
      iss: config.AUTH_ISSUER,
      aud: config.AUTH_AUDIENCE,
      sub: `${profile.provider}:${profile.providerUserId}`,
      provider: profile.provider,
      email: profile.email,
      email_verified: profile.emailVerified,
      name: profile.name,
      picture: profile.picture,
      ...(tx.nonce ? { nonce: tx.nonce } : {})
    });

    clearTransactionCookie(c, config.TX_COOKIE_NAME);

    return redirectWithFragment(redirectUri.toString(), {
      token: jwt,
      ...(tx.app_state ? { state: tx.app_state } : {})
    });
  } catch {
    clearTransactionCookie(c, config.TX_COOKIE_NAME);
    return redirectWithFragment(redirectUri.toString(), {
      error: "internal_error",
      error_description: ERROR_DESCRIPTIONS.internal_error,
      ...(tx.app_state ? { state: tx.app_state } : {})
    });
  }
}
