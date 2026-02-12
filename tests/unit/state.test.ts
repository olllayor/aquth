import { describe, expect, it } from "vitest";
import { createCodeChallenge, hashRedirectUri, randomString, sealTransaction, unsealTransaction } from "../../src/security/state";

describe("state security helpers", () => {
  it("builds code challenge", async () => {
    const verifier = randomString(32);
    const challenge = await createCodeChallenge(verifier);
    expect(challenge.length).toBeGreaterThan(20);
  });

  it("hashes redirect uri", async () => {
    const hash = await hashRedirectUri("https://app.example/callback");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("seals and unseals transaction", async () => {
    const token = await sealTransaction(
      {
        tx_id: "tx-1",
        redirect_uri: "https://app.example/callback",
        redirect_uri_hash: "hash",
        provider: "google",
        code_verifier: "verifier",
        csrf_state: "state",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 600
      },
      "this-is-a-long-test-secret-with-over-32-chars"
    );

    const tx = await unsealTransaction(token, "this-is-a-long-test-secret-with-over-32-chars");
    expect(tx.tx_id).toBe("tx-1");
    expect(tx.provider).toBe("google");
  });
});
