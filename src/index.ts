import { Hono } from "hono";
import { authRoute } from "./routes/auth";
import { callbackRoute } from "./routes/callback";
import { healthRoute } from "./routes/health";
import { jwksRoute } from "./routes/jwks";
import { providersRoute } from "./routes/providers";
import { sdkRoute } from "./routes/sdk";
import { securityHeaders } from "./security/headers";
import { RateLimiterDO } from "./security/rate-limiter-do";
import { renderHomePage } from "./ui/home-page";

const app = new Hono<{ Bindings: Env }>();

app.use("*", securityHeaders);

app.get("/healthz", healthRoute);
app.get("/auth", authRoute);
app.get("/authorize", authRoute);
app.get("/providers", providersRoute);
app.get("/2loc.js", sdkRoute);
app.get("/v1/providers", providersRoute);
app.get("/.well-known/jwks.json", jwksRoute);
app.get("/v1/auth", authRoute);
app.get("/v1/authorize", authRoute);
app.get("/callback/:provider", callbackRoute);
app.get("/v1/callback/:provider", callbackRoute);

app.get("/", (c) => {
  const accept = c.req.header("accept") ?? "";
  if (accept.includes("application/json")) {
    return c.json({
      name: "2LOC Auth",
      docs: "Open-source project documentation in README and /docs files",
      providers: ["google", "github"]
    });
  }

  const url = new URL(c.req.url);
  return c.html(renderHomePage(url.origin));
});

app.notFound((c) => c.json({ error: "not_found" }, 404));

export { RateLimiterDO };
export default app;
