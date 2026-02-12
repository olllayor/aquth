export type ProviderId = "google" | "github";

export interface AuthTokenClaims {
  iss: string;
  aud: string;
  sub: string;
  provider: ProviderId;
  email: string | null;
  email_verified: boolean;
  name: string | null;
  picture: string | null;
  iat: number;
  exp: number;
  jti: string;
  nonce?: string;
}

export interface TransactionPayload {
  [key: string]: unknown;
  tx_id: string;
  redirect_uri: string;
  redirect_uri_hash: string;
  provider: ProviderId;
  code_verifier: string;
  csrf_state: string;
  app_state?: string;
  nonce?: string;
  iat: number;
  exp: number;
}
