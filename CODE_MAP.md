# Code Map

> **Freshness:** Reviewed commit: `fd5df3a` | Updated: `2026-07-19`
>
> This is a source-backed navigation aid, not runtime proof. Re-read the named source and run the
> matching validation before making behavior claims.

## Entry Points

| Surface | Path | Entry symbol / event | Purpose |
| --- | --- | --- | --- |
| Extension manifest | `manifest.json` | `chrome_url_overrides.newtab` | Routes New Tab to `dashboard.html`. |
| Service worker | `background.js` | `runtime.onInstalled`, `action.onClicked` | Initializes New Tab state and controls toolbar-popup behavior. |
| New Tab dashboard | `dashboard.html` + `dashboard.js` | `initApp()` | Renders bookmarks, search, themes, wallpapers, and control drawer. |
| Toolbar popup | `popup.html` + `popup.js` | `initApp()` | Displays compact bookmark management and re-enables New Tab when needed. |

## Module and Symbol Ownership

| Path | Key symbols | Responsibility |
| --- | --- | --- |
| `background.js` | `updatePopupState()` | Switches the toolbar between direct dashboard launch and `popup.html`. |
| `dashboard.js` | `loadSavedSettings()`, `setStorageItem()` | Restores and persists dashboard settings. |
| `dashboard.js` | `loadBookmarksTree()`, `renderSidebar()`, `renderItems()` | Reads Chrome bookmarks and renders the main bookmark surfaces. |
| `dashboard.js` | `setTheme()`, `selectLanguage()`, `renderThemeSelector()` | Applies and persists visual theme/language choices. |
| `dashboard.js` | `saveWallpaperManagerSettings()`, `applyBackgroundSettings()`, `nextSlide()` | Owns wallpaper-manager persistence and slideshow behavior. |
| `dashboard.js` | `triggerWebSearch()`, `selectSearchEngine()` | Runs browser/default/custom search flows. |
| `dashboard.js` | `setupEventListeners()`, `setupSyncListeners()`, `setupControlSurface()` | Binds dashboard DOM events, bookmark sync, and the settings drawer. |
| `popup.js` | `loadBookmarksTree()`, `renderBookmarks()`, `setupEventListeners()` | Popup bookmark loading, rendering, and interactions. |

## State and Storage

| State group | Keys / owner | Notes |
| --- | --- | --- |
| Display | `theme`, `language`, `mainMode`, `viewMode`, `searchLayout`, `drawerSide`, `sidebarCollapsed` | Primarily owned by `dashboard.js`; persisted through local and Chrome storage helpers. |
| Wallpaper | `wallpaperEnabled`, `wallpaperFit`, `wallpaperOpacity`, `customBgList`, `currentBgIndex`, `slideshowEnabled`, `slideshowMode`, `slideshowIntervalSeconds` | Managed by wallpaper-manager functions in `dashboard.js`. |
| Search | `searchEngine`, `customSearchEngines` | Managed by search-selector functions in `dashboard.js`. |
| New Tab state | `isNewtabDisabled`, `onboarding_completed`, `isHomepageSet` | Shared between dashboard and `background.js`; controls popup/direct-launch behavior. |

## Interfaces and Validation

| Surface | Contract | Verification |
| --- | --- | --- |
| Chrome Bookmarks API | Read, create, move, delete, and observe bookmark changes | Load unpacked extension and perform bookmark CRUD in dashboard/popup. |
| Chrome Storage API | Persists New Tab, theme, language, wallpaper, and search settings | Reload New Tab and extension; confirm retained values. |
| Wallpaper manager DOM | `wp-manager-*` controls and `wp-manager-save-btn` | Follow the completed regression checklist in `NEXT_STEPS.md` after changes. |
| Static checks | JavaScript syntax | `node --check background.js`, `node --check dashboard.js`, `node --check popup.js` |

## Known Gaps

- Favicon error fallback still uses inline `onerror` handlers; defer its CSP-compatible fix until
  the next store release.
- Align manifest, in-app, and release version labels in the next release.
