---
name: api-security-review
description: Perform a REST API security audit and return a prioritized Markdown TODO list (High / Medium / Low) of findings only — no code changes. Use this skill whenever the user asks for a security review, security audit, or wants to know whether their API is secure. Triggers on phrases like "security review", "api security", "audit my endpoints", "are my routes secure", "check for vulnerabilities", "review the backend for security issues", or any request to assess the security posture of a backend service — even if the user doesn't explicitly name this skill.
---

## What This Skill Does

You are conducting a read-only security review of a REST API codebase. Your job is to find issues, not fix them. Every finding becomes a line in a prioritized TODO list. You do not suggest code, explain how to fix things, or make changes — only identify what needs attention and why it matters.

---

## Step 1 — Locate the API Code

If the user names specific files, start there. Otherwise discover the relevant code:

- Entry point: look for `server.ts`, `app.ts`, `index.ts`, `main.ts` in `src/` or project root
- Route files: look for `routes/`, `controllers/`, `handlers/`, or route definitions inline in the entry point
- Middleware: look for `middleware/`, auth guards, validation layers, rate limiters
- Config: look for `.env`, `config.ts`, or any place secrets or settings are loaded

Read enough to understand the full request lifecycle — from incoming HTTP request through middleware to response. A route file alone is not enough; you need to see what middleware is applied to it.

---

## Step 2 — Review Each Dimension

Work through all five areas. For each one, note what you found (good or bad) before deciding whether it's a finding.

### 1. Authentication & Authorization

What to look for:
- Which endpoints have no authentication middleware attached?
- Is there a blanket auth guard applied globally, or is auth opt-in per route (the riskier pattern)?
- For endpoints that are protected: does the middleware validate tokens/sessions properly, or does it just check for the header's presence?
- Are there role or permission checks on sensitive operations (admin actions, user data belonging to others)?
- Is there protection against insecure direct object reference — e.g., can user A access `/users/B_id` by just changing the ID?

A finding exists when: an endpoint that handles sensitive data or mutations has no visible auth protection, or when auth is present but trivially bypassable.

### 2. Input Validation

What to look for:
- Path parameters (`:id`, `:slug`, etc.): are they validated for type and format before use? An integer ID passed as a string to a DB query is a finding.
- Query parameters: are unexpected or malformed values handled, or do they pass through to DB/filesystem operations?
- Request bodies: is there schema validation (e.g., Zod, Joi, express-validator), or are fields used directly from `req.body`?
- Are there any places where user input is interpolated into SQL, shell commands, file paths, or HTML without sanitization?

A finding exists when: user-supplied input reaches a sensitive operation (DB query, file read, external service call) without being validated or sanitized.

### 3. Error Handling

What to look for:
- Does the global error handler (or individual catch blocks) send `err.stack`, `err.message`, or other internal details in the HTTP response?
- Do error responses include DB error messages, internal file paths, or config values?
- Are there unhandled promise rejections or missing try/catch around async route handlers that could crash the server or leak info via unhandled rejection messages?
- Does a 404 handler reveal whether a resource exists vs. whether the user is unauthorized (user enumeration)?

A finding exists when: internal implementation details (stack traces, DB schema, file paths, config) can reach an HTTP response body.

### 4. Rate Limiting

What to look for:
- Is any rate-limiting middleware present (e.g., `express-rate-limit`, Nginx limits, API gateway config)?
- Is it applied globally, or only to specific routes?
- Are especially sensitive endpoints — login, signup, password reset, OTP verification — rate-limited separately with tighter limits?
- Is there any IP-based throttling or account lockout after repeated failures?

A finding exists when: a sensitive endpoint has no visible rate limiting, making it vulnerable to brute force or enumeration attacks.

### 5. Logging

What to look for:
- Are authentication failures (wrong password, invalid token, unauthorized access attempts) logged so they can be detected?
- Is request logging middleware logging full request bodies? This can capture passwords, tokens, or other PII in plaintext.
- Are secrets (API keys, tokens, passwords) ever passed in URLs (query params), where they'd end up in access logs?
- Is there any place where sensitive fields from `req.body` or responses are logged verbatim?

A finding exists when: security events that should be logged aren't, or when logging captures data it shouldn't (PII, secrets).

---

## Step 3 — Prioritize Findings

Assign each finding a priority based on exploitability and impact:

**High** — Directly exploitable with low effort, or exposes sensitive data/functionality without authentication. Examples: unauthenticated endpoint that reads/writes user data, unvalidated input in a SQL query, stack traces in 500 responses.

**Medium** — Exploitable under specific conditions, or increases attack surface meaningfully. Examples: missing rate limiting on login, no auth-failure logging, query params passed without validation to a non-DB operation.

**Low** — Defense-in-depth gaps, best-practice violations with low immediate risk. Examples: error messages slightly more verbose than necessary, logging PII that isn't sensitive but shouldn't be there, minor hardening gaps.

When in doubt between High and Medium, ask: "Could an external attacker exploit this without any insider knowledge?" If yes, lean High.

---

## Output Format

Return exactly this structure. Omit a section entirely if there are no findings in it (don't write "No findings" — just leave the section out). If there are no findings at all, say so in one sentence.

```markdown
# API Security Review — [Date or filename]

## High Priority

- [ ] **[Auth]** `GET /admin/users` has no authentication middleware — any caller can access admin user data
- [ ] **[Input]** Path param `:id` in `GET /users/:id` is used in DB query without type validation — accepts arbitrary strings

## Medium Priority

- [ ] **[RateLimit]** No rate limiting on `POST /auth/login` — vulnerable to credential brute force
- [ ] **[Error]** Global error handler returns `err.stack` when `NODE_ENV` is not set — leaks internal paths in ambiguous environments

## Low Priority

- [ ] **[Logging]** Request body logged verbatim in `middleware/logger.ts` — may capture passwords submitted to `POST /auth/login`
- [ ] **[Auth]** Auth middleware checks for header presence but does not validate token signature
```

**Format rules:**
- Every finding is a `- [ ]` checkbox
- The `[Category]` tag is one of: `[Auth]`, `[Input]`, `[Error]`, `[RateLimit]`, `[Logging]`
- Include the specific route, file, or line reference when you can identify it
- One sentence per finding: what is wrong and why it matters — no fix suggestions

---

## Constraints

- Read only. No code changes, no patches, no "here's how to fix this."
- No speculation. If you can't find evidence of an issue in the code, don't report it. Absence of a pattern (e.g., no rate-limit middleware visible) is a finding; imagined risks are not.
- No noise. A finding that applies to essentially all Express apps (e.g., "HTTPS not configured here") without evidence it's actually missing in this deployment is not a finding.
- Scope to the codebase. Don't flag infrastructure or deployment concerns unless you see evidence of misconfiguration in the code itself.
