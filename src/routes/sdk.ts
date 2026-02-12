import type { Context } from "hono";

export function sdkRoute(c: Context): Response {
  const origin = new URL(c.req.url).origin;

  const script = `(function(){
  function buildAuthorizeUrl(input){
    if(!input || !input.redirectUri){
      throw new Error("redirectUri is required");
    }

    var params = new URLSearchParams({
      redirect_uri: input.redirectUri,
      provider: input.provider || "google"
    });

    if(input.state){ params.set("state", input.state); }
    if(input.nonce){ params.set("nonce", input.nonce); }

    return "${origin}/authorize?" + params.toString();
  }

  function login(input){
    var url = buildAuthorizeUrl(input);
    window.location.assign(url);
  }

  function parseHash(hash){
    var source = typeof hash === "string" ? hash : window.location.hash;
    var params = new URLSearchParams((source || "").replace(/^#/, ""));
    return {
      token: params.get("token"),
      state: params.get("state"),
      error: params.get("error"),
      error_description: params.get("error_description")
    };
  }

  window.twoLoc = {
    buildAuthorizeUrl: buildAuthorizeUrl,
    login: login,
    parseHash: parseHash
  };
})();`;

  c.header("Content-Type", "application/javascript; charset=utf-8");
  c.header("Cache-Control", "public, max-age=3600");
  return c.body(script);
}
