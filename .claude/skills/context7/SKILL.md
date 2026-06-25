---
name: context7
description: Fetch up-to-date library documentation using Context7 CLI
license: MIT
---

## What I do

I help you get accurate, up-to-date documentation for any library or framework using Context7.

## Commands

### Search for a library
```bash
ctx7 library <library-name> "<query>"
```
Returns matching libraries with their IDs.

### Get documentation
```bash
ctx7 docs <library-id> "<query>"
```
Retrieves relevant documentation for a specific library.

## When to use me

Use me when:
- You need library/API documentation
- Generating code that uses specific libraries
- Looking for setup or configuration steps
- Need version-specific code examples

## Example workflow

1. Search for the library:
   ```bash
   ctx7 library nextjs "middleware authentication"
   ```

2. Get docs using the returned library ID:
   ```bash
   ctx7 docs /vercel/next.js "how to create middleware for auth"
   ```

## Tips

- Use the library ID format: `/org/project` (e.g., `/vercel/next.js`)
- Specify versions in your query for version-specific docs
- API key recommended: get one at https://context7.com/dashboard

## Installation

```bash
npm install -g ctx7
```
