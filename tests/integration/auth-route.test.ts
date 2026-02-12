import { describe, expect, it } from "vitest";
import app from "../../src/index";
import { buildTestEnv } from "../helpers/test-env";

describe("auth entrypoints", () => {
  it("returns provider picker when provider is omitted", async () => {
    const env = buildTestEnv();
    const res = await app.request(
      "https://2loc.test/authorize?redirect_uri=https%3A%2F%2Fapp.example%2Fcallback",
      {},
      env
    );

    expect(res.status).toBe(200);
    expect(await res.text()).toContain("Continue with Google");
  });

  it("redirects to google oauth when provider is provided", async () => {
    const env = buildTestEnv();
    const res = await app.request(
      "https://2loc.test/authorize?redirect_uri=https%3A%2F%2Fapp.example%2Fcallback&provider=google",
      {},
      env
    );

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toContain("accounts.google.com");
    expect(res.headers.get("set-cookie")).toContain("__Host-2loc_tx=");
  });

  it("rejects invalid redirect uri", async () => {
    const env = buildTestEnv();
    const res = await app.request(
      "https://2loc.test/authorize?redirect_uri=http%3A%2F%2Fevil.test%2Fcallback&provider=google",
      {},
      env
    );

    expect(res.status).toBe(400);
  });

  it("supports v1 auth alias", async () => {
    const env = buildTestEnv();
    const res = await app.request(
      "https://2loc.test/v1/auth?redirect_uri=https%3A%2F%2Fapp.example%2Fcallback&provider=github",
      {},
      env
    );

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toContain("github.com/login/oauth/authorize");
  });

  it("supports /auth alias", async () => {
    const env = buildTestEnv();
    const res = await app.request(
      "https://2loc.test/auth?redirect_uri=https%3A%2F%2Fapp.example%2Fcallback&provider=google",
      {},
      env
    );

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toContain("accounts.google.com");
  });

  it("serves browser sdk", async () => {
    const env = buildTestEnv();
    const res = await app.request("https://2loc.test/2loc.js", {}, env);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/javascript");
    expect(await res.text()).toContain("window.twoLoc");
  });
});
