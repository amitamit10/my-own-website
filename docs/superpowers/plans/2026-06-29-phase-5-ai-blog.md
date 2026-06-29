# Phase 5: AI Blog Generation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Groq-powered script that auto-generates a blog post when a new project is published, plus a public blog list page and individual post pages.

**Architecture:** A Node.js script `scripts/generate-post.ts` reads a project MDX file, calls Groq to write a blog post, and saves it to `content/blog/<slug>-post.mdx` with `draft: true`. Amit reviews and flips to `draft: false` to publish. The blog is rendered on `/blog` and `/blog/[slug]` using `getBlogPosts()` and `getBlogPostBySlug()` from `lib/content.ts` (already built in Phase 2).

**Tech Stack:** Groq SDK (`groq-sdk`), tsx (to run TypeScript scripts), next-mdx-remote/rsc for rendering MDX in pages

## Global Constraints
- `GROQ_API_KEY` must be set in `.env.local` (and in Vercel env vars for production)
- Generated posts are always saved with `draft: true` — Amit manually publishes
- Groq model: `llama-3.3-70b-versatile`
- Blog post MDX files saved to `content/blog/<project-slug>-post.mdx`

---

### Task 1: Groq environment setup

**Files:**
- Modify: `.env.local`
- Modify: `.env.local.example`

**Interfaces:**
- Produces: `process.env.GROQ_API_KEY` available at runtime

- [ ] **Step 1: Add Groq API key to `.env.local`**

```bash
echo "GROQ_API_KEY=your_groq_api_key_here" >> .env.local
```

Replace `your_groq_api_key_here` with your real key from [console.groq.com](https://console.groq.com).

- [ ] **Step 2: Update `.env.local.example`**

Open `.env.local.example` and add:

```
GITHUB_USERNAME=your-github-username
GROQ_API_KEY=your-groq-api-key
```

- [ ] **Step 3: Install Groq SDK**

```bash
npm install groq-sdk
npm install -D tsx
```

- [ ] **Step 4: Commit**

```bash
git add .env.local.example package.json package-lock.json && \
git commit -m "chore: add Groq SDK and env setup"
```

---

### Task 2: Groq utility

**Files:**
- Create: `lib/groq.ts`

**Interfaces:**
- Produces: `generateBlogPost(project: Project): Promise<string>` — returns full MDX string (frontmatter + content)

- [ ] **Step 1: Create `lib/groq.ts`**

```ts
import Groq from 'groq-sdk'
import type { Project } from './content'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function generateBlogPost(project: Project): Promise<string> {
  const prompt = `You are writing a blog post for a developer's personal portfolio website.

Write an engaging, first-person blog post about the following project. The tone should be enthusiastic, authentic, and technical-but-accessible. Write as Amit Elgabsy, a passionate developer.

Project details:
- Name: ${project.title}
- Description: ${project.description}
- Tech stack: ${project.tech.join(', ')}
- Highlights: ${project.highlights.map(h => `• ${h}`).join('\n')}
${project.github ? `- GitHub: ${project.github}` : ''}
${project.live ? `- Live URL: ${project.live}` : ''}

Write a blog post with:
1. An engaging opening paragraph about why you built this
2. A section on the technical challenges and how you solved them
3. A section on what you're most proud of
4. A brief closing with what's next

Output ONLY the blog post body text (no frontmatter, no markdown headers for the title). Use markdown for subheadings (##), bold (**), and code snippets (\`\`\`) where appropriate. Aim for 400-600 words.`

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1024,
  })

  const body = completion.choices[0]?.message?.content ?? ''

  const today = new Date().toISOString().split('T')[0]
  const frontmatter = `---
title: "${project.title} — Behind the Build"
description: "How I built ${project.title}: the decisions, challenges, and what I learned."
projectSlug: "${project.slug}"
date: "${today}"
draft: true
---`

  return `${frontmatter}\n\n${body}`
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/groq.ts && \
git commit -m "feat: add Groq utility for blog post generation"
```

---

### Task 3: generate-post script

**Files:**
- Create: `scripts/generate-post.ts`
- Modify: `package.json` (add script)

**Interfaces:**
- Consumes: `getProjectBySlug(slug)` from `lib/content.ts`, `generateBlogPost(project)` from `lib/groq.ts`
- Produces: `content/blog/<slug>-post.mdx` written to disk

- [ ] **Step 1: Create `scripts/generate-post.ts`**

```ts
import { getProjectBySlug } from '../lib/content'
import { generateBlogPost } from '../lib/groq'
import fs from 'fs'
import path from 'path'

const slug = process.argv[2]

if (!slug) {
  console.error('Usage: npm run generate-post <project-slug>')
  console.error('Example: npm run generate-post personal-website')
  process.exit(1)
}

const project = await getProjectBySlug(slug)

if (!project) {
  console.error(`No project found with slug: ${slug}`)
  console.error(`Make sure content/projects/${slug}.mdx exists.`)
  process.exit(1)
}

console.log(`Generating blog post for: ${project.title}…`)

const mdx = await generateBlogPost(project)
const outPath = path.join(process.cwd(), 'content/blog', `${slug}-post.mdx`)

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, mdx, 'utf-8')

