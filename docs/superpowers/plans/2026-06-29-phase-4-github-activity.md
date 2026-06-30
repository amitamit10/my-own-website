# Phase 4: GitHub Activity — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a live GitHub Activity section showing a contribution graph and recent public repos, fetched server-side from the GitHub REST API.

**Architecture:** A server-side `lib/github.ts` utility fetches data from the GitHub API at request time (no client-side calls). The `<GitHubActivity />` component is a Server Component that calls the utility and renders a contribution heatmap grid and a list of recent repos. A `GITHUB_USERNAME` environment variable drives the username.

**Tech Stack:** Next.js 16 App Router (Server Components), GitHub REST API v3 (public endpoints, no auth required for public data), TypeScript

## Global Constraints
- No GitHub OAuth or personal access token required (public API only)
- Revalidation: 3600 seconds (GitHub API data cached 1 hour via `fetch` cache)
- Section ID: `#github` (matches Nav link from Phase 2)
- `GITHUB_USERNAME` must be set in `.env.local`

---

### Task 1: Environment variable setup

**Files:**
- Create: `.env.local`
- Create: `.env.local.example`

**Interfaces:**
- Produces: `process.env.GITHUB_USERNAME` available at runtime

- [x] **Step 1: Create `.env.local`**

```bash
echo "GITHUB_USERNAME=amitamit10" >> .env.local
```

- [x] **Step 2: Create `.env.local.example`**

```
GITHUB_USERNAME=amitamit10
```

- [x] **Step 3: Ensure `.env.local` is gitignored**

Verify `.gitignore` already includes `.env.local` (Next.js scaffold adds this by default).

```bash
grep "env.local" .gitignore
```

Expected: `.env.local` is listed.

- [x] **Step 4: Commit example file**

```bash
git add .env.local.example && \
git commit -m "chore: add env example with GITHUB_USERNAME"
```

---

### Task 2: GitHub API utility

**Files:**
- Create: `lib/github.ts`

**Interfaces:**
- Produces:
  - `getGitHubRepos(username: string): Promise<GitHubRepo[]>` — last 6 public repos sorted by push date
  - `getContributionWeeks(username: string): Promise<ContributionWeek[]>` — 52 weeks of daily contribution counts via scraping SVG from github.com
  - Types: `GitHubRepo`, `ContributionDay`, `ContributionWeek`

- [x] **Step 1: Create `lib/github.ts`**

```ts
export type GitHubRepo = {
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  language: string | null
  pushed_at: string
}

export type ContributionDay = {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export type ContributionWeek = ContributionDay[]

export async function getGitHubRepos(username: string): Promise<GitHubRepo[]> {
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?sort=pushed&direction=desc&per_page=6&type=public`,
    {
      headers: { Accept: 'application/vnd.github.v3+json' },
      next: { revalidate: 3600 },
    }
  )
  if (!res.ok) return []
  return res.json()
}

