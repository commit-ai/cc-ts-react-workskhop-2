# Bonus Task 1 – Handoff Notes for Exercise Author

This document captures everything that went wrong when this task was first run end-to-end, split by who needs to act on it.

---

## Fixes needed in the task instructions

### 1. ESM vs CommonJS — harness fails to start

**What happened:** Claude generated the script using ES module syntax (`import`, `fileURLToPath`). Node.js rejected it because there is no `package.json` with `"type": "module"` in the `evals/` directory.

**Error:**
```
Error: Cannot find module '...run-evals.js'
```

**Fix:** Add to the Step 2 implementation prompt: *"use CommonJS (`require`, `__dirname`), not ESM (`import`)"*.

---

### 2. Ambiguous working directory for the run command

**What happened:** The task says `! node evals/run-evals.js` but doesn't specify which directory to run from. The participant's shell was inside `superheroes-app/evals/`, causing the path to double:
```
…/superheroes-app/evals/superheroes-app/evals/run-evals.js
```

**Fix:** Add a note specifying the working directory, e.g. *"Run from the `superheroes-app/` directory"*, or change the command to `! node evals/run-evals.js` with that directory made explicit.

---

### 3. `--system-prompt` breaks skill loading — the improvement loop doesn't work

**What happened:** Claude naturally uses `--system-prompt` when implementing the harness. This flag *replaces* Claude Code's default system prompt entirely, so the skill-listing `<system-reminder>` is never injected and the `api-security-review` skill can never be invoked — regardless of how well its description is written.

The task's Step 4 tells participants to fix failing criteria by improving the skill description. But with `--system-prompt` in use, that loop is technically impossible: no description change can make the skill load.

**Fix:** The task instructions for Step 2 must tell participants (or Claude) to use `--append-system-prompt` instead:

```js
// Wrong — replaces default context, skills never load:
'--system-prompt', systemPrompt,

// Correct — preserves default context including skill injection:
'--append-system-prompt', systemPrompt,
```

Add this to the Step 2 implementation prompt explicitly, e.g.: *"Use `--append-system-prompt` (not `--system-prompt`) so that Claude Code's skill-loading context is preserved."*

---

### 4. "One-paragraph" constraint causes flaky evals

**What happened:** The task instructs participants to ask Claude for "a one-paragraph code review." With 3 criteria per test case covering distinct issues, a single paragraph can only surface 2–3 problems. The reviewer prioritizes the most salient issues and silently drops lower-priority ones. *Which* criterion fails varies between runs, so the evals appear non-deterministically broken rather than pointing at a fixable gap.

This is a problem because the task asks participants to fix failing criteria by updating the skill — but when the failure is caused by paragraph length rather than missing skill guidance, the skill is the wrong thing to fix.

**Fix:** Change the reviewer prompt description in Step 2 from *"a one-paragraph code review"* to something like *"a concise review that surfaces every distinct issue in the diff."* The participant's job in Step 4 is to improve the skill, not to fight a token budget.

---

## What participants are meant to discover themselves (not fixes)

- **Sharpening the skill description** so it triggers on "review this diff" phrasing (not just security-specific language) — this is the intended learning in Step 4 and should stay as-is in the instructions.
- **Adding missing review rules to the skill body** (e.g. flagging uncached I/O, CORS middleware ordering) — also intentional; the failing evals are meant to drive these improvements.
