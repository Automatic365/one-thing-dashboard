# Regression Checklist (Core Flows)

Use this before deploying to Hosting to catch the “wipe/revert” class of bugs and UI regressions quickly.

## Setup
- Use `Settings → Load Demo Data` for fast coverage.
- If testing on `localhost`, confirm which mode you’re in:
  - Local-only: default on localhost (safe)
  - Cloud-sync: add `?cloud=1` (writes to Firestore)

## Data Safety / Sync
- Cloud user signed-in: `Dashboard` loads without wiping/reverting state.
- Make a small edit (any goal text) and verify:
  - Navbar shows `Last save` updates.
  - In cloud mode, `Last sync` updates after a moment.
- If you see `Cloud sync error`, verify it’s actionable (not silent) and dismiss works.

## Goals (Life Areas)
- Add a life area from Goals:
  - `Add Area` modal appears above everything and is clickable.
  - Selecting an area closes the modal immediately.
- Remove a life area from Goals:
  - The `×` control exists on selected areas and actually deactivates the area.

## Dashboard (Daily ONE Thing)
- For each active life area:
  - Set/edit today’s daily ONE Thing directly from the Dashboard.
  - Refresh the page; verify the text persists.
- Mark today complete, then uncomplete; verify the UI reflects both states.

## Progress
- Completing a daily ONE Thing on Dashboard is reflected in `Progress` immediately.
- Date switching: historical completion entries render correctly.
- Filters: switching between `All` and a specific life area updates totals and charts correctly.
- Month calendar: clicking a day shows details and notes (create/edit persists after refresh).
- Streaks/sparkline: per-area streaks and the trend sparkline render without errors.

## Settings
- `Load Demo Data` populates across Dashboard/Goals/Progress.
- `Clear All Data` resets state and returns to a clean “new user” state.
- Export/Import round-trip:
  - Export data, clear, import; verify key data returns (goals + daily history + active areas).
- Storage monitor:
  - Storage section renders (no exceptions) and shows current usage.
  - Archiving older history reduces usage and does not break current-month views.
- Cloud mode diagnostics (if enabled):
  - Online/offline indicator changes when toggling network.
  - Sync log populates and `Retry save` is available after a simulated failure.

## Reflection
- Monthly review save/load per area still works.
- Quarterly review save/load per area still works.
- Reflection history:
  - History browser loads and filters by life area.
  - Opening a past reflection shows correct content.
- Obstacles:
  - Add/edit/pin an obstacle; it persists after refresh.
  - Weekly focus and attempt timeline render and link to day notes when present.
