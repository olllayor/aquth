import { renderLayout } from "./layout";
import { escapeHtml } from "./escape";

export function renderHomePage(baseUrl: string): string {
  const exampleCallback = `${baseUrl}/example/callback`;
  const quickStartUrl = `${baseUrl}/authorize?provider=google&redirect_uri=${encodeURIComponent(exampleCallback)}`;
  const escapedQuickStartUrl = escapeHtml(quickStartUrl);

  const body = `
    <style>
      .home-grid {
        display: grid;
        gap: 12px;
        min-width: 0;
      }

      .home-grid > * {
        min-width: 0;
      }

      .cta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        text-decoration: none;
        border: 1px solid #c8d4e3;
        border-radius: 14px;
        padding: 12px 14px;
        color: #101417;
        font-weight: 600;
        background: rgba(255, 255, 255, 0.75);
        transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
      }

      .cta:hover {
        transform: translateY(-1px);
        border-color: #afc1d8;
        box-shadow: 0 10px 24px rgba(16, 20, 23, 0.08);
      }

      .cta-primary {
        border-left: 4px solid #1d4ed8;
      }

      .cta-secondary {
        border-left: 4px solid #14532d;
      }

      .code {
        margin-top: 2px;
        min-width: 0;
      }

      pre {
        margin: 0;
        padding: 12px;
        border: 1px solid #d6dce5;
        border-radius: 12px;
        background: rgba(255,255,255,0.78);
        font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.76rem;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        word-break: break-word;
        overflow-x: auto;
        max-width: 100%;
      }
    </style>

    <div class="home-grid">
      <a class="cta cta-primary" href="${escapedQuickStartUrl}">Try Google flow</a>
      <a class="cta cta-secondary" href="/providers">View providers JSON</a>
      <div class="code">
        <pre>&lt;script src="${escapeHtml(baseUrl)}/2loc.js"&gt;&lt;/script&gt;
&lt;a href="${escapedQuickStartUrl}"&gt;Login&lt;/a&gt;
&lt;script&gt;const { token } = window.twoLoc.parseHash()&lt;/script&gt;</pre>
      </div>
    </div>
  `;

  return renderLayout({
    title: "2LOC Auth",
    eyebrow: "Open Source Auth",
    heading: "Two lines. Real OAuth.",
    description: "2LOC Auth keeps login minimal: no dashboard, no API key setup, and no user persistence in core flow.",
    body
  });
}
