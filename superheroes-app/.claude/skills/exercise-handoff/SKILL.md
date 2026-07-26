---
name: exercise-handoff
description: >
  Creates a handoff markdown file for the exercise agent that maintains this
  workshop. The handoff documents issues discovered while a participant (or
  Claude) ran through one or more workshop tasks, and tells the exercise agent
  exactly what to fix in the task instructions — not what participants should
  discover themselves.

  Use this skill whenever the user asks to "write a handoff", "create a handoff
  file", "document what went wrong", "help the exercise agent fix this task",
  or "capture issues for the exercise author" — even if they don't use those
  exact words. Also invoke proactively at the end of any session where workshop
  tasks were attempted and friction, bugs, or broken loops were encountered.
---

# Exercise Handoff Skill

## Purpose

This skill produces a structured handoff file that tells the **exercise agent**
(the agent responsible for maintaining and improving workshop task instructions)
what to fix. It is written for that audience, not for participants.

The critical distinction to maintain throughout:

- **Fixes for the exercise agent** = problems in the task instructions that
  would trip up any participant (broken commands, impossible loops, wrong flags,
  ambiguous working directories, etc.)
- **Intentional participant work** = things participants are meant to discover,
  struggle with, and fix themselves as part of the learning exercise — these
  must NOT appear in the fixes section

Conflating these two categories is the most common failure mode. When in doubt,
ask: "Would every participant hit this wall regardless of their choices, or only
participants who make a specific wrong turn?"

---

## Inputs

Gather these before writing:

1. **The session** — either the current conversation, or a session log the user
   points you at. Read it to extract: what was attempted, what failed, what
   required correction, and what succeeded.

2. **The task instructions** — the markdown block(s) for the task(s) being
   reviewed. The user should paste them, or point you at the file.

If the user says "current session" or gives no session reference, use the
current conversation as the source.

---

## What to extract from the session

For each issue you find, identify:

- **What happened** — the concrete symptom (error message, wrong output, broken
  loop, confusing instruction)
- **Root cause** — why it happened (wrong flag, missing prerequisite, ambiguous
  path, impossible constraint given how the tools actually work)
- **Who owns the fix** — exercise agent (broken instruction) vs. participant
  (intentional learning)
- **The fix** — the precise change to make to the task instructions, including
  exact wording or code where helpful

Ignore issues that were caused by participant error or that are inherent to the
learning objective. Only document things that would block or mislead any
reasonable participant following the instructions as written.

---

## Output format

Write the handoff as a markdown file. Place it in the repo root (same level as
`superheroes-app/`, `CLAUDE.md`, etc.) named after the task, e.g.
`bonus-task-1-handoff.md`.

Use this structure:

```markdown
# [Task Name] – Handoff Notes for Exercise Author

One sentence summarising what this task is trying to teach and why the handoff
exists.

---

## Fixes needed in the task instructions

### [N]. [Short title of the issue]

**What happened:** Concrete symptom — include the error message or broken
behavior verbatim if available.

**Root cause:** Why it happened.

**Fix:** The precise change to make. Include exact wording, flag names, or
code snippets so the exercise agent can apply it without ambiguity.

(Repeat for each fix.)

---

## What participants are meant to discover themselves (not fixes)

Brief list of things that looked like problems but are intentional learning
moments — skill gaps to close, prompts to improve, patterns to discover. The
exercise agent should leave these alone.
```

Keep each fix section tight. The exercise agent needs enough detail to act, not
a narrative of the debugging session.

---

## Tone and framing

- Write to the exercise agent, not to participants.
- Be specific: "change `--system-prompt` to `--append-system-prompt` in the
  Step 2 implementation prompt" is better than "fix the flag usage."
- If a fix requires exact wording (e.g. a sentence to add to the instructions),
  write it out in a code block so it can be copied directly.
- If a fix is a prerequisite step that must be added before an existing step,
  say so explicitly and describe where it fits in the numbered sequence.

---

## Example

`references/bonus-task-1-handoff.md` is the reference output for this skill.
Read it if you need a concrete example of the level of detail and the
fix/participant-work distinction in practice.
