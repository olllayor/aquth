# API Reference

## `GET /authorize` (primary)

Starts the auth flow.

### Query params

- `redirect_uri` (required): Absolute callback URL for your app.
- `provider` (optional): `google` or `github`.
- `state` (optional): Opaque app state echoed back.
- `nonce` (optional): Added to issued JWT.

### Behavior

- If `provider` is omitted, returns a provider picker HTML page.
- If `provider` is provided, redirects to OAuth provider.

Compatibility aliases:
- `GET /auth`
- `GET /v1/auth`
- `GET /v1/authorize`

## `GET /callback/:provider`

Internal callback endpoint used by Google/GitHub OAuth apps.

Compatibility alias:
- `GET /v1/callback/:provider`

## `GET /providers`

Returns available providers.

Compatibility alias:
- `GET /v1/providers`

## `GET /.well-known/jwks.json`

Returns the signing public key set for JWT verification.

## `GET /2loc.js`

Optional browser helper SDK. Exposes `window.twoLoc`:
- `buildAuthorizeUrl({ redirectUri, provider, state, nonce })`
- `login({ redirectUri, provider, state, nonce })`
- `parseHash(hash?)`

## `GET /healthz`

Liveness endpoint.

## Success redirect contract

`redirect_uri#token=<jwt>&state=<state?>`

## Error redirect contract

`redirect_uri#error=<code>&error_description=<message>&state=<state?>`

## Error codes

- `invalid_redirect_uri`
- `rate_limited`
- `provider_denied`
- `provider_error`
- `state_mismatch`
- `internal_error`
- `invalid_request`
