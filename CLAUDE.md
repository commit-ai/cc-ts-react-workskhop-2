# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This repo has two top-level areas:

- **`superheroes-app/`** — a working full-stack app used as the workshop target. See `superheroes-app/CLAUDE.md` for architecture details, API routes, and dev commands.
- **`plugin-marketplace/`** — Claude Code plugin marketplace infrastructure. The skill `create-plugin-marketplace` (at `plugin-marketplace/.claude/skills/create-plugin-marketplace/SKILL.md`) converts a skill repo into a distributable plugin marketplace.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
