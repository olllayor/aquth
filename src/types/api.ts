import type { ProviderId } from "./claims";

export interface NormalizedProfile {
  provider: ProviderId;
  providerUserId: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  picture: string | null;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec?: number;
  reason?: string;
}

export interface ProviderInfo {
  id: ProviderId;
  name: string;
}
