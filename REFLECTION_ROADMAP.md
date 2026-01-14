# Reflection & Planning Features Roadmap

## Overview
Add structured reflection and planning features based on The ONE Thing Planner to help users maintain accountability and adjust course monthly/quarterly.

## Phase 0: Platform Stability & Release Hygiene (MOSTLY COMPLETED)

These items are foundational and help prevent regressions like data wipes/reverts in production.

### Features
- **Cloud Sync Hardening**:
  - Prevent stale Firestore snapshots from overwriting newer local state
  - Add lightweight document metadata (`clientId`, `updatedAt`) to support conflict avoidance
  - Improve migration idempotency to prevent write loops
- **Visible Sync Status**:
  - Clear indicator for local-only vs cloud-sync mode
  - Last sync / last save timestamps
  - Actionable error banner when writes fail (with retry guidance)
- **Testing / QA**:
  - Regression checklist for core flows (Goals add/remove, Dashboard set/complete, Progress reflects completion, Import/Export, Firebase login/sync)
  - “Demo data” seeding to quickly validate UI across views

### Status (Phase 0)
- Cloud sync hardening: ✅ shipped
- Visible sync status: ✅ local/cloud indicator + last save/sync + error banner shipped (retry guidance: optional enhancement)
- Testing / QA: ✅ `REGRESSION_CHECKLIST.md` + demo data shipped

## Phase 1: Monthly Review (COMPLETED)

### Features
- New "Reflect" tab in navigation ✓
- 5 monthly reflection questions per life area: ✓
  1. What's one thing you accomplished last month that made everything else easier or unnecessary?
  2. What's one thing you can do differently this month that will make everything else easier or unnecessary?
  3. What priorities can you accomplish this month to feel like you're on track for your annual goals?
  4. What three things are most likely to stop you from accomplishing your priorities?
  5. What's one solution for each?

### Implementation Details (v1 - Simple)
- One review per month per active life area ✓
- Reviews saved with timestamp to Firebase/localStorage ✓
- Manual load/save with buttons (no automatic loading) ✓
- Form clears when switching life areas (prevents data mixing) ✓
- Simple form interface with life area selector ✓
- Optional and non-intrusive ✓

### Future Enhancements for Phase 1
- **Auto-load existing review**: Automatically load the current month's review when switching life areas instead of clearing the form (requires careful React.useEffect implementation to avoid state corruption)
- **View history of past reviews**: Add ability to browse and view previous months' reviews
- **Visual indicator on tab**: Show badge on Reflect tab during first 7 days of month to encourage timely reflection
- **Progress tracking**: Show completion status for monthly reviews across all active areas

### Data Structure
```javascript
{
  lifeAreas: {
    [areaKey]: {
      reviews: {
        monthly: [
          {
            date: '2026-01',
            accomplished: 'text',
            doDifferently: 'text',
            priorities: 'text',
            obstacles: ['obstacle1', 'obstacle2', 'obstacle3'],
            solutions: ['solution1', 'solution2', 'solution3']
          }
        ]
      }
    }
  }
}
```

## Phase 2: Quarterly Review (COMPLETED)

### Features
- Quarterly "Do Less. Achieve More." review ✓
- Prompted every 3 months (Q1: Jan-Mar, Q2: Apr-Jun, Q3: Jul-Sep, Q4: Oct-Dec) ✓
- Specific reflection prompts for each quarter (from the planner) ✓
- "Actions to take" checklist ✓
- Review alignment between quarterly goals and annual ONE Thing ✓

### Implementation Details
- New "Reflection" parent component with Monthly/Quarterly toggle ✓
- Data stored in `lifeAreas[areaKey].reviews.quarterly` ✓
- Quarterly variations (Q2: 25% goal check, Q3: 50% goal check) ✓
- High-tech neon UI consistent with the rest of the app ✓

## Phase 3: Dashboard & UX Enhancements (COMPLETED)

### Features
- **Dashboard Goal Entry**: Ability to set/edit the daily goal directly from the Dashboard card ✅
- **Smart Progress Tracking**: Reverting a completion accurately updates the progress history/calendar ✅
- **Reminders & Notifications**:
  - Monthly reflection reminder on the last day of the month ✅
  - Quarterly reflection reminder on the last day of the quarter ✅
  - Visual cues/badges when a review is due ✅

### Additional UX Enhancements (ADDED)
- **Per-Life-Area Progress Views**:
  - Filters for date range (7/30/90 days) ✅
  - Optional “All areas vs selected area” toggles ✅
  - Breakdown charts by life area (optional future enhancement)
- **Dashboard Editing Polish**:
  - Better “saved” feedback and keyboard-friendly interactions ✅
  - Optional autosave debounce (avoid writing on every keystroke) ✅
  - Quick-set templates for daily goals (use Week/Month/Year + Copy Yesterday) ✅

## Phase 4: Enhanced Calendar View (COMPLETED)

### Features
- Monthly calendar layout in Progress tab ✅
- Visual accountability tracking (completed days highlighted) ✅
- Ability to add notes/context to specific days ✅
- Click a day for details (completions + note) ✅

### Implementation Notes
- Integrates with existing `All vs specific life area` + `7/30/90` filters
- Notes are stored in app state and sync in cloud mode

## Phase 4B: Obstacles & Solutions Tracking (COMPLETED)

### Features
- Dedicated section to track recurring obstacles ✅
- Suggested solutions based on past successes (via aggregation) ✅
- Track which solutions actually work over time (pinned items + tried/worked counters) ✅
- Pattern recognition for common blockers (aggregation across monthly reviews) ✅

### Implementation Notes
- Implemented as `Reflect → Obstacles` view with scope (All vs specific life area)

## Phase 5: Post‑Phase‑4 Improvements (NEXT)

### Release Hygiene / Safety
- Add a visible build/version stamp in Settings/About to confirm what’s deployed
- Add “export first” nudges before destructive operations (e.g., clear/reset in cloud mode)
- Expand sync diagnostics / retry guidance (keep it simple, avoid noisy UI)

### Reflection History
- Monthly review history browser (by month, per life area)
- Quarterly review history browser (by quarter, per life area)
- Completion status overview across active areas (which reviews are done/missing)

### Progress Deep Dive
- Per-area streaks and trend charts (7/30/90), optionally overlay notes
- “Day detail” view improvements (show completions across areas when scoped to All)

### Obstacles Tracker Upgrades
- Link pinned obstacles to specific day notes / dates tried (lightweight timeline)
- Add “recommended solution this week” workflow (pick one solution to focus on)

## Design Principles

1. **Non-Intrusive**: Reviews available but not blocking daily workflow
2. **Contextual**: Show reminders when due, hide when not needed
3. **Historical**: Always able to view past reviews for learning
4. **Actionable**: Reflections should directly inform goal adjustments
5. **Progressive**: Each phase builds on the previous, can be added independently

## Success Metrics

- Monthly review completion rate
- Time spent in reflection vs goal execution
- Correlation between reviews and goal achievement
- User feedback on value of reflection process

---

**Status**: Phase 1–4 complete (Phase 0 mostly complete). Phase 5 next priority.
**Last Updated**: January 14, 2026
