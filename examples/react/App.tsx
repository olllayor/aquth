import { useMemo } from "react";

const AUTH_URL = "https://auth.example.com/authorize";
const CALLBACK = encodeURIComponent("https://app.example.com/auth/callback");

export default function App() {
  const fragment = useMemo(() => new URLSearchParams(window.location.hash.slice(1)), []);
  const token = fragment.get("token");
  const error = fragment.get("error");

  return (
    <main>
      <a href={`${AUTH_URL}?provider=google&redirect_uri=${CALLBACK}`}>Login with Google</a>
      <a href={`${AUTH_URL}?provider=github&redirect_uri=${CALLBACK}`}>Login with GitHub</a>
      {token && <pre>{token}</pre>}
      {error && <pre>{error}</pre>}
    </main>
  );
}
