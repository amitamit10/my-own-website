import { getProjects } from "@/lib/content";
import Image from "next/image";

import ProjectCard from "./ProjectCard";

export default async function Projects() {
  const projects = await getProjects();

  return (
    <section id="projects" className="px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="max-w-[360px] fps-jitter">
              <Image
                src="/wordmarks/projects.png"
                alt="Projects wordmark"
                width={720}
                height={220}
                className="h-auto w-full"
              />
            </div>
            <p className="max-w-xl text-sm leading-6 md:text-base" style={{ color: "var(--ink-soft)" }}>
              A selection of work across product design, frontend systems, AI-assisted tooling, and projects that
              try not to look like everybody else&apos;s.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