console.log(`✓ Saved to content/blog/${slug}-post.mdx`)
console.log(`  Review it, then set draft: false to publish.`)
```

- [ ] **Step 2: Add script to `package.json`**

In the `"scripts"` section of `package.json`, add:

```json
"generate-post": "tsx scripts/generate-post.ts"
```

- [ ] **Step 3: Test the script**

```bash
npm run generate-post personal-website
```

Expected:
```
Generating blog post for: Personal Portfolio Website…
✓ Saved to content/blog/personal-website-post.mdx
  Review it, then set draft: false to publish.
```

- [ ] **Step 4: Inspect the generated file**

Open `content/blog/personal-website-post.mdx`. It should have MDX frontmatter at the top with `draft: true` and a readable blog post body below.

- [ ] **Step 5: Commit**

```bash
git add scripts/ package.json content/blog/ && \
git commit -m "feat: add generate-post script using Groq"
```

---

### Task 4: Blog list page

**Files:**
- Create: `app/blog/page.tsx`
- Create: `components/BlogCard.tsx`

**Interfaces:**
- Consumes: `getBlogPosts()` from `lib/content.ts`
- Produces: `/blog` page listing all published (non-draft) posts

- [ ] **Step 1: Create `components/BlogCard.tsx`**

```tsx
import type { BlogPost } from '@/lib/content'
import Link from 'next/link'

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article
      className="rounded-2xl p-6 transition-transform hover:-translate-y-1"
      style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <p className="text-xs mb-2" style={{ color: 'var(--accent)' }}>{post.date}</p>
      <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>{post.title}</h2>
      <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
        {post.description}
      </p>
      <Link
        href={`/blog/${post.slug}`}
        className="text-sm font-semibold hover:underline"
        style={{ color: 'var(--accent)' }}
      >
        Read more →
      </Link>
    </article>
  )
}
```

- [ ] **Step 2: Create `app/blog/page.tsx`**

```tsx
import { getBlogPosts } from '@/lib/content'
import BlogCard from '@/components/BlogCard'
import Link from 'next/link'

export const metadata = {
  title: 'Blog — Amit Elgabsy',
  description: 'Writing about projects, tech, and building things.',
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <Link href="/" className="text-sm hover:underline mb-8 block" style={{ color: 'var(--text-muted)' }}>
        ← Back home
      </Link>
      <h1
        className="text-5xl md:text-7xl font-black mb-16"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
      >
        Blog
      </h1>
      {posts.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No posts published yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map(p => <BlogCard key={p.slug} post={p} />)}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify blog list page**

```bash
npm run dev
```

Open `http://localhost:3000/blog`. If the generated post is still `draft: true`, you'll see "No posts published yet." Open `content/blog/personal-website-post.mdx`, change `draft: true` to `draft: false`, and refresh — the post card should appear.

Revert `draft` back to `true` after testing.

- [ ] **Step 4: Commit**

```bash
git add app/blog/page.tsx components/BlogCard.tsx && \
git commit -m "feat: add blog list page"
```

---

### Task 5: Blog post page

**Files:**
- Create: `app/blog/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getBlogPostBySlug(slug)` from `lib/content.ts`
- Consumes: `MDXRemote` from `next-mdx-remote/rsc`
- Produces: `/blog/<slug>` — individual blog post rendered as HTML

- [ ] **Step 1: Create `app/blog/[slug]/page.tsx`**

```tsx
import { getBlogPostBySlug, getBlogPosts } from '@/lib/content'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const posts = await getBlogPosts()
  return posts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug)
  if (!post) return {}
  return { title: `${post.title} — Amit Elgabsy`, description: post.description }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug)
  if (!post || post.draft) notFound()

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-3xl mx-auto">
      <Link href="/blog" className="text-sm hover:underline mb-8 block" style={{ color: 'var(--text-muted)' }}>
        ← All posts
      </Link>
      <p className="text-xs mb-4" style={{ color: 'var(--accent)' }}>{post.date}</p>
      <h1
        className="text-4xl md:text-6xl font-black mb-12 leading-tight"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
      >
        {post.title}
      </h1>
      <article
        className="prose prose-invert prose-lg max-w-none"
        style={{ color: 'var(--text-muted)' }}
      >
        <MDXRemote source={post.content} />
      </article>
    </div>
  )
}
```

- [ ] **Step 2: Add Tailwind typography plugin**

```bash
npm install -D @tailwindcss/typography
```

In `app/globals.css`, add after the `@import "tailwindcss"` line:

```css
@plugin "@tailwindcss/typography";
```

- [ ] **Step 3: Verify blog post page**

Temporarily set `draft: false` in `content/blog/personal-website-post.mdx`, then:

```bash
npm run dev
```

Open `http://localhost:3000/blog` → click the post card → post content should render with proper typography.

Revert `draft` back to `true`.

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: builds cleanly.

- [ ] **Step 5: Commit**

```bash
git add app/blog/ package.json package-lock.json app/globals.css && \
git commit -m "feat: add blog post page — phase 5 complete"
```
