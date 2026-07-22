---
name: api-security-review
description: >
  Security review of REST API endpoint code, focused exclusively on API-level
  vulnerabilities: authentication, authorization, input validation, error
  handling, rate limiting, logging, and related REST best practices.
  Does NOT cover general application security (XSS, dependency vulnerabilities,
  infrastructure, secrets management) — use the built-in /security-review skill
  for that broader scope.

  Use this skill whenever the user asks to review an API for security, audit
  endpoints, check for auth issues, validate input handling in routes, or says
  things like "is this endpoint secure?", "review my API routes", "check my
  auth middleware", "are there authorization holes?", "what security issues
  does my API have?", or "review this controller/handler for security". Also
  invoke proactively when the user shares API route code and security could
  plausibly be a concern — even if they just say "review this".
---

# API Security Review

You are performing a focused security review of REST API endpoint code. Your
job is to find real, exploitable issues — not to produce a checklist of
theoretical concerns. Every finding should be tied to specific code.

## Scope

Review **only** API-level security concerns:

- Authentication
- Authorization
- Input validation & sanitization
- Error handling & information disclosure
- Rate limiting & abuse prevention
- Logging & audit trails
- Additional REST-specific concerns (see below)

Do **not** flag general application security issues like XSS, dependency
vulnerabilities, SSRF, infrastructure configuration, or secrets in env vars —
those are covered by the built-in `/security-review` skill.

## How to conduct the review

1. **Read all relevant code**: routes, middleware, controllers, auth helpers,
   validators. Don't review in isolation — a missing auth check in middleware
   affects all downstream routes.

2. **Follow the data flow**: trace a request from the route definition through
   every middleware and handler to the response. Security gaps often appear at
   handoff points.

3. **Look for what's missing, not just what's wrong**: a handler that never
   checks ownership is an authorization bug even if the code itself is clean.

4. **Only report issues you can substantiate with code**: cite file paths and
   line numbers. Don't speculate about what might be in code you haven't seen.

## Review areas

### Authentication

Check that every non-public endpoint requires a verified identity:

- Is authentication enforced before any business logic runs? (middleware order
  matters — a route registered before auth middleware is unprotected)
- Are tokens/credentials validated properly — signature, expiry, issuer, and
  revocation if applicable?
- Are authentication failures handled consistently without leaking whether a
  user exists (timing attacks, distinct error messages like "wrong password" vs
  "user not found")?
- Are session tokens rotated after privilege changes (login, role escalation)?
- Are credentials (API keys, JWTs) accepted only via headers, never query
  strings? (Query strings appear in logs and browser history)

### Authorization

Check that authenticated users can only access and modify what they own or
are permitted to:

- **IDOR (Insecure Direct Object Reference)**: Does the handler verify that the
  resource being accessed actually belongs to the requesting user, not just that
  the user is authenticated? e.g., `GET /api/orders/:id` without checking
  `order.userId === req.user.id` lets any logged-in user read any order.
- **Privilege escalation**: Can a user promote themselves or others to a higher
  role? Can a regular user reach admin-only endpoints?
- **Missing authorization on mutation endpoints**: POST/PUT/PATCH/DELETE routes
  that only check authentication, not ownership/role.
- Is authorization logic centralized (middleware, policy layer) or scattered
  per-route? Scattered logic is more likely to have gaps.

### Input validation

Check that untrusted data is validated before it's used:

- **Type and format enforcement**: are path params, query params, and body
  fields validated against expected types and formats (not just trusted as-is)?
- **Missing presence checks**: are required fields verified to exist before
  use? Accessing `req.body.id` without checking it exists can yield `undefined`
  flowing into queries or comparisons.
- **Mass assignment**: does the handler assign `req.body` directly to a model
  or database update? This lets callers set fields like `isAdmin`, `role`, or
  `balance` that should never be user-controlled.
- **Numeric bounds**: are integer parameters bounded to prevent resource
  exhaustion (e.g., unbounded `limit` in a paginated query)?
- **Injection vectors**: does user input reach a query, command, or template
  without going through parameterized / prepared forms? (SQL, NoSQL, shell,
  path traversal)
- **Schema validation**: is there a schema validator (Zod, Joi, express-validator,
  Pydantic, etc.) or is validation done ad-hoc? Ad-hoc validation is more error-
  prone and harder to audit.

### Error handling

Check that errors are handled in a way that doesn't leak implementation details:

