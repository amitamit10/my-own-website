import Image from "next/image";

import InkDoodle from "./InkDoodle";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-32 md:px-8 md:pb-24 md:pt-36">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-sm leading-6 md:text-base" style={{ color: "var(--ink-soft)" }}>
              Full-stack developer building products with strong visual instincts, fast execution, and a taste
              for weird ideas that still ship.
            </p>

            <div className="max-w-4xl fps-jitter">
              <Image
                src="/wordmarks/amit.png"
                alt="Amit wordmark"
                width={1200}
                height={430}
                priority
                className="h-auto w-full"
              />
            </div>
          </div>

          <div className="paper-stack relative max-w-2xl px-5 py-5 md:px-6 md:py-6">
            <div className="rough-frame relative paper-panel fps-hover px-5 py-5 md:px-6 md:py-6">
              <div className="tape-strip absolute -top-3 left-8 h-8 w-24 rotate-[-6deg] opacity-80" />
              <p className="text-base leading-7 md:text-lg" style={{ color: "var(--ink)" }}>
                I design and build software that feels like somebody actually cared while making it. This site is
                part portfolio, part artifact, and part proof that code can still have a point of view.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#projects"
              className="border px-5 py-3 text-sm font-medium transition-opacity duration-150 hover:opacity-70"
              style={{
                background: "var(--water-beige)",
                color: "#231a13",
                borderColor: "rgba(95,81,69,0.2)",
              }}
            >
              See projects
            </a>
            <a
              href="#contact"
              className="border px-5 py-3 text-sm font-medium transition-opacity duration-150 hover:opacity-70"
              style={{
                color: "var(--ink)",
                borderColor: "rgba(95,81,69,0.2)",
                background: "rgba(255,250,243,0.8)",
              }}
            >
              Work with me
            </a>
          </div>
        </div>

        <div className="relative min-h-[360px] lg:min-h-[500px]">
          <div
            className="absolute left-[8%] top-[6%] h-32 w-32 rounded-full fps-drift"
            style={{ background: "rgba(201,175,133,0.24)" }}
          />
          <InkDoodle className="absolute left-[4%] top-[2%] w-20 fps-jitter" variant="spark" />
          <div
            className="absolute right-[8%] top-[14%] h-28 w-40 rotate-[-7deg] border paper-panel fps-jitter"
            style={{ background: "rgba(255,250,243,0.8)", borderColor: "rgba(95,81,69,0.15)" }}
          />
          <div
            className="paper-stack absolute left-[16%] top-[28%] w-[70%] rotate-[-3deg] px-4 py-4 fps-hover"
          >
            <div className="rough-frame paper-panel px-4 py-4" style={{ borderColor: "rgba(95,81,69,0.18)" }}>
              <div className="tape-strip absolute -top-3 right-8 h-8 w-20 rotate-[7deg] opacity-75" />
              <p className="text-sm leading-6" style={{ color: "var(--ink-soft)" }}>
                Building portfolio systems, AI-assisted flows, creative tooling, and product surfaces that do not
                look like copied startup templates.
              </p>
            </div>
          </div>
          <div
            className="absolute bottom-[14%] right-[10%] w-[58%] rotate-[2deg] border px-4 py-4 fps-tilt"
            style={{
              background: "rgba(231,220,205,0.7)",
              borderColor: "rgba(95,81,69,0.14)",
            }}
          >
            <p className="text-xs uppercase tracking-[0.08em]" style={{ color: "var(--ink-soft)" }}>
              Handmade web presence
            </p>
          </div>
          <div
            className="absolute bottom-[4%] left-[10%] w-[46%] rotate-[4deg] px-4 py-4 fps-jitter"
            style={{ background: "rgba(255,250,243,0.76)", border: "1px solid rgba(95,81,69,0.16)" }}
          >
            <p className="text-sm leading-6" style={{ color: "var(--water-shadow)" }}>
              Built from photographed water letters, then composed like paper scraps on a desk.
            </p>
          </div>
          <InkDoodle className="absolute right-[2%] top-[46%] w-28 fps-drift" variant="loop" />
          <InkDoodle className="absolute left-[30%] bottom-[2%] w-44 rotate-[6deg] fps-jitter" variant="arrow" />
        </div>
      </div>
    </section>
  );
}
