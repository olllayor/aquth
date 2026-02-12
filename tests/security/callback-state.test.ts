import { describe, expect, it } from "vitest";
import app from "../../src/index";
import { hashRedirectUri, sealTransaction } from "../../src/security/state";
import { buildTestEnv } from "../helpers/test-env";

describe("callback security", () => {
  it("returns state_mismatch when callback state does not match", async () => {
    const env = buildTestEnv();

    const token = await sealTransaction(
      {
        tx_id: "tx-1",
        redirect_uri: "https://app.example/callback",
        redirect_uri_hash: await hashRedirectUri("https://app.example/callback"),
        provider: "google",
        code_verifier: "verifier",
        csrf_state: "expected-state",
        app_state: "app-state",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 600
      },
      env.TX_SIGNING_SECRET
    );

    const res = await app.request(
      "https://2loc.test/callback/google?state=wrong-state&code=abc",
      {
        headers: {
          cookie: `${env.TX_COOKIE_NAME}=${token}`
        }
      },
      env
    );

    expect(res.status).toBe(302);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("https://app.example/callback#error=state_mismatch");
    expect(location).toContain("state=app-state");
  });
});
