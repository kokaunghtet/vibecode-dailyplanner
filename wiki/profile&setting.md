# Plan: Profile & Settings Pages

## Context

The user dropdown in `AppShell.vue` already renders **Profile** and **Settings** items, but they are dead (`@click="closeUserMenu"` only). This plan builds the two real pages and wires their controls to real behavior.

Decisions from grilling:
- **Profile** = account info + productivity stats.
- **Settings** = Notifications + Account actions + App preferences (theme stays in navbar).
- **App preferences** = week-start day, default landing view, date format — all wired to actually take effect.
- **Account mutations** (display name, password, delete) = real Firebase calls, with an **in-app reauth prompt** for password/delete.

## How to use this plan
Phases are ordered by dependency and each ends with a commit — safe to stop after any phase. Check off boxes as you go. To resume: find the first unchecked box.

## Reuse map (read before starting)
- `useAuth.ts`: `{ user, loading, register, login, logout, resetPassword }` + `authReady`. `user` is raw Firebase `User` (`uid, email, displayName, photoURL, emailVerified, metadata.creationTime`). `auth` exported from `src/firebase.ts`.
- `useTheme.ts`: the localStorage `ref`+`watch` pattern to mirror for `usePreferences.ts`.
- `useNotifications.ts`: `{ permission, token, requestPermission, isLoading, isSupported }`.
- `useTodos.ts`: single-date only (`subscribeToDate`) — no all-dates query; add one.
- Router children: `src/router/index.ts` lines 15-26; new children inherit `requiresAuth`, render in AppShell `<router-view/>`.
- Styling: card `bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6`; wrapper `max-w-2xl mx-auto`; heading `text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white`; muted `text-gray-500 dark:text-gray-400`; icons `@lucide/vue`.

---

## Phase 1 — Foundation composables (no UI) ✅ DONE
- [x] `src/composables/usePreferences.ts` (new): mirror `useTheme.ts` (module-level localStorage refs + `watch`). Keys `pref_weekStart` (`'sun'|'mon'`, default `'sun'`), `pref_landingView` (`'today'|'calendar'`, default `'today'`), `pref_dateFormat` (`'en-US'|'en-GB'`, default `'en-US'`). Export writable refs `{ weekStart, landingView, dateFormat }`.
- [x] `useAuth.ts`: import from `firebase/auth` `updateProfile, updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider`. Add `updateDisplayName(name)`, `reauth(currentPassword)`, `changePassword(current, next)` (reauth→updatePassword), `deleteAccount(current)` (reauth→deleteUser). Export them.
- [x] `useTodos.ts`: add `getAllTodos()` — one-time `getDocs` on `collection(db,'users',uid,'todos')` (no `where`). Returns all todos for stats.
- [x] `npm run build` clean.
- [x] Commit: `feat(auth): add profile/password/delete methods and preferences+stats composables` (a7f7370)

## Phase 2 — Wire preferences into existing app ✅ DONE
- [x] `utils/calendar.ts`: `getMonthGrid(year, month, weekStart = 'sun')` — optional param (keeps `calendar.test.ts` passing); leading pad = `(startDayOfWeek - weekStartIndex + 7) % 7`. Also `formatDisplayDate(dateStr, locale = 'en-US')` optional locale.
- [x] `CalendarView.vue:12`: pass `weekStart.value` to `getMonthGrid`.
- [x] `CalendarGrid.vue:14`: reorder `dayHeaders` based on week-start pref.
- [x] `TodoPanel.vue:40`: pass `dateFormat.value` to `formatDisplayDate`.
- [x] Landing view: add helper `landingRouteName()` (from `landingView`); use in `LoginView.vue:34,45` and `router/index.ts:48` redirects.
- [x] `calendar.test.ts`: add a `getMonthGrid(2026, 5, 'mon')` ordering case.
- [x] `npm run build` green. `npm test`: 6 pre-existing failures in `useTodos.test.ts` (unrelated mock issue, confirmed present before this phase via `git stash` check) — not a regression; new mon-week test passes.
- [x] Commit: `feat(prefs): wire week-start, landing view, and date format` (6ee9539)

