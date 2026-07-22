---
name: create-plugin-marketplace
description: >
  Turn a local git repository into a Claude Code plugin marketplace by creating the required
  `.claude-plugin/marketplace.json` catalog and per-plugin `.claude-plugin/plugin.json` manifests.
  Use this skill whenever the user says "make this a marketplace", "set up a plugin marketplace",
  "publish my skills as plugins", "add marketplace.json", "convert skills to plugins", or asks
  how to distribute skills via the Claude Code plugin system. Also trigger when the user has a
  repo full of skills (SKILL.md files) and wants others to be able to install them with
  `/plugin marketplace add` or `/plugin install`.
---

# Plugin Marketplace

Turn a git repo that holds one or more skills (and optionally hooks) into a Claude Code plugin
marketplace — the kind users can add with `/plugin marketplace add` and install from with
`/plugin install`.

## What the spec requires

A valid marketplace is a repo with this shape at the root:

```
.claude-plugin/
  marketplace.json          ← catalog listing every plugin and where to find it

plugins/<plugin-name>/
  .claude-plugin/
    plugin.json             ← per-plugin manifest
  skills/
    <plugin-name>/
      SKILL.md              ← the skill's instructions (and scripts/, references/, etc.)
  hooks/                    ← optional: hook scripts bundled with this plugin
    <hook-name>/
      ...
```

The `marketplace.json` and each `plugin.json` are what Claude Code actually reads. The skill's
`SKILL.md` must live at `skills/<name>/SKILL.md` *inside the plugin directory*, not at the plugin
root. Hooks, if present, live alongside skills inside the plugin directory.

## Step 1 — Inventory

Scan the repo for existing skills and hooks:

```bash
find . -name "SKILL.md" -not -path "*/.git/*" | sort
ls hooks/ 2>/dev/null          # list any top-level hook folders
```

For each `SKILL.md`, read its YAML frontmatter (`name`, `description`). These are the
source of truth for the plugin manifest. Note whether a `license` field is present — include it
in `plugin.json` if so, omit it otherwise.

Also check whether skills are already in the correct layout:
- **Already migrated**: `plugins/<plugin>/skills/<name>/SKILL.md` — nothing to move
- **Old flat layout** in `skills/<name>/SKILL.md` or `skills/<name>/skills/<name>/SKILL.md` — needs to move to `plugins/<name>/skills/<name>/SKILL.md`
- **Hooks** in `hooks/<name>/` at the repo root — move to `plugins/<name>/hooks/<name>/`

Make a note of which cases apply — you'll fix them in Step 2.

## Step 2 — Move content into `plugins/`

Create a `plugins/<name>/` directory for each plugin and move content into it. The plugin name
typically matches the skill folder name (or the hook folder name if there is no corresponding
skill).

**Moving skills (from a flat `skills/<name>/` source):**

```bash
mkdir -p plugins/<name>/skills/<name>
mv skills/<name>/SKILL.md      plugins/<name>/skills/<name>/SKILL.md
mv skills/<name>/scripts       plugins/<name>/skills/<name>/scripts      # if present
mv skills/<name>/references    plugins/<name>/skills/<name>/references    # if present
mv skills/<name>/assets        plugins/<name>/skills/<name>/assets        # if present
```

If the source was already nested (`skills/<name>/skills/<name>/SKILL.md`), use this form instead:

```bash
mkdir -p plugins/<name>/skills/<name>
mv skills/<name>/skills/<name>/SKILL.md   plugins/<name>/skills/<name>/SKILL.md
mv skills/<name>/skills/<name>/scripts    plugins/<name>/skills/<name>/scripts     # if present
mv skills/<name>/skills/<name>/references plugins/<name>/skills/<name>/references  # if present
mv skills/<name>/skills/<name>/assets     plugins/<name>/skills/<name>/assets      # if present
rmdir skills/<name>/skills/<name> skills/<name>  # clean up empty dirs
```

Anything that is dev tooling and not part of the distributable skill (like `evals/`) should be
left in place or moved to a non-plugin directory — it won't be copied on install.

**Moving hooks (from a top-level `hooks/<hook-name>/` source):**

If a `hooks/` folder exists at the repo root, determine which plugin each hook belongs to. The
simplest convention is to match by name (a hook folder named `<name>` goes into
`plugins/<name>/hooks/<name>/`). When there's no obvious match, group the hook with the closest
related skill or ask the user.

