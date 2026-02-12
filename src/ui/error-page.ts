import type { AuthErrorCode } from "../types/errors";
import { escapeHtml } from "./escape";
import { renderLayout } from "./layout";

export function renderErrorPage(code: AuthErrorCode, message: string): string {
  const body = `
    <div class="stack">
      <style>
        .error-grid {
          display: grid;
          gap: 10px;
        }

        .error-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid #f2cdc1;
          background: #fff7f4;
          font-size: 0.92rem;
        }

        .label {
          color: #874430;
          font-weight: 600;
        }

        .value {
          font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
          color: #5f6874;
          font-size: 0.78rem;
          word-break: break-all;
        }

        .hint {
          margin-top: 2px;
          color: #5f6874;
        }
      </style>

      <div class="error-grid">
        <div class="error-row">
          <span class="label">Error code</span>
          <span class="value">${escapeHtml(code)}</span>
        </div>
      </div>

      <p class="hint">${escapeHtml(message)}</p>
      <p class="chip">If this persists, re-initiate login from your app and verify callback URL settings.</p>
    </div>
  `;

  return renderLayout({
    title: "2LOC Auth Error",
    eyebrow: "Authentication Error",
    heading: "Sign-in could not be completed",
    description: "The request was blocked or rejected before token issuance.",
    body,
    tone: "danger"
  });
}
