# Self-hosting

## Cloudflare Workers

1. Create OAuth apps in Google/GitHub with callback URLs:
- `https://<your-domain>/callback/google`
- `https://<your-domain>/callback/github`

2. Configure `wrangler.toml` and secrets:
```bash
wrangler secret put TX_SIGNING_SECRET
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
wrangler secret put AUTH_PRIVATE_JWK
wrangler secret put AUTH_PUBLIC_JWK
```

3. Set vars (wrangler `[vars]` or dashboard):
- `BASE_URL`
- `AUTH_ISSUER`
- `AUTH_AUDIENCE`
- `AUTH_KEY_ID` (optional)
- `TX_COOKIE_NAME`
- `TX_TTL_SECONDS`
- `JWT_TTL_SECONDS`

4. Deploy:
```bash
pnpm run deploy
```

## Docker (development fallback)

```bash
docker build -t 2loc-auth .
docker run --rm -p 8787:8787 --env-file .dev.vars 2loc-auth
```