- **Stack traces in responses**: are raw error objects, exception messages, or
  stack traces returned to the client? They reveal framework versions, file
  paths, and internal logic.
- **Distinguishing errors to clients**: does the API return different error
  messages for "not found" vs "forbidden" in ways that allow enumeration of
  valid IDs or usernames?
- **Unhandled async errors**: are async route handlers wrapped in try/catch (or
  use an async error handling library)? Unhandled promise rejections crash
  processes or go silently unlogged.
- **Default error handler**: is there a catch-all error handler that sanitizes
  error details before they reach the client?
- **HTTP status codes**: are 401 (unauthenticated), 403 (unauthorized), and 404
  (not found) used correctly? Using 404 to hide existence of resources is a
  valid pattern — inconsistency is the issue.

### Rate limiting

Check that endpoints are protected against abuse and resource exhaustion:

- **Authentication endpoints**: login, password reset, OTP verification, and
  token refresh must be rate limited. These are the highest-value brute-force
  targets.
- **Data-fetching endpoints**: unbounded, unauthenticated, or high-cost
  endpoints (large DB queries, file reads, external API calls) need limiting.
- **Rate limit scope**: is limiting per-IP, per-user, or per-key? Per-IP alone
  is bypassable with proxies; per-user is better for authenticated endpoints.
- **Missing entirely**: endpoints with no rate limiting at all — flag these
  even if they seem low-risk; the pattern should be consistent.
- **Headers**: does the API return `X-RateLimit-*` headers so clients can
  back off gracefully?

### Logging & audit trail

Check that security-relevant events are logged with enough context to detect
and investigate incidents:

- **Authentication events**: failed logins, token validation failures, and
  account lockouts should always be logged with IP, timestamp, and identifier.
- **Authorization failures**: every 403 should be logged — they indicate either
  a misconfigured client or an active probe.
- **Mutations on sensitive resources**: creating, updating, or deleting users,
  roles, permissions, financial records, or other sensitive data should produce
  an audit log entry with the actor's identity and the before/after state.
- **PII and credentials in logs**: user passwords, full credit card numbers, SSNs,
  and session tokens must never appear in log output.
- **Correlation IDs**: are requests traceable across logs (request ID in headers
  and log output)? Without this, incident investigation is very slow.

### Additional REST-specific concerns

- **HTTP method enforcement**: does the endpoint reject unexpected methods?
  A route that responds to both GET and POST when only POST is intended may
  expose state-changing behavior without CSRF protection.
- **CORS policy**: is `Access-Control-Allow-Origin: *` used on credentialed
  endpoints, or are origins allowlisted appropriately?
- **Sensitive data in responses**: are responses filtered to return only what
  the caller needs? Returning full user objects (including hashed passwords,
  internal flags, or PII) when only a name is needed violates the principle of
  least exposure.
- **Pagination & resource limits**: are paginated queries bounded server-side
  to prevent a caller requesting millions of rows?
- **Idempotency of mutation endpoints**: for payment or order endpoints, is
  there protection against duplicate submissions?

## Output format

Write a security review in this structure:

```
## API Security Review

### Summary
One paragraph: overall risk posture, highest-severity issues found, and
any systemic patterns (e.g., "authorization checks are missing across all
resource endpoints").

### Findings

#### [CRITICAL | HIGH | MEDIUM | LOW] — <short title>
**Location**: `file.ts:line` (or route/middleware name)
**Issue**: What the vulnerability is and why it matters.
**Exploit scenario**: Concrete example of how an attacker would use this.
**Fix**: What to change, with a code snippet if it makes the fix clearer.

(repeat for each finding, most severe first)

### What looks good
Brief callouts of security controls that are correctly implemented — helps
the developer know what patterns to keep and extend.
```

Severity guide:
- **CRITICAL**: direct data breach, authentication bypass, privilege escalation
  to admin with no pre-conditions
- **HIGH**: IDOR allowing access to other users' data, missing auth on
  sensitive endpoints, mass assignment on privileged fields
- **MEDIUM**: rate limiting absent on auth endpoints, stack traces in errors,
  missing ownership checks on lower-sensitivity data
- **LOW**: missing audit logging, inconsistent error codes, CORS permissiveness
  on non-credentialed endpoints

If you have not seen all the relevant code (e.g., auth middleware is referenced
but not shared), say so explicitly in the summary rather than assuming it's
either present or absent.
