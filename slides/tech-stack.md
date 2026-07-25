---
marp: true
paginate: true
transition: fade
auto-advance: 20
---

<!-- slide 1 -->
# Tech Stack
<!-- 20s -->

| Layer     | Technology                                 |
| --------- | ------------------------------------------ |
| Framework | Vue 3 (Composition API + `<script setup>`) |
| Language  | TypeScript                                 |
| Styling   | Tailwind CSS v4                            |
| Icons     | Lucide Vue (`@lucide/vue`)                 |
| Router    | Vue Router v5                              |
| Backend   | Firebase (Auth, Firestore, Hosting)        |
| Build     | Vite                                       |
| Testing   | Vitest + Vue Test Utils                    |

---

<!-- slide 2 -->
# Agents

**`productivity-coach`** — `.claude/agents/productivity-coach.md`

- Reads `src/views/`, `src/components/`, `src/composables/useTodos.ts`
- Finds UX gaps, missing feedback, empty states, a11y issues, bugs
- Outputs prioritized findings tagged `[UX] [BUG] [FEATURE] [A11Y]` with file:line fixes
- Real run saved as evidence: `feedback/ux-review.md`

---

<!-- slide 3 -->
# Skills

**`context7`** — `.claude/skills/context7/SKILL.md`

- Fetches current library docs (Vue, Firebase, Tailwind) instead of stale training data
- Workflow: `resolve-library-id` → `query-docs`
- Used to verify `useTodos.ts` onSnapshot pattern against official Firebase SDK docs
- Real run saved as evidence: `feedback/context7-proof.md`

---

<!-- slide 4 -->
# Methodology

- Small, focused commits per change
- CLAUDE.md as living project context (architecture notes, commands, gotchas)
- Skill/agent proof kept in-repo, not just claimed
- Feedback-driven: real user tries live app → issues logged → fixed next chapter

---

<!-- slide 5 -->
# Trigger + Commands

**Skill — `context7`**
- Trigger: question mentions a library/framework needing current docs
- Command: ask naturally, e.g. *"how do I use Firestore onSnapshot with TypeScript"*

**Agent — `productivity-coach`**
- Trigger: app-improvement / UX question
- Command: *"how can I improve the app"* / *"review the UX"*

---

<!-- slide 6 -->
# Done checklist

- [x] Skill used with saved proof
- [x] Subagent used with saved proof
- [x] Tech-stack deck (this file)
- [ ] Feedback collected (interview/feedback/issues)
- [ ] report.md filled in team-13 repo
