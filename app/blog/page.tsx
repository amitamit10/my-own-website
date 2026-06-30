import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import BlogCard from "@/components/BlogCard";
import InkDoodle from "@/components/InkDoodle";
import { getBlogPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog — Amit Elgabsy",
  description: "Writing about projects, code, experiments, and how things were built.",
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="px-4 pb-24 pt-32 md:px-8 md:pb-32 md:pt-36">
      <div className="mx-auto max-w-5xl space-y-10">
        <Link href="/" className="inline-block text-sm underline-offset-4 hover:underline" style={{ color: "var(--ink-soft)" }}>
          Back home
        </Link>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="max-w-[280px] fps-jitter">
              <Image src="/wordmarks/blog.png" alt="Blog wordmark" width={720} height={220} className="h-auto w-full" />
            </div>
            <p className="max-w-xl text-sm leading-6 md:text-base" style={{ color: "var(--ink-soft)" }}>
              Notes from projects, experiments, and the decisions behind the things I end up shipping.
            </p>
          </div>

          <div
            className="max-w-sm rotate-[2deg] border px-4 py-4 fps-tilt"
            style={{
              background: "rgba(255,250,243,0.76)",
              borderColor: "rgba(95,81,69,0.16)",
            }}
          >
            <p className="text-sm leading-6" style={{ color: "var(--water-shadow)" }}>
              The writing should feel like the rest of the site: specific, a little handmade, and grounded in real work.
            </p>
          </div>
        </div>

        {posts.length === 0 ? (
          <section className="paper-stack px-4 py-4 md:px-5 md:py-5">
            <div className="rough-frame paper-panel px-5 py-5 md:px-6 md:py-6">
              <div className="tape-strip absolute -top-3 left-8 h-7 w-20 rotate-[-4deg] opacity-75" />
              <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl" style={{ color: "var(--ink)" }}>
                    No published posts yet
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 md:text-base" style={{ color: "var(--ink-soft)" }}>
                    The blog route is live and ready, but published posts will show up only after a project write-up is reviewed and marked public.
                  </p>
                </div>
                <InkDoodle className="w-28 rotate-[8deg] fps-drift" variant="loop" />
              </div>
            </div>
          </section>
        ) : (
          <div className="space-y-5">
            {posts.map((post, index) => (
              <div key={post.slug} style={{ transform: `rotate(${index % 2 === 0 ? "-0.9deg" : "0.8deg"})` }}>
                <BlogCard post={post} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