export async function getContributionWeeks(username: string): Promise<ContributionWeek[]> {
  // GitHub's contribution graph is available as an SVG with data-count and data-date attributes.
  const res = await fetch(`https://github.com/users/${username}/contributions`, {
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  const html = await res.text()

  // Parse <td data-date="..." data-level="..." data-count="..."> cells
  const cellRegex = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"[^>]*(?:title="([^"]*)")?/g
  const days: ContributionDay[] = []
  let match: RegExpExecArray | null

  while ((match = cellRegex.exec(html)) !== null) {
    const date = match[1]
    const level = parseInt(match[2]) as 0 | 1 | 2 | 3 | 4
    // Extract count from title like "3 contributions on June 1st"
    const countMatch = match[3]?.match(/^(\d+)/)
    const count = countMatch ? parseInt(countMatch[1]) : 0
    days.push({ date, count, level })
  }

  // Group into weeks of 7 days
  const weeks: ContributionWeek[] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
}
```

- [x] **Step 2: Verify API calls work**

Create a temporary test file `lib/__test-github.ts`:

```ts
import { getGitHubRepos, getContributionWeeks } from './github'

const username = 'amitamit10'
const repos = await getGitHubRepos(username)
console.log('Repos found:', repos.length)
console.log('First repo:', repos[0]?.name)

const weeks = await getContributionWeeks(username)
console.log('Weeks parsed:', weeks.length)
console.log('Sample day:', weeks[0]?.[0])
```

Run:

```bash
npx tsx lib/__test-github.ts
```

Expected:
```
Repos found: 6
First repo: <your most recently pushed repo>
Weeks parsed: ~52
Sample day: { date: '2025-...', count: 0, level: 0 }
```

Delete the test file:

```bash
rm lib/__test-github.ts
```

- [x] **Step 3: Commit**

```bash
git add lib/github.ts && \
git commit -m "feat: add GitHub API utility for repos and contribution weeks"
```

---

### Task 3: GitHub Activity component

**Files:**
- Create: `components/GitHubActivity.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `getGitHubRepos`, `getContributionWeeks`, `GitHubRepo`, `ContributionWeek` from `lib/github.ts`
- Consumes: `process.env.GITHUB_USERNAME`
- Produces: `<GitHubActivity />` — contribution heatmap + recent repos grid

- [x] **Step 1: Create `components/GitHubActivity.tsx`**

```tsx
import { getGitHubRepos, getContributionWeeks } from '@/lib/github'

const LEVEL_COLORS: Record<number, string> = {
  0: 'rgba(255,255,255,0.05)',
  1: 'rgba(0,212,255,0.2)',
  2: 'rgba(0,212,255,0.45)',
  3: 'rgba(0,212,255,0.7)',
  4: 'rgba(0,212,255,1)',
}

export default async function GitHubActivity() {
  const username = process.env.GITHUB_USERNAME ?? 'amitamit10'
  const [repos, weeks] = await Promise.all([
    getGitHubRepos(username),
    getContributionWeeks(username),
  ])

  return (
    <section id="github" className="py-32 px-6 max-w-5xl mx-auto">
      <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--accent)' }}>
        Open Source
      </p>
      <h2
        className="text-4xl md:text-6xl font-black mb-16"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
      >
        GitHub Activity
      </h2>

      {/* Contribution heatmap */}
      {weeks.length > 0 && (
        <div className="mb-16 overflow-x-auto">
          <div className="flex gap-[3px] min-w-max">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map(day => (
                  <div
                    key={day.date}
                    title={`${day.count} contributions on ${day.date}`}
                    className="rounded-sm"
                    style={{
                      width: '12px',
                      height: '12px',
                      background: LEVEL_COLORS[day.level] ?? LEVEL_COLORS[0],
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            Contribution activity on GitHub
          </p>
        </div>
      )}

      {/* Recent repos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {repos.map(repo => (
          <a
            key={repo.name}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl p-5 transition-transform hover:-translate-y-1"
            style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <h3 className="font-bold mb-2 truncate" style={{ color: 'var(--text)' }}>
              {repo.name}
            </h3>
            <p className="text-sm leading-relaxed line-clamp-2 mb-4" style={{ color: 'var(--text-muted)' }}>
              {repo.description ?? 'No description'}
            </p>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              {repo.language && <span>{repo.language}</span>}
              <span>★ {repo.stargazers_count}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
```

- [x] **Step 2: Add `<GitHubActivity />` to `app/page.tsx`**

```tsx
import Hero from '@/components/Hero'
import About from '@/components/About'
import Projects from '@/components/Projects'
import GitHubActivity from '@/components/GitHubActivity'
import Contact from '@/components/Contact'

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Projects />
      <GitHubActivity />
      <Contact />
    </>
  )
}
```

- [x] **Step 3: Verify in browser**

```bash
npm run dev
```

Scroll to the GitHub section — you should see the contribution heatmap grid and repo cards. If the GitHub username has no public repos yet, an empty grid is acceptable.

- [x] **Step 4: Run build**

```bash
npm run build
```

Expected: builds cleanly, no TypeScript errors.

- [x] **Step 5: Commit**

```bash
git add components/GitHubActivity.tsx app/page.tsx && \
git commit -m "feat: add GitHub Activity section with heatmap and repo cards"
```
