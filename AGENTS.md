# AGENTS.md

Personal portfolio website repo. Currently mid-build — see `docs/superpowers/specs/2026-06-29-personal-website-design.md` for the full design and `docs/superpowers/plans/` for per-phase implementation plans. **Do not invent the Next.js site, `content/`, or Vercel config — only build what the current phase plan defines.**

## Layout

- `tools/font-maker/` — Standalone Node/Express tool (Phase 1, done). Phone-camera web UI, rembg-backed background removal, outputs `letters/A.png`…`Z.png` + `0.png`…`9.png`.
- `docs/superpowers/specs/` — Design specs (one for the site, one for the font-maker UI).
- `docs/superpowers/plans/` — Phase-by-phase implementation plans (`2026-06-29-phase-N-*.md`). Read the phase plan before starting work on it.
- `docs/kilocode-agent-guide.md` — Reference for the Kilo subagent `.md` format (YAML frontmatter, `mode`, `permission`, etc.). Authoritative for creating new agents in `.kilo/agent/`.
- `.kilo/agent/` — Project-local Kilo subagent definitions. Project agents override global ones with the same `id`. `orchestrator.md` is the primary mode (`mode: primary`); the rest are `mode: subagent`.
- `.claude/skills/` — Claude Code skills. Currently: `letter-quality-review` (two-phase skill for setting up the font QA agent — see below).
- `.superpowers/` — **gitignored** brainstorming visual companion. Generated artifacts only; do not commit or rely on it.

## Tooling

- WakaTime project name: `personal-website` (`.wakatime-project`). Keep this file unchanged.
- Top-level `kilo.json` grants all permissions — the project's policy is "ask before destructive ops / secrets", enforced by the orchestrator prompt, not by config.
- `tools/font-maker/` has its own `package.json` and `node_modules/`; install separately with `npm install` in that subdir.

## Font Maker tool (`tools/font-maker/`)

Run from inside `tools/font-maker/`:

1. One-time: `pip install --break-system-packages "rembg[cpu,cli]"` (required — the server will hard-exit if it cannot find `rembg`).
2. `npm install`
3. `npm start` (binds `0.0.0.0:3333`, prints a QR code in the terminal for phone access).

Notes:
- `rembg` runs as a persistent child HTTP server on `127.0.0.1:5000` (override with `REMBG_PORT`) so the ~176MB model stays loaded between uploads. It auto-restarts on crash.
- Override the `rembg` binary path with `REMBG_BIN=/path/to/rembg` if not on PATH.
- `letters/` PNGs are tracked in git. `uploads/` is gitignored (raw phone photos).

## Custom agents & skills

- `letter-reviewer` (`.kilo/agent/letter-reviewer.md`) — Read-only subagent that visually inspects every PNG in `tools/font-maker/letters/` and writes a quality report to `tools/font-maker/letter-notes.md`. Use it (not a generic agent) for the font QA pass; it knows the required report format and covers all 36 glyphs in order.
- `letter-quality-review` skill (`.claude/skills/letter-quality-review/SKILL.md`) — Two-phase bootstrap: Phase 1 generates `docs/kilocode-agent-guide.md`; Phase 2 creates the `letter-reviewer` agent and prints the inspection prompt. Skip Phase 1 if the guide already exists.
- When creating a new subagent, follow `docs/kilocode-agent-guide.md` exactly (frontmatter, `options.id` matching filename, declared permissions, narrow `edit` patterns).

## Conventions

- Phase plans use `- [ ]` checkboxes; tick them as work is completed.
- `letter-notes.md` is the source of truth for per-glyph issues; the `letter-reviewer` overwrites it on each run.
- Don't commit secrets. The site will eventually need `GROQ_API_KEY` and possibly a GitHub token — use Vercel env vars, not `.env.local` in git.
- Keep changes small and verifiable; follow the active phase plan rather than free-handing the site.
