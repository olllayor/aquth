import express from "express";

const app = express();
app.use(express.json());

app.get("/auth/callback", (_req, res) => {
  res.send(`
<!doctype html>
<html>
<body>
<script>
  const p = new URLSearchParams(location.hash.slice(1));
  fetch('/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: p.get('token') })
  }).then(() => location.href='/');
</script>
</body>
</html>
  `);
});

app.post("/session", (req, res) => {
  // Verify JWT using 2LOC JWKS and then create your session.
  res.json({ ok: Boolean(req.body?.token) });
});

app.listen(3000, () => {
  console.log("Example backend running on :3000");
});
