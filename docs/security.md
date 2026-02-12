# Security Model

## Redirect URI validation

- Absolute URL required
- `https://` required except localhost (`http://localhost`, `http://127.0.0.1`, `http://::1`)
- Username/password in URL rejected
- URL fragments rejected
- Private-network literal IP redirects blocked (except localhost)
- Optional hostname blocklist via `BLOCKLIST_DOMAINS`

## Request integrity

- OAuth uses PKCE `S256`
- Signed transaction cookie (`HttpOnly`, `Secure`, `SameSite=Lax`)
- Callback state validated against signed transaction payload
- Redirect URI hash bound to transaction payload

## Token security

- Auth token signed as `ES256`
- JWKS endpoint available for verification
- Short default expiration (`JWT_TTL_SECONDS=120`)
- Includes `jti` to support replay tracking in downstream apps

## Headers

- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `X-Content-Type-Options: nosniff`

## Abuse controls

- IP and origin throttles at `/authorize` (and aliases)
- IP/provider throttles at `/callback/:provider` (and alias)
- Durable Object-backed fixed-window counters
