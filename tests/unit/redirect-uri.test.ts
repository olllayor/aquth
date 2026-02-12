import { describe, expect, it } from "vitest";
import { validateRedirectUri } from "../../src/security/redirect-uri";

describe("validateRedirectUri", () => {
  it("accepts https redirect", () => {
    const url = validateRedirectUri("https://example.com/callback");
    expect(url.toString()).toBe("https://example.com/callback");
  });

  it("accepts localhost over http", () => {
    const url = validateRedirectUri("http://localhost:3000/callback");
    expect(url.hostname).toBe("localhost");
  });

  it("rejects http non-localhost", () => {
    expect(() => validateRedirectUri("http://example.com/callback")).toThrowError("invalid_redirect_uri");
  });

  it("rejects private ip", () => {
    expect(() => validateRedirectUri("https://192.168.1.4/callback")).toThrowError("invalid_redirect_uri");
  });

  it("rejects fragment in redirect", () => {
    expect(() => validateRedirectUri("https://example.com/callback#x")).toThrowError("invalid_redirect_uri");
  });

  it("rejects blocked domain", () => {
    expect(() => validateRedirectUri("https://evil.test/cb", new Set(["evil.test"]))).toThrowError("invalid_redirect_uri");
  });
});
