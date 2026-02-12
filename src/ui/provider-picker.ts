import { escapeHtml } from "./escape";
import { renderLayout } from "./layout";

interface ProviderPickerInput {
  redirectUri: string;
  state?: string;
  nonce?: string;
}

function providerButton(
  provider: "google" | "github",
  label: string,
  href: string,
  badge: string
): string {
  const isGoogle = provider === "google";
  const icon = isGoogle
    ? `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 11.2v2.9h4.1c-.2 1-1.2 2.9-4.1 2.9-2.5 0-4.6-2.1-4.6-4.8s2-4.8 4.6-4.8c1.4 0 2.4.6 2.9 1.1l2-2c-1.3-1.2-3-1.9-4.9-1.9-4.1 0-7.4 3.4-7.4 7.6s3.2 7.6 7.4 7.6c4.3 0 7.2-3 7.2-7.2 0-.5 0-1-.1-1.4H12z"/></svg>`
    : `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.3 1.1 2.9.9.1-.7.4-1.1.6-1.4-2.2-.3-4.5-1.1-4.5-5 0-1.1.4-2 1-2.8-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1 .8-.2 1.6-.3 2.5-.3.8 0 1.7.1 2.5.3 1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.7.8 1 1.7 1 2.8 0 3.9-2.3 4.7-4.6 5 .4.3.7 1 .7 2v2.9c0 .3.2.6.7.5 4-1.4 6.9-5.1 6.9-9.6C22 6.6 17.5 2 12 2z"/></svg>`;

  return `<a class="provider provider-${provider}" href="${escapeHtml(href)}">
    <span class="provider-main">
      <span class="provider-icon" aria-hidden="true">${icon}</span>
      <span>${escapeHtml(label)}</span>
    </span>
    <span class="provider-badge">${escapeHtml(badge)}</span>
  </a>`;
}

export function renderProviderPicker(input: ProviderPickerInput): string {
  const queryFor = (provider: "google" | "github"): string => {
    const params = new URLSearchParams({
      redirect_uri: input.redirectUri,
      provider
    });

    if (input.state) params.set("state", input.state);
    if (input.nonce) params.set("nonce", input.nonce);

    return `/authorize?${params.toString()}`;
  };

  const body = `
    <style>
      .provider {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        width: 100%;
        text-decoration: none;
        border: 1px solid #d4dbe4;
        border-radius: 14px;
        padding: 14px 16px;
        color: #101417;
        background: rgba(255, 255, 255, 0.72);
        transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
      }

      .provider:hover {
        transform: translateY(-1px);
        border-color: #bcc8d6;
        box-shadow: 0 10px 25px rgba(16, 20, 23, 0.08);
      }

      .provider-main {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
      }

      .provider-icon {
        display: inline-grid;
        place-items: center;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: rgba(16, 20, 23, 0.06);
      }

      .provider-icon svg {
        width: 16px;
        height: 16px;
      }

      .provider-badge {
        font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.72rem;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        color: #5f6874;
      }

      .provider-google { border-left: 4px solid #1d4ed8; }
      .provider-github { border-left: 4px solid #14532d; }
    </style>

    <div class="stack">
      ${providerButton("google", "Continue with Google", queryFor("google"), "OAuth")}
      ${providerButton("github", "Continue with GitHub", queryFor("github"), "OAuth")}
    </div>

    <p class="chip">redirect_uri: ${escapeHtml(input.redirectUri)}</p>
  `;

  return renderLayout({
    title: "2LOC Auth",
    eyebrow: "2LOC Auth",
    heading: "One redirect. No signup.",
    description: "Select a provider to continue. 2LOC returns a short-lived signed token to your callback URL.",
    body
  });
}
