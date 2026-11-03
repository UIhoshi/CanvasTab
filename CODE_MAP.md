# Code Map

> **Freshness:** Working tree review: `v2.3.1` (`12b4401` + recent visits limit 30) | Updated: `2026-11-03`
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
| `dashboard.js` | early New Tab redirect, `loadSavedSettings()`, `setStorageItem()` | Restores and persists dashboard settings; when disabled, routes Chrome to its existing New Tab target and Edge to `about:blank` to prevent the Edge override loop. |
| `dashboard.js` | `loadBookmarksTree()`, `renderSidebar()`, `renderItems()` | Reads Chrome bookmarks and renders the main bookmark surfaces; every visual-folder level shows a parent-navigation card before the create-folder card and remains on that folder after creation. |
| `dashboard.js` | `loadRecentVisits()`, `recordRecentVisit()`, `renderRecentVisits()` | Persists and renders up to `MAX_RECENT_VISITS` (30) recently visited bookmark links (`recentVisits`). |
| `dashboard.js` | `requestVisualDeletion()`, `handleDeleteSelectedVisualItems()`, `renderBatchModeToolbar()`, `clearBatchSelectionForNavigation()` | Folder/link deletion: visual mode provides lower-right and right-click single delete; a persistent batch toolbar works on both dashboard card modes, but its selection scope resets when the user navigates to another folder level. |
| `dashboard.js` | `setMainMode()`, `setViewMode()`, `setTheme()`, `selectLanguage()`, `renderThemeSelector()` | Applies and persists dashboard mode, card/list/icon mode, theme, and language choices; initial restore re-syncs drawer active states, and Auto theme re-evaluates at the next local 06:00/18:00 boundary. |
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
| New Tab state | `isNewtabDisabled`, `onboarding_completed`, `isHomepageSet` | Shared between dashboard and `background.js`; controls popup/direct-launch behavior. Chrome restores its verified New Tab target; Edge uses a blank-page fallback because its native target re-enters the static override. |
| Batch deletion | `isBatchSelectionMode`, `selectedVisualItemKeys`, `visualContextTarget`, `bookmarkMutationInProgress` | Persistent within the current dashboard-card folder level and shared by visual and sidebar-manager card views; selecting a different level clears it, while a same-surface refresh retains it. Toolbar popup is excluded. |

## Interfaces and Validation

| Surface | Contract | Verification |
| --- | --- | --- |
| Chrome Bookmarks API | Read, create, move, delete, and observe bookmark changes | Load unpacked extension and perform bookmark CRUD in dashboard/popup. |
| Chrome Storage API | Persists New Tab, theme, language, wallpaper, and search settings | Reload New Tab and extension; confirm retained values. |
| Wallpaper manager DOM | `wp-manager-*` controls and `wp-manager-save-btn` | Follow the completed regression checklist in `NEXT_STEPS.md` after changes. |
| Static checks | JavaScript syntax | `node --check background.js`, `node --check dashboard.js`, `node --check popup.js` |
| Cross-browser New Tab cancellation | `isNewtabDisabled` → Chrome native target / Edge blank fallback | Reload unpacked extension; test Ctrl+T with takeover enabled and disabled in Edge and Chrome. |
| Card deletion and batch mode | `.visual-delete-corner`, visual context-menu actions, `batch-mode-toolbar`, Chrome Bookmarks remove/removeTree | Verify individual visual folder/link deletion; entering batch through the toolbar or context menu; direct card selection; reset on folder-level navigation; and the selected card's lower-right pale checkmark and 75% scale. Confirm toolbar popup is unchanged. |

## Known Gaps

- Favicon error fallback still uses inline `onerror` handlers; defer its CSP-compatible fix until
  the next store release.
