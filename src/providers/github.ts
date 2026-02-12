import type { NormalizedProfile } from "../types/api";

const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";
const GITHUB_EMAILS_URL = "https://api.github.com/user/emails";

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

export function buildGithubAuthUrl(input: {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}): string {
  const params = new URLSearchParams({
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    state: input.state,
    scope: "read:user user:email"
  });

  // GitHub supports PKCE with the same OAuth params.
  params.set("code_challenge", input.codeChallenge);
  params.set("code_challenge_method", "S256");

  return `${GITHUB_AUTH_URL}?${params.toString()}`;
}

export async function exchangeGithubCode(input: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<GitHubTokenResponse> {
  const body = new URLSearchParams({
    client_id: input.clientId,
    client_secret: input.clientSecret,
    code: input.code,
    redirect_uri: input.redirectUri,
    code_verifier: input.codeVerifier
  });

  const response = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json"
    },
    body
  });

  if (!response.ok) {
    throw new Error("provider_error");
  }

  return (await response.json()) as GitHubTokenResponse;
}

async function fetchGithubEmail(accessToken: string): Promise<{ email: string | null; verified: boolean }> {
  const emailResponse = await fetch(GITHUB_EMAILS_URL, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      accept: "application/vnd.github+json"
    }
  });

  if (!emailResponse.ok) {
    return { email: null, verified: false };
  }

  const emails = (await emailResponse.json()) as GitHubEmail[];
  const primary = emails.find((entry) => entry.primary) ?? emails[0];

  return {
    email: primary?.email ?? null,
    verified: Boolean(primary?.verified)
  };
}

export async function fetchGithubProfile(accessToken: string): Promise<NormalizedProfile> {
  const response = await fetch(GITHUB_USER_URL, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      accept: "application/vnd.github+json"
    }
  });

  if (!response.ok) {
    throw new Error("provider_error");
  }

  const user = (await response.json()) as GitHubUser;
  const emailInfo = user.email
    ? { email: user.email, verified: true }
    : await fetchGithubEmail(accessToken);

  return {
    provider: "github",
    providerUserId: String(user.id),
    email: emailInfo.email,
    emailVerified: emailInfo.verified,
    name: user.name ?? user.login,
    picture: user.avatar_url ?? null
  };
}
