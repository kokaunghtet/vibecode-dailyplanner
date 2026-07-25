<!-- Feedback template. Copy to your repo (e.g. feedback/feedback.md), fill, link in report.md.
     Use ONE of: interview / feedback / open-issues. This one = written feedback you collected. -->

# User Feedback — Daily Planner

- **How collected:** chat, 1 person
- **When:** 2026-07-25

## Raw feedback

1. Duplicate tasks appear when a user adds a new to-do task.
2. Duplicate tasks appear when a user adds a new to-do task.
3. Existing to-do tasks are not displayed after the user logs in.

## Themes (what keeps coming up)

- Task list state is unreliable — duplicates on add, missing tasks after login. Points to a bug in the realtime sync/caching in `useTodos.ts` (cache/subscription handling around `subscribeToDate`).

## Top 3 things to fix

- [ ] Fix duplicate task creation on add-todo
- [ ] Fix tasks not loading/displaying after login
- [ ] Add regression test covering add + re-login flow for `useTodos.ts`
