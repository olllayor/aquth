# FAQ

## Why no API key?

The service is intentionally no-signup. Abuse mitigation is done via rate limiting, validation, and optional challenge checks.

## Why fragment tokens instead of query tokens?

URL fragments are not sent to servers by browsers, reducing leakage through intermediary logs.

## Can I use more providers?

v1 supports Google and GitHub only. More providers are a v2 goal.

## Can backend-only apps use this?

Yes. Capture the fragment token in frontend callback code and POST it to your backend session endpoint.

## Does this store users?

No. v1 does not persist user profiles.
