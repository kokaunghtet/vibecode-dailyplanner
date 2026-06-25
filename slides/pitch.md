---
marp: true
paginate: true
transition: fade
auto-advance: 20
---

<!-- slide 1 -->
# Who's my person?
<!-- 20s -->

Me — a student who juggles assignments, errands, and deadlines every day but struggles to stay organized, plan ahead, and track what got done.

---

<!-- slide 2 -->
# Their problem

- Tasks scattered across sticky notes, apps, and memory
- No calendar view to see what's coming up
- Hard to track daily progress and completed work
- No motivation to plan the day consistently

---

<!-- slide 3 -->
# What I built

**Daily Planner** — a personal productivity app with:
- Task management per day (add, edit, complete, delete)
- Calendar view to browse and plan tasks by date
- Dark/light mode toggle
- Persistent data per user via Firebase Firestore

---

<!-- slide 4 -->
# How I built it

- **MCP**: `filesystem` + `memory` + `context7` — file access, persistent context, live library docs
- **Skill**: `context7-mcp` — fetches current docs for Vue 3, Firebase, Tailwind instead of stale training data
- **Skill**: `/plan-day` — AI-generated prioritized schedule for today's tasks
- **Agent**: `productivity-coach` — reviews UX gaps, bugs, and improvement opportunities

---

<!-- slide 5 -->
# Why it matters

- **One place** for all daily tasks — no more scattered to-dos
- **Calendar view** — see what's coming up and plan ahead
- **Per-user data** — secure, private task lists via Firebase Auth + Firestore
- **Dark mode** — comfortable planning any time of day

---

<!-- slide 6 -->
# Done checklist

- [x] repo public — github.com/kokaunghtet/vibecode-dailyplanner
- [x] MCP + skill + agent used
- [x] report.md in team repo
