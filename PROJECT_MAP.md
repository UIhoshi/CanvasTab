# Project Map

## L1 — Entry & Surface

- **Manifest:** `manifest.json` (Manifest V3; New Tab override: `dashboard.html`).
- **User surfaces:** New Tab dashboard (`dashboard.html`) and toolbar popup (`popup.html`).
- **Primary docs:** `README.md`, `PRIVACY.md`, `NEXT_STEPS.md`, and `CODE_MAP.md`.

## L2 — Flow & Lifecycle

- **Service-worker flow:** `background.js` handles installation, toolbar-popup state, and New Tab navigation actions.
- **Dashboard flow:** `dashboard.js` loads and manages bookmarks, searches, themes, languages, wallpapers, and settings.
- **Popup flow:** `popup.js` provides a compact bookmark view and opens the dashboard.
- **Wallpaper regression:** user-reported real Chrome verification completed; retain `NEXT_STEPS.md` for deferred post-release work.

## L3 — Control & Verification

- **Permissions:** `bookmarks`, `favicon`, `search`, and `storage`, declared in `manifest.json`.
- **Static checks:** `node --check background.js`, `node --check dashboard.js`, `node --check popup.js`.
- **Runtime check:** load unpacked in Chrome and execute the regression checklist in `NEXT_STEPS.md`.

## L4 — Base & Dependencies

- **Runtime:** Chromium Manifest V3 extension APIs and browser local/chrome storage.
- **Dependencies:** no package manager or bundled third-party JavaScript dependencies.
- **External resources:** Google Fonts is loaded by the dashboard and popup; see `PRIVACY.md`.

## Unconfirmed Points

- [ ] Favicon error fallback behavior under the extension's default CSP.
