import { SignJWT, jwtVerify } from "jose";
import type { TransactionPayload } from "../types/claims";

const textEncoder = new TextEncoder();

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function randomString(size = 32): string {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

export async function createCodeChallenge(codeVerifier: string): Promise<string> {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64Url(new Uint8Array(digest));
}

export async function hashRedirectUri(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return base64Url(new Uint8Array(digest));
}

export async function sealTransaction(payload: TransactionPayload, txSecret: string): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(payload.iat)
    .setExpirationTime(payload.exp)
    .sign(textEncoder.encode(txSecret));
}

export async function unsealTransaction(token: string, txSecret: string): Promise<TransactionPayload> {
  const { payload } = await jwtVerify(token, textEncoder.encode(txSecret), {
    algorithms: ["HS256"]
  });

  return payload as unknown as TransactionPayload;
}
