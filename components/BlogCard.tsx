import Link from "next/link";

import type { BlogPost } from "@/lib/content";

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="paper-stack px-4 py-4">
      <div className="rough-frame paper-panel px-5 py-5 md:px-6 md:py-6">
        <div className="space-y-4">
          <p className="text-xs tracking-[0.08em]" style={{ color: "var(--water-shadow)" }}>
            {post.date}
          </p>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]" style={{ color: "var(--ink)" }}>
              {post.title}
            </h2>
            <p className="text-sm leading-6 md:text-base" style={{ color: "var(--ink-soft)" }}>
              {post.description}
            </p>
          </div>
          <Link
            href={`/blog/${post.slug}`}
            className="inline-block text-sm underline-offset-4 hover:underline"
            style={{ color: "var(--water-shadow)" }}
          >
            Read the post
          </Link>
        </div>
      </div>
    </article>
  );
}
