import { escapeHtml } from "./escape";

interface RenderLayoutInput {
  title: string;
  eyebrow: string;
  heading: string;
  description: string;
  body: string;
  tone?: "default" | "danger";
}

export function renderLayout(input: RenderLayoutInput): string {
  const isDanger = input.tone === "danger";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(input.title)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
    <style>
      :root {
        --bg: #f7f8f4;
        --ink: #101417;
        --muted: #56606b;
        --line: #d6dce5;
        --surface: rgba(255, 255, 255, 0.86);
        --accent: #14532d;
        --accent-2: #1d4ed8;
        --danger: #b93815;
        --danger-soft: #fff5f2;
        --shadow: 0 20px 50px rgba(16, 20, 23, 0.12);
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100dvh;
        padding: 24px;
        font-family: "Space Grotesk", "Avenir Next", "Segoe UI", sans-serif;
        color: var(--ink);
        background:
          radial-gradient(70rem 45rem at 10% -10%, rgba(29, 78, 216, 0.12), transparent 50%),
          radial-gradient(60rem 40rem at 105% 0%, rgba(20, 83, 45, 0.11), transparent 55%),
          linear-gradient(180deg, #f7f8f4 0%, #f1f4f8 100%);
        display: grid;
        place-items: center;
      }

      .shell {
        width: min(560px, 100%);
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 24px;
        padding: 28px;
        backdrop-filter: blur(6px);
        box-shadow: var(--shadow);
        animation: rise 300ms ease-out both;
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.74rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: ${isDanger ? "var(--danger)" : "var(--accent)"};
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: currentColor;
      }

      h1 {
        margin: 14px 0 10px;
        font-size: clamp(1.5rem, 3.5vw, 2rem);
        line-height: 1.2;
      }

      .lead {
        margin: 0 0 22px;
        color: var(--muted);
        line-height: 1.55;
      }

      .stack {
        display: grid;
        gap: 12px;
      }

      .chip {
        margin-top: 18px;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid ${isDanger ? "#f8d4c9" : "var(--line)"};
        background: ${isDanger ? "var(--danger-soft)" : "rgba(255,255,255,0.65)"};
        color: #3d4650;
        font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.78rem;
        word-break: break-all;
      }

      .muted-link {
        color: #475467;
        text-decoration: none;
      }

      .muted-link:hover { text-decoration: underline; }

      @keyframes rise {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 640px) {
        body { padding: 14px; }
        .shell { border-radius: 18px; padding: 20px; }
      }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation: none !important; transition: none !important; }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <span class="eyebrow"><span class="dot"></span>${escapeHtml(input.eyebrow)}</span>
      <h1>${escapeHtml(input.heading)}</h1>
      <p class="lead">${escapeHtml(input.description)}</p>
      ${input.body}
    </main>
  </body>
</html>`;
}
