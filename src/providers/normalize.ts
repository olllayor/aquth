import type { NormalizedProfile } from "../types/api";
import type { ProviderId } from "../types/claims";

export interface ProviderUserData {
  provider: ProviderId;
  providerUserId: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  picture: string | null;
}

export function normalizeProfile(data: ProviderUserData): NormalizedProfile {
  return {
    provider: data.provider,
    providerUserId: data.providerUserId,
    email: data.email,
    emailVerified: data.emailVerified,
    name: data.name,
    picture: data.picture
  };
}
