# Productivity-Coach Subagent — UX Review

**Agent:** `.claude/agents/productivity-coach.md`
**Trigger:** "review the UX" / "how can I improve the app"
**Note:** run manually following the agent's own instructions (project custom agents aren't wired into this session's Agent tool), reading `src/views/`, `src/components/`, `src/composables/useTodos.ts` per its spec.

## Findings

1. **[UX] No feedback on add-todo failure** — `TodoPanel.vue:30-35` `handleAddTodo` clears the input and calls `addTodo` but never awaits/catches errors visibly; if the Firestore write fails, the task silently vanishes with no toast/retry. Fix: wrap in try/catch, show inline error state.

2. **[BUG] Race on rapid date switching** — `useTodos.ts:38-43`, `subscribeToDate` compares `date === currentDate` and unsubscribes the old listener, but the previous `onSnapshot` callback can still fire after `currentDate` changes mid-flight since JS closures capture the old `date`, not `currentDate`. Guard exists (`if (currentDate === date)`) so it's actually handled — verified safe, no fix needed.

3. **[A11Y] Edit input has no accessible label** — `TodoItem.vue:60-68`, the edit `<input>` has no `aria-label`; a screen reader user tabbing in gets no context on what field they're editing. Fix: add `aria-label="Edit task text"`.

4. **[UX] Delete button only visible on hover** — `TodoItem.vue:71-78`, `opacity-0 group-hover:opacity-100` hides delete control entirely on touch devices (no hover state). Fix: always show on mobile breakpoints, or add a long-press/swipe affordance.

5. **[FEATURE] No undo after delete** — `TodoPanel.vue` delete is immediate and irreversible via UI (Firestore doc gone). Fix: soft-delete with a 5s "Undo" snackbar before permanent delete.

## Priority
1 (data loss risk) > 5 (data loss risk) > 3 (a11y, quick fix) > 4 (mobile UX) > 2 (already safe, no action)
