# CanvasTab Project Instructions

CanvasTab is a Manifest V3 Chrome/Edge extension with vanilla HTML, CSS, and JavaScript.

## Entry points

- `manifest.json` declares the service worker and New Tab override.
- `background.js` is the service worker.
- `dashboard.html` / `dashboard.js` / `dashboard.css` provide the New Tab dashboard.
- `popup.html` / `popup.js` / `popup.css` provide the toolbar popup.

## Local checks

- JavaScript syntax: `node --check background.js`, `node --check dashboard.js`, and `node --check popup.js`.
- Runtime regression: load the unpacked extension in Chrome and complete `NEXT_STEPS.md` before closing wallpaper-manager work.

## Project boundaries

- Keep the extension dependency-free unless a change is explicitly approved.
- Update `PROJECT_MAP.md` with structural, permission, or validation-command changes.
- Record material, resolved failures in `.learnings/ERRORS.md` without secrets or raw logs.
