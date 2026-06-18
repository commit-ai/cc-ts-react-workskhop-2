# Session Analysis: `/goal` Command Demo

## Facts

- **Distinct attempts/iterations:** 2. The agent completed the implementation in one pass, then was blocked by the stop hook and made a second attempt to satisfy the missing evidence requirements (running tests to demonstrate filter and state behavior).
- **Stop hook triggered:** Yes — once. The hook fired after the agent's first completion attempt and provided detailed feedback explaining exactly what was missing (live evidence of filter, loading, empty, and error states).
- **Approximate session length:** ~10–15 minutes of wall-clock time across the two turns.

---

## Scores

### 1. How effectively does this task demonstrate the `/goal` command?
**Score: 7/10**

The hook fired once and the feedback was precise and actionable, which is the core mechanic `/goal` is meant to showcase. The agent correctly interpreted the feedback, pivoted to a test-based evidence strategy, and cleared the hook on the second attempt. However, the first attempt was quite close to complete — the gap was narrow (missing test/console evidence, not a missing feature). A stronger demo would have the hook fire earlier or more dramatically, making the "agent kept going because the goal wasn't met" story more visceral for an observer.

### 2. How realistic were the demands in the original prompt?
**Score: 8/10**

The feature request (Activity Log panel with a backend endpoint, table rendering, path filter, and four UI states) is a realistic, self-contained full-stack task. The evidence requirements in condition 4 are also reasonable — asking for curl output and some demonstration of behavior mirrors real acceptance criteria. The one slightly artificial element is requiring evidence of states that are transient (loading, empty, error) without specifying how; this pushed the agent toward writing tests rather than browser screenshots, which is a valid but indirect proof.

### 3. Will this be a good learning experience for workshop participants?
**Score: 6/10**

Participants will clearly see:
- `/goal` sets a condition that the agent works toward autonomously.
- The stop hook intercepts the agent before it can finish if the condition isn't met.
- The hook's feedback message is specific and actionable, not just a binary block.

What is less clear from this session:
- The agent never narrated *why* it was continuing after the hook fired — it just received the hook feedback as a user message and kept going. Participants may not immediately connect the hook message to the `/goal` mechanism without explanation.
- The two-turn structure is clean, but the second turn is mostly test-writing, which shifts focus away from the goal/hook interplay and toward Jest mechanics. A session where the hook fires mid-feature (e.g., missing a required field in the API response) would make the loop more intuitive.

Overall this is a solid but not exemplary demo: the hook fires, the agent responds correctly, and the goal is eventually met — but the story requires some narration to land for a workshop audience.

---

## How to Improve the Task

The core design principle: the goal condition should be written so that the *most natural first implementation* fails it, forcing at least one visible loop before the hook clears.

### Measure 1 — Make the hook fire on a real gap, not a paperwork gap

The current condition 4 (evidence) is what tripped the agent, but it's easy to satisfy in one test file. A better design embeds proof requirements *inside* the feature requirements so the hook fires on a missing capability:

- Require `/activity` to support `?path=` server-side filtering. The agent will almost certainly implement client-side filtering first; the curl check will expose it and the hook will fire.
- Require that calls to `/activity` itself are never recorded. Easy to forget, and a concrete runnable check catches it.

### Measure 2 — Specify the exact verification method

Instead of vague "show evidence of states", name the exact command:

> Run `curl http://localhost:3000/activity?path=/api` and show that only `/api` routes appear in the result.

This keeps the task realistic (curl is a real developer workflow) and removes ambiguity about what counts as proof.

### Measure 3 — Create a two-phase story

Use a deliberate constraint that conflicts with the obvious implementation so the loop is the center of the story, not a footnote:

1. Agent ships client-side filtering → hook fires on the curl check for `?path=`.
2. Agent adds server-side filtering → hook clears.

Two visible loops make `/goal` the protagonist. One loop where the gap is a missing test file makes it a footnote.

---

## Improved Task: Version A (prompt to copy and paste)

For use when the workshop leader wants to demonstrate `/goal` directly.
Participants run this verbatim and observe the loop.

