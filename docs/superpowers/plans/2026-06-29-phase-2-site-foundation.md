# Phase 2: Site Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Next.js portfolio site with Tailwind CSS, MDX content reading utilities, custom font setup, and a deployed Vercel preview.

**Architecture:** Next.js 15 App Router at the repo root. Content lives in `content/projects/` and `content/blog/` as MDX files with frontmatter. A `lib/content.ts` utility reads and parses them server-side. The custom water font (woff2) is loaded via `next/font/local`; a placeholder font ships until the real one is ready from Phase 1.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, gray-matter, next-mdx-remote, next/font/local

## Global Constraints
- Node.js ≥ 20
- Next.js 15 with App Router (`src/` directory NOT used — app at root `app/`)
- Tailwind CSS v4 (config is CSS-only, no `tailwind.config.js`)
- TypeScript strict mode
- No `src/` directory

---

### Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

**Interfaces:**
- Produces: `npm run dev` starts dev server at `localhost:3000`

- [ ] **Step 1: Run create-next-app**

```bash
cd "/home/amit/Desktop/my own website!!!" && \
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --yes
```

Expected: project files created, `npm run dev` works.

- [ ] **Step 2: Verify dev server starts**

```bash
npm run dev
```

Expected: `▲ Next.js 15.x.x — ready on http://localhost:3000`

Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: scaffold Next.js 15 with Tailwind and TypeScript"
```

---

### Task 2: Configure Tailwind and global styles

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Produces: CSS custom properties for the site's design tokens (dark background, cyan accent, font variables)

- [ ] **Step 1: Replace `app/globals.css`**

```css
@import "tailwindcss";

:root {
  --bg: #0a0a0a;
  --surface: #111111;
  --accent: #00d4ff;
  --accent-glow: rgba(0, 212, 255, 0.3);
  --text: #f0f0f0;
  --text-muted: #888888;
  --font-display: var(--font-water), system-ui, sans-serif;
  --font-body: var(--font-geist-sans), system-ui, sans-serif;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-family: var(--font-display);
}

::selection {
  background: var(--accent-glow);
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 3px; }
```

- [ ] **Step 2: Verify styles apply**

```bash
npm run dev
```

Open `http://localhost:3000` — background should be near-black (`#0a0a0a`).

- [ ] **Step 3: Commit**

```bash
git add app/globals.css && git commit -m "feat: configure design tokens and global styles"
```

---

### Task 3: Custom font setup

**Files:**
- Create: `public/fonts/README.md` (placeholder instructions)
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: `--font-water` CSS variable available site-wide; falls back to system font until real woff2 is added

- [ ] **Step 1: Create font placeholder README**

```bash
mkdir -p public/fonts
```

Create `public/fonts/README.md`:

```markdown
# Custom Water Font

Place `water.woff2` here after completing Phase 1 (font-maker tool).

Until then, the site falls back to system-ui for display headings.
```

- [ ] **Step 2: Update `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { GeistSans } from 'geist/font/sans'
import './globals.css'

const waterFont = localFont({
  src: '../public/fonts/water.woff2',
  variable: '--font-water',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  title: 'Amit Elgabsy — Portfolio',
  description: 'Personal portfolio of Amit Elgabsy — developer, builder, creator.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${waterFont.variable} ${GeistSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Install Geist font**

```bash
npm install geist
```

- [ ] **Step 4: Create a placeholder `water.woff2`**

The font file must exist for Next.js to not error on build. Create a 0-byte placeholder:

```bash
touch public/fonts/water.woff2
```

- [ ] **Step 5: Verify build passes**

```bash
npm run build
```

Expected: Build completes without errors. (Font will silently fall back since woff2 is empty.)

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx public/fonts/ package.json package-lock.json && \
git commit -m "feat: add custom font setup with water font variable"
```

---

### Task 4: MDX content utilities

**Files:**
- Create: `lib/content.ts`
- Create: `content/projects/.gitkeep`
- Create: `content/blog/.gitkeep`

**Interfaces:**
- Produces:
  - `getProjects(): Promise<Project[]>` — all projects sorted by date desc
  - `getProjectBySlug(slug: string): Promise<Project | null>`
  - `getBlogPosts(): Promise<BlogPost[]>` — non-draft posts sorted by date desc
  - `getBlogPostBySlug(slug: string): Promise<BlogPost | null>`
  - Types: `Project`, `BlogPost` (see step 1)

- [ ] **Step 1: Install dependencies**

```bash
npm install gray-matter next-mdx-remote
npm install -D @types/node
```

- [ ] **Step 2: Create `lib/content.ts`**

```ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const PROJECTS_DIR = path.join(process.cwd(), 'content/projects')
const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export type Project = {
  slug: string
  title: string
  description: string
  tech: string[]
  highlights: string[]
  github?: string
  live?: string
  date: string
  content: string
}

export type BlogPost = {
  slug: string
  title: string
  description: string
  projectSlug: string
  date: string
  draft: boolean
  content: string
}

function readMdx(dir: string, slug: string) {
  const filePath = path.join(dir, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  return matter(fs.readFileSync(filePath, 'utf-8'))
}

function listSlugs(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.mdx'))
    .map(f => f.replace(/\.mdx$/, ''))
}

export async function getProjects(): Promise<Project[]> {
  return listSlugs(PROJECTS_DIR)
    .map(slug => {
      const parsed = readMdx(PROJECTS_DIR, slug)!
      return {
        slug,
        title: parsed.data.title ?? slug,
        description: parsed.data.description ?? '',
        tech: parsed.data.tech ?? [],
        highlights: parsed.data.highlights ?? [],
        github: parsed.data.github,
        live: parsed.data.live,
        date: parsed.data.date ?? '',
        content: parsed.content,
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const parsed = readMdx(PROJECTS_DIR, slug)
  if (!parsed) return null
  return {
    slug,
    title: parsed.data.title ?? slug,
    description: parsed.data.description ?? '',
    tech: parsed.data.tech ?? [],
    highlights: parsed.data.highlights ?? [],
    github: parsed.data.github,
    live: parsed.data.live,
    date: parsed.data.date ?? '',
    content: parsed.content,
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  return listSlugs(BLOG_DIR)
    .map(slug => {
      const parsed = readMdx(BLOG_DIR, slug)!
      return {
        slug,
        title: parsed.data.title ?? slug,
        description: parsed.data.description ?? '',
        projectSlug: parsed.data.projectSlug ?? '',
        date: parsed.data.date ?? '',
        draft: parsed.data.draft ?? true,
        content: parsed.content,
      }
    })
    .filter(p => !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const parsed = readMdx(BLOG_DIR, slug)
  if (!parsed) return null
  return {
    slug,
    title: parsed.data.title ?? slug,
    description: parsed.data.description ?? '',
    projectSlug: parsed.data.projectSlug ?? '',
    date: parsed.data.date ?? '',
    draft: parsed.data.draft ?? true,
    content: parsed.content,
  }
}
```

- [ ] **Step 3: Create content directory placeholders**

```bash
mkdir -p content/projects content/blog
touch content/projects/.gitkeep content/blog/.gitkeep
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/ content/ package.json package-lock.json && \
git commit -m "feat: add MDX content reading utilities"
```

---

### Task 5: Basic layout shell

**Files:**
- Create: `components/Nav.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: persistent nav bar; `app/page.tsx` renders children passed by later tasks

- [ ] **Step 1: Create `components/Nav.tsx`**

```tsx
'use client'
import Link from 'next/link'
import { useState } from 'react'

const links = [
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#github', label: 'GitHub' },
  { href: '/blog', label: 'Blog' },
  { href: '#contact', label: 'Contact' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
         style={{ background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(12px)' }}>
      <Link href="/" className="text-lg font-bold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
        AE
      </Link>
      <ul className="hidden md:flex gap-8 list-none">
        {links.map(l => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm transition-colors hover:text-[var(--accent)]"
                  style={{ color: 'var(--text-muted)' }}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <button className="md:hidden text-[var(--accent)]" onClick={() => setOpen(o => !o)} aria-label="Menu">
        {open ? '✕' : '☰'}
      </button>
      {open && (
        <ul className="absolute top-full left-0 right-0 flex flex-col list-none p-6 gap-4"
            style={{ background: 'var(--surface)' }}>
          {links.map(l => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setOpen(false)}
                    className="text-lg" style={{ color: 'var(--text)' }}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  )
}
```

- [ ] **Step 2: Update `app/layout.tsx` to include Nav**

```tsx
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { GeistSans } from 'geist/font/sans'
import Nav from '@/components/Nav'
import './globals.css'

const waterFont = localFont({
  src: '../public/fonts/water.woff2',
  variable: '--font-water',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  title: 'Amit Elgabsy — Portfolio',
  description: 'Personal portfolio of Amit Elgabsy — developer, builder, creator.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${waterFont.variable} ${GeistSans.variable}`}>
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Replace `app/page.tsx` with placeholder**

```tsx
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p style={{ color: 'var(--text-muted)' }}>Site coming in Phase 3.</p>
    </div>
  )
}
```

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Open `http://localhost:3000`. You should see a black page with a fixed nav bar showing "AE" in cyan on the left and nav links on the right.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/page.tsx components/ && \
git commit -m "feat: add nav bar and layout shell"
```

---

### Task 6: Vercel preview deployment

**Files:**
- No new files

**Interfaces:**
- Produces: live preview URL on Vercel

- [ ] **Step 1: Deploy to Vercel preview**

```bash
vercel
```

Follow prompts: link to existing project or create new one named `personal-website`. Accept defaults.

- [ ] **Step 2: Verify preview URL loads**

Open the preview URL printed by the CLI. The black page with nav bar should load.

- [ ] **Step 3: Commit**

```bash
git add .vercel/ && git commit -m "chore: add Vercel project config"
```
