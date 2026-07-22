---
description: Create, improve, or review Agent Skills (SKILL.md files) by capturing intent, drafting clear instructions, and iterating through manual feedback. Use when asked to "create a skill", "make a new skill", "scaffold a skill", "improve this skill", "update a SKILL.md", or when turning a workflow or domain expertise into reusable agent instructions. Also trigger when someone shows you a SKILL.md and asks for a review or revision, even if they don't say "skill".
name: skill-creator
---
# Skill Creator

A skill for writing, improving, and reviewing agent skills — the instruction files that give Claude specialized knowledge and workflows.

The core loop:

1. Understand what the skill needs to do
2. Write a draft SKILL.md
3. Reason through 2-3 realistic test prompts
4. Revise based on what you learn
5. Repeat until the skill reliably handles core cases and gracefully handles edge cases

## Communicating with the user

People using this skill range from first-time users to experienced developers. Pay attention to context cues. Default to plain language and brief definitions for terms like "frontmatter" or "triggering" if you're not sure the user is familiar with them.

---

## Creating a Skill

### Capture Intent

Start by understanding what the user wants. The current conversation may already contain the workflow they want to capture — extract answers from history before asking.

1. What should this skill enable Claude to do?
2. When should the skill trigger? What phrases or contexts signal the user needs it?
3. What does a good output look like?
4. Are there constraints, dependencies, or edge cases the skill needs to handle?

### Interview and Research

Ask targeted questions about edge cases, input/output formats, example files, and success criteria. If MCPs are available and useful for research (docs, similar skills, best practices), research in parallel via subagents. Come prepared to reduce burden on the user.

### Write the SKILL.md

Fill in these components:

- **name**: Skill identifier, lowercase-hyphenated.
- **description**: This is the primary trigger — include both what the skill does AND the specific contexts when it should activate. Make it slightly pushy: rather than "How to build a dashboard", write "Use this skill whenever the user mentions dashboards, data visualization, or wants to display any kind of data, even if they don't explicitly ask for a 'dashboard'." All "when to use" information goes here, not in the body.
- **body**: Instructions for the agent, following the patterns below.

---

## Skill Writing Guide

### Anatomy of a Skill

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (name, description required)
│   └── Markdown instructions
└── Bundled Resources (optional)
    ├── scripts/    — Executable code for deterministic/repetitive tasks
    ├── references/ — Docs loaded into context as needed
    └── assets/     — Files used in output (templates, icons, fonts)
```

Bundled resources are optional. A self-contained SKILL.md is the right starting point unless the skill genuinely needs external files.

### Progressive Disclosure

Skills load in three levels:

1. **Metadata** (name + description) — always in context (~100 words)
2. **SKILL.md body** — in context whenever the skill triggers (<500 lines ideal)
3. **Bundled resources** — loaded only as needed

Keep SKILL.md under 500 lines. If approaching the limit, reorganize with explicit pointers to reference files rather than cramming everything in. For large reference files (>300 lines), include a table of contents.

**Multi-domain skills**: organize by variant so the agent reads only what's relevant:

```
cloud-deploy/
├── SKILL.md (workflow + selection logic)
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```

### Writing Patterns

Use the imperative form in instructions.

**Output formats** — be explicit:

```markdown
## Report structure
Use this exact template:
# [Title]
## Executive summary
## Key findings
## Recommendations
```

**Examples** — include a few realistic ones:

```markdown
## Commit message format
Input: Added user authentication with JWT tokens
Output: feat(auth): implement JWT-based authentication
```

### Writing Style

Explain *why* things matter rather than issuing bare directives. Good instructions give the agent enough understanding to handle edge cases, not just rote steps. Use theory of mind — the agent is smart and will extrapolate. If you find yourself writing ALWAYS or NEVER in all caps, that's a signal to reframe and explain the reasoning instead; that's more durable and effective.

After writing a draft, look at it with fresh eyes: is every instruction pulling its weight? Remove anything that doesn't change behavior.

### Safety

Skills must not contain malware, exploit code, or content that could compromise security. A skill's contents should not surprise the user if the description is read aloud. Decline requests for misleading skills or skills designed to facilitate unauthorized access, data exfiltration, or other harmful actions. Roleplay/persona skills are fine.

---

## Testing and Iterating

After writing a first draft, propose 2-3 realistic test prompts — things a real user would actually say. Share them: "Here are a few prompts I'd like to think through. Do these look right, or do you want to add more?"

For each prompt, reason through what Claude would actually do when following the skill. Look for:

- Steps the skill doesn't cover
- Ambiguous instructions that could be interpreted multiple ways
- Places where the skill over-constrains and prevents sensible behavior

Revise the skill based on what you find. Repeat until the skill handles core cases reliably.

### Improving an existing skill

1. Read the current skill carefully before suggesting changes.
2. Generalize from specific feedback: the goal is a skill that works across many prompts, not just the examples at hand. Avoid overfitting with narrow, rigid rules.
3. Keep the skill lean: remove instructions that aren't changing behavior.
4. Explain the *why*: if you find yourself writing a bare "always do X", ask if you can explain why X matters — that's more durable and effective.

---

## Final Checklist

Before presenting a created or revised skill:

- [ ] `name` and `description` are present in frontmatter
- [ ] Description covers both *what* and *when*; slightly pushy about triggering
- [ ] Instructions are self-contained — no references to files that don't exist
- [ ] No dead sections (instructions that don't affect behavior)
- [ ] A realistic user prompt would let someone read the skill and know exactly what to do
- [ ] Safety: the skill's intent matches its description; nothing surprising in the content
