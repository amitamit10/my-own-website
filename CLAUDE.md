# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See `AGENTS.md` for full layout, conventions, and tooling details. This file covers Claude-specific notes.

## Commands

### Font Maker tool (`tools/font-maker/`)
```bash
# One-time setup
pip install --break-system-packages "rembg[cpu,cli]"
cd tools/font-maker && npm install

# Run (binds 0.0.0.0:3333, prints QR code for phone)
npm start
```

### Letter image cleanup
```bash
# Remove stray pixel blobs from letter PNGs (idempotent)
cd tools/font-maker && python fix-letters.py
```

## Architecture

This repo is **Phase 1 complete** (font maker tool) with Phases 2–6 not yet scaffolded. The Next.js site, `content/`, `src/`, and Vercel config don't exist yet — don't create them until the active phase plan says to.

**Current structure:**
- `tools/font-maker/` — Standalone Express server (port 3333). Phone connects over WiFi, takes a photo of a water letter, upload is processed by a persistent `rembg` subprocess on port 5000 (u2netp model, ~176MB, pre-warmed at startup). Output PNGs land in `tools/font-maker/letters/`.
- `tools/font-maker/fix-letters.py` — Post-capture cleanup: connected-component analysis (scipy) removes stray blobs smaller than 1500 px².
- `tools/font-maker/letter-notes.md` — Per-glyph QA report, overwritten by the `Letter QA & Fixer` kilocode agent on each run.

**Planned architecture (see `docs/superpowers/specs/2026-06-29-personal-website-design.md`):**
- Next.js 15 App Router + Tailwind CSS v4, deployed on Vercel
- File-based MDX content in `content/projects/` and `content/blog/`
- Groq API (`llama-3.3-70b-versatile`) for AI blog post generation — triggered by `npm run generate-post <slug>`
- GitHub REST API for live activity section (no auth required for public data)
- `public/fonts/water.woff2` — custom font assembled from the letter PNGs in Phase 1
- Framer Motion scroll animations + canvas water-ripple cursor effect (Phase 6)

## Kilocode agents

Project agents live in `.kilo/agent/`. The format is documented in `docs/kilocode-agent-guide.md` — follow it exactly when creating new ones. Key point: `options.id` must match the filename (without `.md`). `orchestrator.md` uses `mode: primary`; all others use `mode: subagent`.

The **Letter QA & Fixer** agent (`letter-reviewer.md`) does two jobs in sequence: writes a shape-only quality report to `letter-notes.md`, then auto-runs `fix-letters.py` to erase stray blobs. Re-run it in a new kilocode session after re-photographing any letter.

## Phase tracking

Each phase has a plan in `docs/superpowers/plans/`. Read the active phase plan before starting. Tick `- [ ]` checkboxes as items complete. Don't free-hand work outside the current phase.

**Current phase: 1 done → ready to start Phase 2** (Next.js site foundation).
