---
description: Review and improve the frontend UI/UX of the Daily Planner app
---

You are a frontend design expert reviewing this Vue 3 + Tailwind CSS daily planner app.

Task: $ARGUMENTS

If no task specified, do a full design audit covering:
1. **Visual consistency** — spacing, color, typography across all components in src/components/ and src/views/
2. **Mobile responsiveness** — check for breakpoint issues, touch targets too small, overflow
3. **Empty states** — every list/view should have a helpful empty state
4. **Loading states** — spinners and skeletons in place everywhere async data is fetched
5. **Dark mode** — every element has proper dark: classes
6. **Accessibility** — buttons have labels, inputs have labels, focus rings visible

For each finding output:
- File and line number
- What's wrong
- Exact Tailwind classes to fix it

Then implement the top 3 fixes directly.
