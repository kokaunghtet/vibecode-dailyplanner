---
description: Add a new task to the Daily Planner for a specific date using natural language
---

The user wants to add a task: $ARGUMENTS

Parse the input to extract:
- Task description (required)
- Target date — if not specified, use today's date (YYYY-MM-DD format)

Then guide the user to add it through the app UI, or explain how the Firestore data model works so they can add it programmatically.

Firestore collection path: `todos/{userId}/dates/{YYYY-MM-DD}/items/{autoId}`
Fields: `text` (string), `completed` (boolean), `createdAt` (timestamp)

Confirm the task details and date before finalizing.
