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
          <h2 className="sketch-divider text-3xl font-semibold tracking-[-0.03em] md:text-5xl">About</h2>
          <p className="max-w-md text-sm leading-6 md:text-base" style={{ color: "var(--ink-soft)" }}>
            The site should feel personal, but not self-indulgent. This section explains how Amit works, what
            he values, and why the projects below matter.
          </p>
        </div>

        <div className="space-y-6">
          <div className="border px-5 py-5 paper-panel md:px-6 md:py-6">
            <p className="text-base leading-7 md:text-lg" style={{ color: "var(--ink)" }}>
              I like work that sits between product, engineering, and visual taste. I care about how things
              ship, how they read, and whether they leave any impression after the tab is closed.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {strengths.map((strength) => (
              <div
                key={strength}
                className="border px-4 py-4 paper-panel fps-hover"
                style={{ borderColor: "rgba(95,81,69,0.14)" }}
              >
                <p className="text-sm leading-6" style={{ color: "var(--ink-soft)" }}>
                  {strength}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
