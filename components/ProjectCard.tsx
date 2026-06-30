import type { Project } from "@/lib/content";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      className="flex h-full flex-col gap-5 border px-5 py-5 paper-panel fps-hover md:px-6 md:py-6"
      style={{ borderColor: "rgba(95,81,69,0.16)" }}
    >
      <div className="space-y-3">
        <h3 className="text-2xl font-semibold tracking-[-0.03em]" style={{ color: "var(--ink)" }}>
          {project.title}
        </h3>
        <p className="text-sm leading-6 md:text-base" style={{ color: "var(--ink-soft)" }}>
          {project.description}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {project.tech.map((item) => (
          <span
            key={item}
            className="border px-2 py-1 text-xs"
            style={{
              color: "var(--ink-soft)",
              borderColor: "rgba(95,81,69,0.16)",
              background: "rgba(239,230,216,0.65)",
            }}
          >
            {item}
          </span>
        ))}
      </div>

      <ul className="space-y-2">
        {project.highlights.slice(0, 3).map((highlight) => (
          <li key={highlight} className="text-sm leading-6" style={{ color: "var(--ink-soft)" }}>
            {highlight}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-wrap gap-4 pt-3 text-sm">
        {project.github ? (
          <a href={project.github} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
            Source
          </a>
        ) : null}
        {project.live ? (
          <a href={project.live} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
            Live
          </a>
        ) : null}
      </div>
    </article>
  );
}