```
Add an Activity Log panel to the existing React frontend that fetches
historical request data from a new backend endpoint.

The goal is complete when ALL of the following hold:

1) GET /activity returns a JSON array of objects, each with:
   - id (string)
   - method (string, e.g. "GET")
   - path (string)
   - timestamp (string, ISO 8601)
   - status (number, HTTP status code)

2) GET /activity accepts an optional ?path= query parameter that
   filters results to entries whose path contains the value
   (case-insensitive). Example:
     GET /activity?path=/api  →  only entries where path includes "/api"
   Filtering happens server-side.

3) Calls to /activity itself are never recorded in the log.
   Verify this: call GET /activity three times in a row, then call it
   a fourth time and confirm the array length has not grown by 3.

4) The React app shows an "Activity Log" section that:
   - fetches from /activity on mount
   - renders a table with columns: method, path, timestamp, status
   - has a text input that filters by path; typing updates the ?path=
     query parameter sent to the server (not a client-side filter)
   - shows loading, empty, and error states

5) The transcript includes curl evidence for each of the following:
   a) GET /activity returns the correct array shape
   b) GET /activity?path=/api returns only matching entries
   c) Three consecutive calls to GET /activity do not cause the log
      to grow (show the array length before and after)

Do not redesign unrelated parts of the app or change existing routes.
```

**Why the hook is likely to fire:**
- Server-side filtering — the agent's instinct is client-side; the curl check in 5b exposes it.
- Self-exclusion — easy to forget; condition 3 and 5c is a concrete, runnable check that catches it.
- curl-specified evidence — removes ambiguity so the hook fires on a real gap rather than a judgment call.

---

## Improved Task: Version B (participants craft their own prompt)

For use as a late-stage exercise when participants have already seen `/goal` in action
and should practice writing goal conditions themselves.

### The ticket (`TASK.md`)

```markdown
## Ticket: Activity Log Panel

**Summary**
Add an Activity Log feature so developers can see which API requests
have been made to the server during a session.

**Backend**
- Add a GET /activity endpoint that returns a log of all requests
  the server has handled, as a JSON array.
- Each entry must include: a unique id, the HTTP method, the path,
  the timestamp (ISO 8601), and the HTTP status code.
- Requests to /activity itself must not appear in the log.
- The endpoint must accept an optional `?path=` query parameter
  and return only entries whose path contains that string
  (case-insensitive). Filtering must happen on the server.

**Frontend**
- Add an "Activity Log" section below the existing content.
- It should fetch from /activity when the component mounts.
- Render the results in a table: method, path, timestamp, status.
- Include a text input that filters by path. When the user types,
  re-fetch from the server using ?path= rather than filtering
  client-side.
- Handle loading, empty (no requests yet), and error states visibly.

**Out of scope**
Do not modify existing routes or redesign unrelated parts of the UI.
```

### The lab guide page

```
Task 5 — Write your own goal

You've seen /goal in action. Now you'll write the prompt yourself.

Read the ticket in TASK.md. Your job is to translate it into a
/goal prompt that Claude will work toward autonomously — and that
the stop hook will actually enforce.

A few things to consider before you write it:

  • What does "done" look like? State it in terms Claude can verify,
    not just implement.

  • The stop hook can only block on evidence in the transcript.
    What would you ask Claude to run or show to prove each
    requirement is met?

  • Think about which requirements Claude is most likely to skip or
    get wrong on the first attempt. Make sure your goal condition
    catches those.

When you're ready, type:

  /goal <your prompt here>

There's no single right answer. We'll compare prompts as a group
after everyone has run their session.
```

**Why this version works for late-stage learning:**
- Participants must decide what counts as evidence — that's where the insight about `/goal` lands.
- The ticket is ambiguous in the way real tickets are (it doesn't say "run curl", it says "filtering must happen on the server"). Participants who write weak goal conditions will see the hook *not* fire when it should, which is itself a teaching moment.
- The group debrief lets the facilitator reveal the Version A prompt as a reference — *after* participants have struggled with it, not before.
