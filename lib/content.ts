import fs from "fs";
import path from "path";
import matter from "gray-matter";

const PROJECTS_DIR = path.join(process.cwd(), "content/projects");
const BLOG_DIR = path.join(process.cwd(), "content/blog");

export type Project = {
  slug: string;
  title: string;
  description: string;
  tech: string[];
  highlights: string[];
  github?: string;
  live?: string;
  date: string;
  content: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  projectSlug: string;
  date: string;
  draft: boolean;
  content: string;
};

function readMdx(dir: string, slug: string) {
  const filePath = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return matter(fs.readFileSync(filePath, "utf-8"));
}

function listSlugs(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export async function getProjects(): Promise<Project[]> {
  return listSlugs(PROJECTS_DIR)
    .map((slug) => {
      const parsed = readMdx(PROJECTS_DIR, slug);

      return {
        slug,
        title: parsed?.data.title ?? slug,
        description: parsed?.data.description ?? "",
        tech: parsed?.data.tech ?? [],
        highlights: parsed?.data.highlights ?? [],
        github: parsed?.data.github,
        live: parsed?.data.live,
        date: parsed?.data.date ?? "",
        content: parsed?.content ?? "",
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const parsed = readMdx(PROJECTS_DIR, slug);
  if (!parsed) {
    return null;
  }

  return {
    slug,
    title: parsed.data.title ?? slug,
    description: parsed.data.description ?? "",
    tech: parsed.data.tech ?? [],
    highlights: parsed.data.highlights ?? [],
    github: parsed.data.github,
    live: parsed.data.live,
    date: parsed.data.date ?? "",
    content: parsed.content,
  };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  return listSlugs(BLOG_DIR)
    .map((slug) => {
      const parsed = readMdx(BLOG_DIR, slug);

      return {
        slug,
        title: parsed?.data.title ?? slug,
        description: parsed?.data.description ?? "",
        projectSlug: parsed?.data.projectSlug ?? "",
        date: parsed?.data.date ?? "",
        draft: parsed?.data.draft ?? true,
        content: parsed?.content ?? "",
      };
    })
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const parsed = readMdx(BLOG_DIR, slug);
  if (!parsed) {
    return null;
  }

  return {
    slug,
    title: parsed.data.title ?? slug,
    description: parsed.data.description ?? "",
    projectSlug: parsed.data.projectSlug ?? "",
    date: parsed.data.date ?? "",
    draft: parsed.data.draft ?? true,
    content: parsed.content,
  };
}
