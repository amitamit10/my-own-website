# Personal Portfolio Website — Design Spec

**Date:** 2026-06-29
**Status:** Draft

---

## Overview

A bold, creative personal portfolio website built with Next.js and deployed on Vercel. The site showcases Amit's work, strengths, and GitHub activity to employers, clients, and fellow developers. A custom water-photography font is used for display headings. When a new project is published, a Groq-powered AI model auto-generates a blog post about it.

---

## Sections

1. **Hero** — Full-screen intro with name rendered in the custom water font, a punchy tagline, and a CTA
2. **About / Strengths** — Short bio, key skills, and what makes Amit stand out
3. **Projects** — Cards showcasing work, each linked to an auto-generated blog post
4. **GitHub Activity** — Live GitHub contribution graph and recent repos via GitHub API
5. **Blog** — AI-generated posts, one per project, browsable independently
6. **Contact** — Simple contact form or links

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Deployment | Vercel |
| Content | File-based MDX (projects + blog posts) |
| AI | Groq API (auto blog post generation) |
| GitHub data | GitHub REST API (public, no auth needed for basic data) |
| Font | Custom water-photography font (`.woff2`) |
| Styling | Tailwind CSS |

---

## Custom Font Pipeline

A dedicated tool (separate mini-app in this repo under `tools/font-maker/`) that:

1. **Phone camera server** — Runs a local Node.js web server accessible from the phone's browser on the same WiFi network. Displays which letter to photograph next with framing guides.
2. **Letter capture** — User photographs water forming each letter (A–Z, 0–9, punctuation as needed). Photos upload directly to the tool.
3. **Background removal** — Each photo is processed automatically (remove.bg API or local `rembg` Python library) to isolate the water letterform on a transparent background.
4. **Review & save** — Processed images are saved to `tools/font-maker/letters/` as PNGs, one per character.
5. **Font assembly** — Letters are manually traced in FontForge or Glyphs and exported as `public/fonts/water.woff2`.

The font is used only for display headings (hero name, section titles). Body text uses a system or Google font.

---

## AI Blog Generation

When a new project MDX file is added to `content/projects/`, running `npm run generate-post <project-slug>` calls the Groq API with the project metadata (name, description, tech stack, highlights) and writes a new MDX file to `content/blog/`. The prompt instructs Groq to write an engaging, first-person blog post about the project.

The generated post is saved as a draft (frontmatter `draft: true`) so Amit can review and publish it manually by flipping the flag.

---

## Content Structure

```
content/
  projects/
    project-name.mdx       # title, description, tech, links, highlights
  blog/
    project-name-post.mdx  # AI-generated, draft: true until reviewed
```

---

## Design Direction

- **Background:** Near-black (`#0a0a0a`)
- **Accent:** Electric or neon color (TBD during implementation — likely blue or cyan to complement water font)
- **Typography:** Custom water font for H1/H2 display headings; clean sans-serif (Inter or Geist) for body
- **Motion:** Subtle scroll animations, cursor effects, particle or ripple effects to reinforce the water theme
- **Layout:** Full-bleed sections, bold typography, generous whitespace

---

## Phases (build order)

| Phase | Name | Goal |
|---|---|---|
| 1 | Font Maker Tool | Phone camera server + background removal + letter PNG storage |
| 2 | Site Foundation | Next.js scaffold, Tailwind, Vercel config, MDX, layout, custom font |
| 3 | Core Sections | Hero, About/Strengths, Projects grid, Contact |
| 4 | GitHub Activity | Live GitHub API — contribution graph + recent repos |
| 5 | AI Blog Generation | Groq integration, generate-post script, blog page, draft/publish flow |
| 6 | Polish & Deploy | Animations, ripple/particle effects, performance, production Vercel deploy |

---

## Working Method

- **Skills as needed** — custom Claude Code skills will be written along the way when a repeatable workflow emerges (e.g. a skill for generating a new project post, a skill for adding a new project, a skill for deploying). Skills live in `.claude/skills/`.

---

## Out of Scope (v1)

- CMS or visual admin dashboard
- Authentication
- Comments on blog posts
- Analytics
