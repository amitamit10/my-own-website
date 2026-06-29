# Kilocode Subagent Authoring Guide

A complete reference for creating a Kilo (Kilocode) subagent. Subagents let you spawn focused, permission-scoped workers that the orchestrator (or user) can delegate tasks to. Each subagent is a single Markdown file with YAML frontmatter plus a system-prompt body.

Project-local agents live in `.kilo/agent/<id>.md`. Global agents live in `~/.config/kilo/agent/<id>.md`. Project agents override global ones with the same `id`.

---

## File layout

```
---
mode: subagent
description: <one-line purpose>
options:
  displayName: <Human Readable Name>
  id: <agent-id>
permission:
  read: allow | deny
  edit: <pattern> | <map> | allow | deny
  bash: allow | deny
  mcp: allow | deny
  question: allow | deny
---

<System prompt in Markdown>
```

The file must start with `---` on line 1, end the frontmatter block with another `---`, and leave a single blank line before the body.

---

## YAML frontmatter fields

### `mode` (required)

How the agent is launched.

| Value | Meaning |
| --- | --- |
| `subagent` | Invoked by another agent (or the orchestrator) via the `task` tool. Returns a result to the caller. **This is the standard mode for delegation.** |
| `agent` | A primary, top-level mode. Shown in the mode picker; the user can switch into it. (The bundled `orchestrator` uses this.) |

All bundled specialists in `.kilo/agent/` use `mode: subagent` except `orchestrator.md`, which is `mode: agent`.

### `description` (required)

One-line, plain-text summary of what the agent does. Shown in agent pickers and used as the default prompt for "ask this agent" actions. Keep it short and action-oriented.

```yaml
description: Senior software engineer conducting thorough code reviews
```

### `options` (required)

Nested map of agent metadata.

| Field | Required | Notes |
| --- | --- | --- |
| `displayName` | yes | Human-readable name shown in UI lists. |
| `id` | yes | Unique machine identifier. Must be lowercase, kebab/snake friendly (e.g. `code-reviewer`). Must match the filename (without `.md`). |

```yaml
options:
  displayName: Code Reviewer
  id: code-reviewer
```

### `permission` (required)

Defines what tools the agent may use. Every key is optional, but you should declare each one explicitly so the agent's capabilities are obvious.

```yaml
permission:
  read: allow
  edit:
    "*": allow
  bash: allow
  mcp: deny
  question: allow
```

#### Per-permission values

| Key | Type | Allowed values | Effect |
| --- | --- | --- | --- |
| `read` | scalar | `allow` / `deny` | Read any file via the `read` / `glob` / `grep` tools. |
| `bash` | scalar | `allow` / `deny` | Execute shell commands. |
| `mcp` | scalar | `allow` / `deny` | Call MCP (Model Context Protocol) servers. Almost always `deny` for project agents. |
| `question` | scalar | `allow` / `deny` | Use the `question` tool to ask the user clarifying questions interactively. |
| `edit` | scalar **or** map | `allow` / `deny` **or** a map of pattern → `allow` / `deny` | Edit/create files matching the patterns. Most flexible permission. |

#### `edit` shape in detail

The `edit` field is the only one that takes a structured value. Three forms are common:

**1. Allow everything** (default for a general implementation agent):
```yaml
edit:
  "*": allow
```

**2. Deny everything** (read-only agent):
```yaml
edit: deny
```

**3. Restrict by glob pattern** (specialist agent):
```yaml
edit:
  "*.test.ts": allow
  "*.test.tsx": allow
  "*.spec.ts": allow
```

Each key is a glob pattern evaluated against the file path relative to the project root. Any file path that does not match an `allow` rule is implicitly denied. Patterns are case-sensitive on most platforms.

Useful pattern conventions used in the bundled agents:

| Pattern | Matches |
| --- | --- |
| `"*"` | Any file path. |
| `"*.md"` | Files with `.md` extension in any directory. |
| `"*.tsx"` | React TypeScript files anywhere. |
| `".kilo/plans/*.md"` | Plan files in the project-local plans directory. |
| `".plans/*.md"` | Plan files in legacy `.plans/` location. |
| `".opencode/plans/*.md"` | Plan files in legacy `.opencode/plans/`. |
| `"README"` / `"CHANGELOG"` | Files named exactly that, in any directory. |
| `"*/README"` | `README` in any single subdirectory. |
| `"src/**/*"` | Anything under `src/`. |

You can mix multiple allowed patterns; they are additive. There is no `deny` inside the map in the bundled examples — simply omit patterns you want to disallow.

---

## Restricting edit access to specific files