## Phase 3 — Reauth modal ✅ DONE
- [x] `src/components/ReauthModal.vue` (new): current-password input, Confirm/Cancel, `submitting` prop (parent-controlled), `#extra` slot. Card + dark-mode styling. Reused by password-change and delete-account.
- [x] `npm run build` clean.
- [x] Commit: `feat(auth): add reauthentication modal component` (bc22f72)

## Phase 4 — Profile page ✅ DONE
- [x] `src/views/ProfileView.vue` (new): account card (avatar initial, inline-editable display name → `updateDisplayName`, email, `emailVerified` badge, member-since from `metadata.creationTime`); stats card (total / completed / completion rate / active days from `getAllTodos()`, with loading state).
- [x] `npm run build` clean.
- [x] Commit: `feat(profile): add Profile page with account info and task stats` (59b37ae)

## Phase 5 — Settings page ✅ DONE
- [x] `src/views/SettingsView.vue` (new), sectioned cards:
  - Notifications: status from `permission`; enable → `requestPermission()`; respect `isSupported`/`isLoading`; note "manage in browser" when granted (no disable fn).
  - App preferences: week-start, landing view, date format bound to `usePreferences` refs.
  - Account: Change password (ReauthModal → new-password → `changePassword`), Sign out (`logout`+redirect), Delete account (danger zone, ReauthModal → `deleteAccount` → redirect Login).
- [x] Renamed `ReauthModal`'s `#error` slot to `#extra` (also used to inject non-error fields like new-password).
- [x] `npm run build` clean.
- [x] Commit: `feat(settings): add Settings page (notifications, preferences, account actions)` (25166b7)

## Phase 6 — Routes + nav wiring ✅ DONE
- [x] `router/index.ts` children: add `profile`→ProfileView, `settings`→SettingsView (lazy imports).
- [x] `AppShell.vue` dropdown: Profile/Settings buttons now call `goToProfile`/`goToSettings` (closeUserMenu + router.push), matching the Logout pattern.
- [x] `npm run build` clean — ProfileView/SettingsView now real lazy chunks.
- [x] Commit: `feat(nav): wire dropdown Profile/Settings links to new routes` (f7526db)

## Phase 7 — End-to-end verification ✅ DONE
Drove the real app via chrome-devtools MCP against the local dev server (registered a throwaway test account, deleted it at the end):
- [x] Dropdown → Profile navigates correctly; account info renders; stats show 0/0/0%/0 for a fresh account.
- [x] Edit display name → real `updateProfile` call → survived a full page reload.
- [x] Settings → week-start "Monday" → Calendar headers reorder to Mon..Sun, first cell shifts to June 29 (correct pad calc).
- [x] Settings → date format "UK" → TodoPanel header shows "Saturday 25 July" (day-before-month).
- [x] Settings → landing view "Calendar" → signed out, signed back in → landed directly on `/calendar` (confirms both `LoginView` push and the router's `requiresGuest` redirect use the pref).
- [x] All 3 preferences persisted correctly after re-login (read back from Settings).
- [x] Change password: wrong current password → "Current password is incorrect" shown, modal stays open; correct current password → modal closes, "Password updated" shown.
- [x] Delete account: reauth with the new password → account deleted, redirected to `/login`.
- [x] `npm test`: same 6 pre-existing `useTodos.test.ts` failures as the pre-change baseline (verified via `git stash` diff) — no regressions introduced across any phase.

All 7 phases complete. Profile and Settings pages are live, routed, and linked from the nav dropdown.

## Files
New: `usePreferences.ts`, `ReauthModal.vue`, `ProfileView.vue`, `SettingsView.vue`.
Modified: `useAuth.ts`, `useTodos.ts`, `utils/calendar.ts`, `CalendarGrid.vue`, `CalendarView.vue`, `TodoPanel.vue`, `LoginView.vue`, `router/index.ts`, `AppShell.vue`.
