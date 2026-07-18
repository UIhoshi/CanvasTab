<!--
MANDATORY LOGIC GATE

Before making changes here, read `AGENTS.md` and `README.md` first.
Then follow the repository-declared logic entry chain when applicable.
-->

# CanvasTab Next Steps

## Pending: Real Chrome Regression Test

The wallpaper manager save-settings fix is implemented and pushed, but the final
interactive test must be performed on another computer in a real Chrome extension
context.

### Test checklist

- Load the pushed CanvasTab commit as an unpacked extension.
- Open **管理背景库 / Manage Backgrounds**.
- Confirm **Save settings** is disabled before any changes.
- Change wallpaper enablement, opacity, slideshow mode, and interval.
- Confirm the button becomes enabled.
- Save and confirm the success status appears.
- Reload the new-tab page and confirm all values persist.
- Confirm slideshow timing and random/sequential playback behave correctly.
- Confirm the same values survive extension reload through `chrome.storage.local`.

### Completion condition

Mark this plan complete only after the real Chrome interaction and persistence
checks pass on the other computer.

## Deferred Until The Next Store Release

The currently published Chrome Web Store build must not receive functional-code changes in this
workspace until the next release is planned. Track, but do not implement, these follow-ups here:

- Replace inline favicon `onerror` handlers with JavaScript event listeners so the fallback works
  under the Manifest V3 extension-page CSP.
- Reconcile the manifest version, in-app version labels, and the next release tag.
- Replace the remaining system emoji strings in localized UI labels if the SVG-only design
  requirement remains in scope.
- Decide whether to package fonts and remove the Google favicon fallback, or retain the current
  integrations with the privacy disclosure already added to `PRIVACY.md`.
