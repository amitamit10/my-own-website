import Image from "next/image";

import InkDoodle from "./InkDoodle";

const strengths = [
  "Fast at turning vague ideas into working product.",
  "Strong taste across interface design and frontend craft.",
  "Comfortable across backend, content systems, and AI workflows.",
  "Likes building tools that feel specific instead of generic.",
];

export default function About() {
  return (
    <section id="about" className="px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="max-w-[260px] fps-jitter">
            <Image src="/wordmarks/about.png" alt="About wordmark" width={720} height={220} className="h-auto w-full" />
          </div>
          <p className="max-w-md text-sm leading-6 md:text-base" style={{ color: "var(--ink-soft)" }}>
            I work best where product instincts, implementation speed, and visual judgment all matter at the same
            time.
          </p>
          <InkDoodle className="w-28 rotate-[8deg] fps-drift" variant="spark" />
        </div>

        <div className="space-y-6">
          <div className="paper-stack px-5 py-5 md:px-6 md:py-6">
            <div className="rough-frame paper-panel px-5 py-5 md:px-6 md:py-6">
              <div className="tape-strip absolute -top-3 right-10 h-7 w-20 rotate-[5deg] opacity-75" />
              <p className="text-base leading-7 md:text-lg" style={{ color: "var(--ink)" }}>
                I like work that sits between product, engineering, and visual taste. I care about how things
                ship, how they read, and whether they leave any impression after the tab is closed.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {strengths.map((strength) => (
              <div
                key={strength}
                className="rough-frame border px-4 py-4 paper-panel fps-hover"
                style={{ borderColor: "rgba(95,81,69,0.14)" }}
              >
                <p className="text-sm leading-6" style={{ color: "var(--ink-soft)" }}>
                  {strength}
                </p>
              </div>
            ))}
          </div>

          <div
            className="ml-auto max-w-sm rotate-[-2deg] border px-4 py-4 fps-tilt"
            style={{
              background: "rgba(232,214,188,0.42)",
              borderColor: "rgba(95,81,69,0.16)",
            }}
          >
            <p className="text-sm leading-6" style={{ color: "var(--water-shadow)" }}>
              The goal is not just to ship working things. It is to ship things that feel deliberate.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
