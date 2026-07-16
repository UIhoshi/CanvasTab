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
