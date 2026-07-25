# Context7 Skill — Proof of Use

**Skill:** `.claude/skills/context7/SKILL.md`
**Trigger:** asked for current library docs on Firestore realtime sync
**Command run:** context7 MCP `resolve-library-id` → `query-docs`

## Query
"Vue 3 Composition API - how to use onSnapshot with Firestore in a composable" (relevant to `src/composables/useTodos.ts`)

## Resolved library
`/firebase/firebase-js-sdk` (Firebase JavaScript SDK, High reputation, 6240 snippets)

## Docs retrieved (excerpt)
`onSnapshot(query, observer)` attaches a real-time listener for `QuerySnapshot` events. Returns an `Unsubscribe` function — call it to detach the listener. Observer takes `next` and `error` callbacks.

```js
const unsubscribe = onSnapshot(query, {
  next: snapshot => { /* handle update */ },
  error: error => { /* handle error */ }
});
// later:
unsubscribe();
```

## Verified against our code
`src/composables/useTodos.ts:56-68` follows this exact pattern: `onSnapshot(q, successCallback, errorCallback)`, storing the returned unsubscribe fn at module scope and calling it in `cleanup()` / before resubscribing to a new date. Confirmed our usage matches official API — no deviation found.
