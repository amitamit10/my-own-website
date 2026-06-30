import Link from "next/link";

import InkDoodle from "@/components/InkDoodle";

export default function NotFound() {
  return (
    <div className="px-4 pb-24 pt-32 md:px-8 md:pb-32 md:pt-36">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="paper-stack px-4 py-4 md:px-5 md:py-5">
          <div className="rough-frame paper-panel px-5 py-5 md:px-7 md:py-7">
            <div className="space-y-4">
              <p className="text-xs tracking-[0.08em]" style={{ color: "var(--water-shadow)" }}>
                404
              </p>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl" style={{ color: "var(--ink)" }}>
                This page wandered off
              </h1>
              <p className="max-w-2xl text-sm leading-6 md:text-base" style={{ color: "var(--ink-soft)" }}>
                The route does not exist, or the post you tried to open is still unpublished.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/"
            className="border px-5 py-3 text-sm font-medium transition-opacity duration-150 hover:opacity-70"
            style={{
              background: "var(--water-beige)",
              color: "#231a13",
              borderColor: "rgba(95,81,69,0.2)",
            }}
          >
            Go home
          </Link>
          <Link
            href="/blog"
            className="border px-5 py-3 text-sm font-medium transition-opacity duration-150 hover:opacity-70"
            style={{
              color: "var(--ink)",
              borderColor: "rgba(95,81,69,0.2)",
              background: "rgba(255,250,243,0.82)",
            }}
          >
            Open blog
          </Link>
          <InkDoodle className="w-24 rotate-[8deg] fps-drift" variant="loop" />
        </div>
      </div>
    </div>
  );
}
