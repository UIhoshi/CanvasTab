# Project Error Log

Use this file only for material, resolved project failures. Do not include credentials, personal paths, raw logs, or speculative findings.

## 2026-07-20 — Browser-specific New Tab redirect failed in Edge
- Symptom: Disabling CanvasTab's New Tab UI while the extension remained enabled opened `ERR_INVALID_URL` in Edge.
- Root cause: The Chrome-verified cancellation path hard-coded `chrome://new-tab-page/`. Edge transformed that incompatible target into invalid `edge://new-tab-page/`; its correct `edge://newtab/` target re-enters the active static override and loops.
- Correction: Keep Chrome's verified target. In Edge, use `about:blank` when the in-extension state disables CanvasTab's New Tab interface, preventing the loop.
- Prevention: Treat browser-internal New Tab URLs as behavior-specific, not merely naming-specific. Verify a candidate target in the actual browser before representing it as a compatible cancellation route.
- Verification: Static syntax checks pass; manually verify the disable/re-enable flow in Chrome and Edge with the unpacked extension.

## 2026-08-20 — Visual-folder navigation was implemented on the wrong surface
- Symptom: The requested **Back to parent** card did not appear in the actual multi-level visual-folder UI. Subsequent changes then made **New Folder** create at the visual root and return the user to that root.
- Root cause: The implementation treated the root `cards-grid` as the visual hierarchy, but visual folders actually render their hierarchy in `modal-cards-grid` with `modalRootFolderId` and `modalActiveFolderId`. A modal-scoped create action was routed through the root-level handler, and the bookmark-tree reload called `refreshMainView()`, which closed the active modal.
- Correction: Render the Back card in `modal-cards-grid` before New Folder. Create directly with `handleCreateSubfolder(modalActiveFolderId)`. When a visual modal is active, refresh that modal after bookmark reload instead of refreshing the visual root.
- Prevention: Before changing a UI flow, trace the actual click path, render target, and state owner. Keep modal-scoped actions and post-mutation refreshes bound to `modalActiveFolderId`; do not reuse root-level handlers without preserving their scope.
- Verification: JavaScript syntax checks, top-level/nested navigation assertions, bookmark-parent assertions, and modal-preserving reload assertions pass. Manually confirm the unpacked extension at more than one visual-folder depth.
