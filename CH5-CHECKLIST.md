# Ch-5 Submission Checklist — Daily Planner

Two repos: Steps 1-5 here (`ch3personalproject`), Step 6 in team repo (`team-13`).

## Phase 1 — Confirm existing repo + live URL
- [ ] Confirm Ch-4 live/download URL still works (Firebase hosting link)
- [ ] Confirm repo pushed, no uncommitted changes

## Phase 2 — Skill + Subagent proof (files exist ✅, need to CHECK actually used)
- [x] Skill present: `.claude/skills/context7/`
- [x] Subagent present: `.claude/agents/productivity-coach.md`
- [ ] Actually invoke both at least once this chapter, keep evidence (e.g. transcript/commit note)

## Phase 3 — List AI tools used
- [ ] Write short list: tool → what it did for you (Context7, subagent, claude-mem, etc.)
- [ ] Save for pasting into `report.md` later

## Phase 4 — Trigger + Command doc
- [ ] For `productivity-coach` agent: write trigger (when it fires) + exact command/phrase
- [ ] For `context7` skill: write trigger + exact command/phrase

## Phase 5 — Tech-stack slide deck
- [x] `slides/` dir exists (intro.md, pitch.md)
- [ ] Create `slides/tech-stack.md` — one idea per page: tech stack · agents · skills · methodology · trigger · commands
- [ ] Use file path in repo, NOT a hosted URL

## Phase 6 — Get feedback (pick ONE)
- [ ] Choose: interview-template.md OR feedback-template.md OR issues-template.md
- [ ] Copy chosen template from `team-13/ch-5/` into this repo (e.g. `feedback/`)
- [ ] Get real user to try live link, fill template
- [ ] Note top issue(s) — carries to Ch-6 fixes

## Phase 7 — Fill report.md (TEAM repo, not this one)
- [ ] `cd team-13`, `git checkout main && git pull`
- [ ] `git checkout -b <yourname>/ch-5`
- [ ] copy `ch-5/_TEMPLATE.md` → `ch-5/<your-github-username>/report.md`
- [ ] fill all sections (project, AI tools, skill/subagent, trigger/command, slides path, feedback path)
- [ ] commit, push, open PR

## Phase 8 — Self-check + submit
- [ ] `bash doctor.sh ch-5` in team repo → all green
- [ ] Post done in `#ch-5` Discord channel
