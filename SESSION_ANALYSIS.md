# Session Analysis: `/goal` — Frontend Code Coverage Task

## 1. How effectively does this task demonstrate usage of `/goal`?

**Score: 3/10**

The task has the right structural ingredients for a `/goal` demonstration — a measurable exit condition, a validation command, and a feedback loop. But the core value of `/goal` is its enforcement role: blocking the agent from stopping until it has actually failed, diagnosed, and retried. That never happened here.

The agent wrote 14 passing tests on the first attempt, hit 84% coverage immediately, and was done in under 90 seconds. The stop hook was never triggered as a gate. The session is indistinguishable from one where `/goal` was never used at all.

This is a fundamental failure of demonstration: the command's defining behavior — forcing iteration — was invisible throughout. Participants watching this session would have no evidence that `/goal` does anything.

## 2. How realistic were the demands in the original prompt?

**Score: 9/10**

The demands are well-calibrated for the codebase and realistic in every measurable way:

- **Correct tooling constraint** ("use existing testing libraries, no new packages") — the project already had `@testing-library/react`, `@testing-library/user-event`, and `@testing-library/jest-dom`. Nothing was missing.
- **Correct target** — 80% coverage on a single-file React app (`App.js`) with clear, testable behaviors is achievable without heroics.
- **Correct test style** — asking for behavior-driven unit tests (not e2e) is appropriate for the RTL setup in place.
- **Correct constraint** — "do not change existing app behavior" is a healthy guard against the common failure mode where an agent modifies source to make tests easier rather than testing the real thing.
- **Named functionalities are all present** — hero list, search filter, selection → comparison view, back navigation are all genuinely implemented in `App.js`.

Minor deduction: the `--coverage` flag hit a `babel-plugin-istanbul` incompatibility with Node 25, requiring the `--coverageProvider=v8` workaround. The prompt could have anticipated this or provided the exact coverage command.

The realism of the demands is also, indirectly, what broke the `/goal` demonstration: the task was too well-matched to the agent's capability. Realistic demands produced a one-shot success, which is the worst outcome for showcasing an iterative enforcement command.

## 3. Will this be a good learning experience for workshop participants?

**Score: 4/10**

**What works:**
- The test file produced is readable and educational — it demonstrates mocking `fetch`, `waitFor` for async state, `fireEvent` for interactions, and edge cases (max selection, deselection, tie result).
- The constraint "no new packages" shows Claude Code respecting project boundaries.

**What doesn't work:**
- The session does not demonstrate what it set out to demonstrate. Participants watching this would learn about writing React tests with RTL, not about `/goal`. The command is effectively a footnote.
- The stop hook enforcing the goal condition — the most interesting and novel part — never visibly fired. There was no moment where the agent was blocked, forced to reflect, and tried again.
- The entire run took 76 seconds. A workshop participant could reasonably conclude that `/goal` is just a verbose way to add instructions to a prompt, because nothing in this session shows otherwise.

**Recommendation:** For `/goal` to be a meaningful workshop task, the starting conditions must make success on the first attempt unlikely. Options: seed the repo with a broken or incomplete test setup that requires debugging, set the coverage threshold higher (e.g. 95%), or start from a partially tested codebase where the obvious paths are already covered and the agent must find harder-to-reach branches. The goal is to create at least two or three visible iterations where the hook actually blocks completion.
