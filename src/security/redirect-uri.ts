const LOCALHOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const PRIVATE_IPV4_PATTERNS: RegExp[] = [
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^0\./
];

export function validateRedirectUri(input: string, blocklist: Set<string> = new Set()): URL {
  if (!input || input.length > 2048) {
    throw new Error("invalid_redirect_uri");
  }

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("invalid_redirect_uri");
  }

  if (url.hash) {
    throw new Error("invalid_redirect_uri");
  }

  if (url.username || url.password) {
    throw new Error("invalid_redirect_uri");
  }

  const isHttp = url.protocol === "http:";
  const isHttps = url.protocol === "https:";
  if (!isHttp && !isHttps) {
    throw new Error("invalid_redirect_uri");
  }

  const hostname = url.hostname.toLowerCase();

  if (blocklist.has(hostname)) {
    throw new Error("invalid_redirect_uri");
  }

  if (isHttp && !LOCALHOSTS.has(hostname)) {
    throw new Error("invalid_redirect_uri");
  }

  if (isLiteralIp(hostname) && !LOCALHOSTS.has(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new Error("invalid_redirect_uri");
    }
  }

  if (hostname.endsWith(".local")) {
    throw new Error("invalid_redirect_uri");
  }

  return url;
}

function isLiteralIp(hostname: string): boolean {
  return /^\d+\.\d+\.\d+\.\d+$/.test(hostname) || hostname.includes(":");
}

function isPrivateIp(hostname: string): boolean {
  if (hostname.includes(":")) {
    const h = hostname.toLowerCase();
    return h === "::1" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80:");
  }

  return PRIVATE_IPV4_PATTERNS.some((pattern) => pattern.test(hostname));
}
