# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Daily Planner — Vue 3 + Firebase productivity app. Plan/track tasks per date with a calendar view.

## Commands

```bash
npm run dev                          # dev server (Vite)
npm run build                        # vue-tsc typecheck + vite build
npm run preview                      # preview built app
npm test                             # vitest run (all tests, once)
npm run test:watch                   # vitest watch mode
npx vitest run src/composables/useTodos.test.ts   # single test file
npm run deploy                       # build + firebase deploy

# Firebase Functions (functions/ is a separate npm workspace)
cd functions && npm run build        # tsc compile to lib/
cd functions && npm run serve        # build + local emulator
firebase deploy --only functions
firebase deploy --only hosting
firebase deploy --only firestore:rules
```

No lint script configured; type errors surface via `vue-tsc` in `npm run build`.

## Architecture

- **Auth gate lives in the router, not in views.** `src/router/index.ts` awaits a module-level `authReady` promise (resolved once by the first `onAuthStateChanged` callback in `src/composables/useAuth.ts`) before evaluating `requiresAuth`/`requiresGuest` route meta. Any new route needing auth must set `meta: { requiresAuth: true }`; there is no per-component guard.
- **`useAuth`, `useTodos` are singletons, not factories.** State (`user`, `todos`, etc.) is declared at module scope and `onAuthStateChanged`/Firestore listeners are wired up once at import time — every component calling `useAuth()`/`useTodos()` shares the same reactive state. Don't expect per-call isolation; when writing tests, mock `firebase/auth` / `firebase/firestore` before importing the composable.
- **Firestore sync is realtime, not request/response.** `useTodos.ts` subscribes with `onSnapshot` scoped to `users/{uid}/todos`; task CRUD writes to Firestore and the UI updates via the listener, not via local state mutation after the write resolves.
- **Data model**: `users/{userId}/todos/{todoId}` — `{ text, completed, date (YYYY-MM-DD), createdAt, updatedAt }`. Firestore rules (`firestore.rules`) restrict all reads/writes to `request.auth.uid == userId`; there is no shared/public data.
- **`functions/` is an independent TS project** (own `package.json`, `tsconfig.json`, compiles to `functions/lib/`) — not part of the Vite build graph. Cloud Functions source is `functions/src/index.ts`.
- **Routing structure**: `/login` (guest-only) and `/` → `AppShell.vue` (authenticated shell) with children `Today` (`/`) and `Calendar` (`/calendar`). Add new authenticated views as children under the `AppShell` route, not as top-level routes, to inherit the shell layout and auth guard.
- Styling is Tailwind v4 via `@tailwindcss/vite` (no separate `tailwind.config` build step); dark/light mode is toggled via `ThemeToggle.vue`.

## Claude Code Setup

- **MCP servers** (`.mcp.json`): filesystem, memory (cross-session context), context7 (live docs).
- **Skills** (`.claude/skills/context7-mcp`): fetch current docs for Vue/Firebase/Tailwind via Context7 instead of relying on training data — use `resolve-library-id` → `query-docs`.
- **Slash commands** (`.claude/commands/`): `/plan-day` (prioritize today's tasks), `/add-task <description>` (NL task parsing), `/design [area]` (frontend design audit — consistency, responsiveness, dark mode, a11y).
- **Sub-agent** (`.claude/agents/productivity-coach`): reviews components/composables for UX gaps and productivity improvements, triggered by "how can I improve the app" style requests.

## Commit messages

After finishing a task, generate a one-line commit message summarizing the change (Conventional Commits style, e.g. `fix(feed): restore scroll position on back nav`). Do this every time work is done, even if not asked.