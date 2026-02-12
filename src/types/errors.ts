export const AUTH_ERROR_CODES = [
  "invalid_redirect_uri",
  "rate_limited",
  "provider_denied",
  "provider_error",
  "state_mismatch",
  "internal_error",
  "invalid_request"
] as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

export const ERROR_DESCRIPTIONS: Record<AuthErrorCode, string> = {
  invalid_redirect_uri: "The redirect URI is invalid or unsafe.",
  rate_limited: "Too many requests. Try again shortly.",
  provider_denied: "The provider denied access.",
  provider_error: "The provider returned an authentication error.",
  state_mismatch: "State validation failed.",
  internal_error: "Authentication service error.",
  invalid_request: "The request is invalid."
};
