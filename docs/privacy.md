# Privacy

2LOC Auth v1 is designed for data minimization.

## Data returned to apps

- `sub`
- `provider`
- `email`
- `email_verified`
- `name`
- `picture`

## Retention

- No persistent user profile storage
- Transaction cookies expire quickly (default 10 minutes)
- Rate-limit metadata is operational only and short-lived

## Compliance posture

- No user account system in v1
- No analytics or marketing profile building in core service
- Self-hosters control operational logs and retention policies
