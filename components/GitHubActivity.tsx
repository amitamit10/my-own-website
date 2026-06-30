import Image from "next/image";

import { getContributionSummary, getGitHubRepos } from "@/lib/github";

import InkDoodle from "./InkDoodle";

const levelStyles: Record<number, string> = {
  0: "rgba(214,202,183,0.35)",
  1: "rgba(184,154,116,0.38)",
  2: "rgba(184,154,116,0.58)",
  3: "rgba(144,124,96,0.82)",
  4: "rgba(111,93,69,1)",
};

function formatMonth(date: string) {
  if (date.startsWith("padding-")) {
    return "";
  }

  return new Date(`${date}T00:00:00Z`).toLocaleString("en-US", { month: "short", timeZone: "UTC" });
}

function formatPushedAt(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function GitHubActivity() {
  const username = process.env.GITHUB_USERNAME ?? "amitamit10";
  const [repos, contributionSummary] = await Promise.all([
    getGitHubRepos(username),
    getContributionSummary(username),
  ]);

  const labels = contributionSummary.weeks.map((week, index) => {
    const label = formatMonth(week.find((day) => !day.date.startsWith("padding-"))?.date ?? "");
    const previous = index > 0 ? formatMonth(contributionSummary.weeks[index - 1]?.[0]?.date ?? "") : "";
    return label && label !== previous ? label : "";
  });

  return (
    <section id="github" className="px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="max-w-[340px] fps-jitter">
              <Image src="/wordmarks/github.png" alt="GitHub wordmark" width={720} height={220} className="h-auto w-full" />
            </div>
            <p className="max-w-xl text-sm leading-6 md:text-base" style={{ color: "var(--ink-soft)" }}>
              Public code activity, recent repos, and a quick read on what has actually been moving lately.
            </p>
          </div>

          <div
            className="max-w-sm rotate-[-2deg] border px-4 py-4 fps-tilt"
            style={{
              background: "rgba(255,250,243,0.76)",
              borderColor: "rgba(95,81,69,0.16)",
            }}
          >
            <p className="text-sm leading-6" style={{ color: "var(--water-shadow)" }}>
              {contributionSummary.total} contributions in the last year across public work on GitHub.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="paper-stack px-4 py-4 md:px-5 md:py-5">
            <div className="rough-frame paper-panel px-4 py-4 md:px-5 md:py-5">
              <div className="tape-strip absolute -top-3 left-8 h-7 w-24 rotate-[-5deg] opacity-75" />
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm leading-6" style={{ color: "var(--ink)" }}>
                    Contribution rhythm
                  </p>
                  <a
                    href={`https://github.com/${username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline-offset-4 hover:underline"
                    style={{ color: "var(--water-shadow)" }}
                  >
                    github.com/{username}
                  </a>
                </div>

                {contributionSummary.weeks.length > 0 ? (
                  <div className="space-y-3 overflow-x-auto">
                    <div className="flex min-w-max gap-[6px] pl-[34px]">
                      {labels.map((label, index) => (
                        <div key={`${label}-${index}`} className="w-[14px] text-[10px]" style={{ color: "var(--ink-soft)" }}>
                          {label}
                        </div>
                      ))}
                    </div>

                    <div className="flex min-w-max gap-2">
                      <div className="grid grid-rows-7 gap-[6px] pr-1 text-[10px]" style={{ color: "var(--ink-soft)" }}>
                        <span>Sun</span>
                        <span />
                        <span>Tue</span>
                        <span />
                        <span>Thu</span>
                        <span />
                        <span>Sat</span>
                      </div>

                      <div className="flex gap-[6px]">
                        {contributionSummary.weeks.map((week, weekIndex) => (
                          <div key={`week-${weekIndex}`} className="grid grid-rows-7 gap-[6px]">
                            {week.map((day) => (
                              <div
                                key={day.date}
                                title={
                                  day.date.startsWith("padding-")
                                    ? ""
                                    : `${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`
                                }
                                className="h-[14px] w-[14px] border fps-hover"
                                style={{
                                  background: levelStyles[day.level] ?? levelStyles[0],
                                  borderColor: "rgba(95,81,69,0.1)",
                                  opacity: day.date.startsWith("padding-") ? 0 : 1,
                                }}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-6" style={{ color: "var(--ink-soft)" }}>
                    GitHub contribution data is unavailable right now.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm" style={{ color: "var(--ink)" }}>
                Recent repositories
              </p>
              <InkDoodle className="w-24 rotate-[6deg] fps-drift" variant="spark" />
            </div>

            <div className="space-y-4">
              {repos.map((repo, index) => (
                <a
                  key={repo.name}
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="paper-stack block px-4 py-4 fps-hover"
                  style={{ transform: `rotate(${index % 2 === 0 ? "-1.2deg" : "1deg"})` }}
                >
                  <div className="rough-frame paper-panel px-4 py-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xl font-semibold tracking-[-0.03em]" style={{ color: "var(--ink)" }}>
                          {repo.name}
                        </h3>
                        <p className="text-xs" style={{ color: "var(--water-shadow)" }}>
                          {repo.language ?? "Code"}
                        </p>
                      </div>

                      <p className="text-sm leading-6" style={{ color: "var(--ink-soft)" }}>
                        {repo.description ?? "Public repository without a written description yet."}
                      </p>

                      <div className="flex flex-wrap gap-4 text-xs" style={{ color: "var(--ink-soft)" }}>
                        <span>Updated {formatPushedAt(repo.pushed_at)}</span>
                        <span>Stars {repo.stargazers_count}</span>
                        {repo.homepage ? <span>Has live URL</span> : null}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