```bash
mkdir -p plugins/<name>/hooks
mv hooks/<hook-name>   plugins/<name>/hooks/<hook-name>
```

After all moves, verify a representative path exists:
```bash
ls plugins/<name>/skills/<name>/SKILL.md
```

## Step 3 — Create `plugin.json` for each plugin

Create `plugins/<name>/.claude-plugin/plugin.json` — the file must be named exactly `plugin.json`,
not `<skill-name>-plugin.json` or anything else. Pull `name` and `description` from the skill's
frontmatter; include `license` only if it was present. Use version `"1.0.0"` unless the repo has
a version convention.

```json
{
  "name": "<name>",
  "description": "<one-sentence description from frontmatter>",
  "version": "1.0.0",
  "author": {
    "name": "<repo owner or org>"
  },
  "license": "<license from frontmatter, omit this field if not present>",
  "keywords": ["<relevant-tag>", "..."]
}
```

Keep `keywords` to 3–6 terms. A good keyword helps users find the plugin; an obvious one (the
plugin name itself, "claude") doesn't add anything.

## Step 4 — Create `.claude-plugin/marketplace.json`

Create this file at the repo root. It catalogs every plugin.

```json
{
  "$schema": "https://cdn.jsdelivr.net/npm/@anthropic-ai/claude-code@latest/resources/marketplace-schema.json",
  "name": "<kebab-case-marketplace-name>",
  "description": "<one sentence about what this marketplace offers>",
  "owner": {
    "name": "<team or org name>"
  },
  "metadata": {
    "pluginRoot": "./plugins"
  },
  "plugins": [
    {
      "name": "<plugin-name>",
      "source": "./plugins/<plugin-name>",
      "description": "<brief description>",
      "category": "<writing|developer-tools|productivity|security|utilities>",
      "tags": ["<tag>", "..."]
    }
  ]
}
```

**Marketplace name rules:**
- Must be kebab-case (lowercase, hyphens, no spaces)
- Must be unique per user (adding a second marketplace with the same name replaces the first)
- These names are reserved by Anthropic and will be rejected: `claude-code-marketplace`,
  `claude-code-plugins`, `claude-plugins-official`, `claude-plugins-community`,
  `claude-community`, `anthropic-marketplace`, `anthropic-plugins`, `agent-skills`,
  `anthropic-agent-skills`, `knowledge-work-plugins`, `life-sciences`, `claude-for-legal`,
  `claude-for-financial-services`, `financial-services-plugins`, `first-party-plugins`,
  `healthcare`

**Category values:** `writing`, `developer-tools`, `productivity`, `security`, `utilities`

**`source` paths** resolve relative to the marketplace root (the directory containing
`.claude-plugin/`). Use `./plugins/<name>` — not `./plugins/<name>/skills/<name>` — because
Claude Code scans for skills (and hooks) inside the plugin directory automatically.

## Step 5 — Validate

```bash
claude plugin validate .
```

Common errors and fixes:

| Error | Fix |
|---|---|
| `File not found: .claude-plugin/marketplace.json` | You're not in the repo root, or the file wasn't created |
| `Duplicate plugin name "x"` | Two entries share a `name` — give each a unique one |
| `Path contains ".."` | Source path has `../` — use paths relative to the marketplace root |
| `Plugin name "x" is not kebab-case` | Rename to lowercase, digits, hyphens only |

If `claude` CLI isn't available, do a manual sanity check: confirm every `source` path in
`marketplace.json` resolves to a real directory, and that each of those directories contains
`.claude-plugin/plugin.json` and `skills/<name>/SKILL.md`.

## Step 6 — Write README.md

Always create or rewrite `README.md` at the repo root, even if one already exists. This is the
primary discovery surface for anyone landing on the repo. Include:

1. How to add the marketplace: `/plugin marketplace add <owner>/<repo>`
2. How to install individual plugins: `/plugin install <name>@<marketplace-name>`
3. A table listing all plugins with one-line descriptions

## Output summary

When done, tell the user:

- What files were created or moved
- The command to add the marketplace: `/plugin marketplace add <owner>/<repo>`
- The command(s) to install each plugin: `/plugin install <name>@<marketplace-name>`
- Whether `claude plugin validate .` passed (and any warnings to resolve before publishing)