Pick the narrowest pattern set that covers the work. Common patterns from the existing agent library:

- **Documentation only** (`docs-specialist`):
  ```yaml
  edit:
    "*.md": allow
    "*.mdx": allow
    "*.txt": allow
    "*.rst": allow
    "*.adoc": allow
    "README": allow
    "*/README": allow
    "CHANGELOG": allow
    "*/CHANGELOG": allow
  ```

- **Frontend code only** (`frontend-specialist`):
  ```yaml
  edit:
    "*.ts": allow
    "*.tsx": allow
    "*.js": allow
    "*.jsx": allow
    "*.css": allow
    "*.scss": allow
    "*.less": allow
    "*.html": allow
  ```

- **Tests only** (`test-engineer`):
  ```yaml
  edit:
    "*.test.js": allow
    "*.test.ts": allow
    "*.test.jsx": allow
    "*.test.tsx": allow
    "*.spec.js": allow
    "*.spec.ts": allow
    "*.spec.jsx": allow
    "*.spec.tsx": allow
  ```

- **Plan files only** (`plan`, `architect`):
  ```yaml
  edit:
    ".kilo/plans/*.md": allow
    ".plans/*.md": allow
    ".opencode/plans/*.md": allow
  ```

Rule of thumb: start from `"*": allow`, then delete every pattern the agent should not touch. If you want a fully read-only agent, set `edit: deny` and `bash: deny` (`ask.md` is exactly this shape).

---

## System prompt body

Everything after the closing `---` is the agent's system prompt. Treat it as plain Markdown that the LLM reads on every invocation. The bundled agents keep these short and behavior-focused.

Recommended sections:

1. **Role sentence** — one or two lines stating who the agent is and its single core job.
2. **Operating principles** — short bullets that describe the agent's priorities, constraints, and style.
3. **What the agent must not do** — explicit guardrails (e.g. "do not implement source-code changes", "do not expose API keys").
4. **Workflow** — if the agent has a multi-step method, name the phases.

Good conventions seen across the bundled agents:

- Keep the total body under ~30 lines. Long prompts dilute behavior.
- State the job in the first sentence. The orchestrator uses the description to pick an agent, but the prompt itself must restate the job.
- Use second person ("You are…", "You focus on…") for consistency with the bundled library.
- For delegation agents, name the specific other agents you expect to hand off to (see `orchestrator.md`).
- For specialists, declare scope of authority: e.g. "You do not implement source-code changes" or "Apply the four-phase debugging process".

---

## Minimal working example

A read-only Q&A agent — the smallest useful specialist:

```markdown
---
mode: subagent
description: Read-only Q&A agent for codebase questions
options:
  displayName: Ask
  id: ask
permission:
  read: allow
  edit: deny
  bash: deny
  mcp: deny
  question: allow
---

You are a read-only Q&A agent. Answer questions about the codebase by reading files and searching. Do not modify any files. Be concise and cite the file paths you used.
```

A general implementation agent with full edit access:

```markdown
---
mode: subagent
description: Default implementation agent
options:
  displayName: Code
  id: code
permission:
  read: allow
  edit:
    "*": allow
  bash: allow
  mcp: deny
  question: allow
---

You are an expert software engineer focused on writing correct, minimal, well-tested code. You implement features from plans, follow existing patterns, and ask clarifying questions when requirements are ambiguous.
```

A scoped specialist that can only edit TypeScript React files:

```markdown
---
mode: subagent
description: Frontend developer expert in React, TypeScript, and modern CSS
options:
  displayName: Frontend Specialist
  id: frontend-specialist
permission:
  read: allow
  edit:
    "*.ts": allow
    "*.tsx": allow
    "*.css": allow
  bash: allow
  mcp: deny
  question: allow
---

You are a frontend developer expert in React, TypeScript, and modern CSS. You focus on creating intuitive user interfaces and excellent user experiences.

Prioritize accessibility, responsive design, and performance. Use semantic HTML and follow React best practices.
```

---

## Quick checklist

- [ ] File path matches `id` (e.g. `id: code-reviewer` → `code-reviewer.md`).
- [ ] `mode` is set to `subagent` (or `agent` for primary modes).
- [ ] `description` is a single line, action-oriented.
- [ ] `options.displayName` and `options.id` are both present and unique.
- [ ] All five `permission` keys are declared explicitly.
- [ ] `edit` patterns are as narrow as the role allows.
- [ ] System prompt body is concise (< ~30 lines), starts with a role sentence, and lists guardrails.
- [ ] Placed in `.kilo/agent/` (project) or `~/.config/kilo/agent/` (global).
