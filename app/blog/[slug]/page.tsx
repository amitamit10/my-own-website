import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound } from "next/navigation";

import InkDoodle from "@/components/InkDoodle";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/content";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post || post.draft) {
    return {};
  }

  return {
    title: `${post.title} — Amit Elgabsy`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post || post.draft) {
    notFound();
  }

  return (
    <div className="px-4 pb-24 pt-32 md:px-8 md:pb-32 md:pt-36">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link href="/blog" className="inline-block text-sm underline-offset-4 hover:underline" style={{ color: "var(--ink-soft)" }}>
          All posts
        </Link>

        <header className="paper-stack px-4 py-4 md:px-5 md:py-5">
          <div className="rough-frame paper-panel px-5 py-5 md:px-7 md:py-7">
            <div className="space-y-4">
              <p className="text-xs tracking-[0.08em]" style={{ color: "var(--water-shadow)" }}>
                {post.date}
              </p>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl" style={{ color: "var(--ink)" }}>
                {post.title}
              </h1>
              <p className="max-w-2xl text-sm leading-6 md:text-base" style={{ color: "var(--ink-soft)" }}>
                {post.description}
              </p>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-between gap-4">
          <InkDoodle className="w-24 rotate-[4deg] fps-drift" variant="spark" />
          <p className="text-sm" style={{ color: "var(--water-shadow)" }}>
            Built notes, not marketing copy.
          </p>
        </div>

        <article className="blog-prose paper-stack px-4 py-4 md:px-5 md:py-5">
          <div className="rough-frame paper-panel px-5 py-5 md:px-7 md:py-7">
            <MDXRemote source={post.content} />
          </div>
        </article>
      </div>
    </div>
  );
}
