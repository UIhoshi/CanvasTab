# CanvasTab Privacy Policy

**Last Updated: July 2026**

## Overview

CanvasTab ("the Extension") is committed to protecting your privacy. This Privacy Policy explains our data practices.

## Data Collection

**CanvasTab does not collect, store, or transmit any user data.**

Specifically, we do NOT collect:
- Personal information (name, email, address, etc.)
- Browsing history or web activity
- Financial or payment information
- Location data
- Personal communications

## Local Storage Only

All data saved by CanvasTab stays **100% on your local device**:

| Data | Storage Location |
|------|-----------------|
| Selected theme & language | Browser `localStorage` |
| Custom search engines | Browser `localStorage` |
| Wallpaper settings & images | Browser `localStorage` + Chrome Storage API |
| Bookmark organization | Chrome Bookmarks API (your local browser) |

## Permissions Used

| Permission | Purpose |
|------------|---------|
| `bookmarks` | Read, create, move, and delete your browser bookmarks within the extension UI |
| `storage` | Save your theme, language, and wallpaper preferences locally |
| `favicon` | Display website icons on bookmark cards |
| `search` | Invoke the browser's default search engine from the search bar |

## Third-Party Services

CanvasTab does **not** use third-party analytics, advertising, or tracking services, and it does not send bookmark or preference data to an application backend.

The dashboard and popup currently load the Inter font from Google Fonts (`fonts.googleapis.com`). Those requests connect the browser to Google's servers and are subject to Google's network and privacy policies. When the Chrome extension APIs are unavailable (for example, in a mock/browser-preview context), the favicon fallback can request a favicon from Google's favicon service using a bookmark hostname. In normal installed-extension operation, CanvasTab uses Chrome's extension favicon endpoint instead.

## Data Sharing

We do not sell, trade, rent, or transfer any user data to any third party under any circumstances.

## Changes to This Policy

If we update this Privacy Policy, the updated version will be posted in this repository with a new "Last Updated" date.

## Contact

For privacy-related questions, please open an issue in this repository.

---

*CanvasTab is an open-source Chrome/Edge browser extension.*
