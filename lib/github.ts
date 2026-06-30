export type GitHubRepo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  language: string | null;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
};

export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type ContributionWeek = ContributionDay[];

type ContributionSummary = {
  total: number;
  weeks: ContributionWeek[];
};

const REVALIDATE_SECONDS = 3600;

function parseContributionCount(label: string | undefined): number {
  if (!label) {
    return 0;
  }

  if (label.startsWith("No contributions")) {
    return 0;
  }

  const match = label.match(/^(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

function normalizeWeek(week: ContributionWeek): ContributionWeek {
  if (week.length >= 7) {
    return week.slice(0, 7);
  }

  const padding: ContributionDay[] = Array.from({ length: 7 - week.length }, (_, index) => ({
    date: `padding-${index}`,
    count: 0,
    level: 0,
  }));

  return [...week, ...padding];
}

export async function getGitHubRepos(username: string): Promise<GitHubRepo[]> {
  const response = await fetch(
    `https://api.github.com/users/${username}/repos?sort=pushed&direction=desc&per_page=12&type=owner`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "personal-website",
      },
      next: { revalidate: REVALIDATE_SECONDS },
    },
  );

  if (!response.ok) {
    return [];
  }

  const repos = (await response.json()) as GitHubRepo[];

  return repos
    .filter((repo) => !repo.fork && !repo.archived)
    .sort((a, b) => b.pushed_at.localeCompare(a.pushed_at))
    .slice(0, 6);
}

export async function getContributionSummary(username: string): Promise<ContributionSummary> {
  const response = await fetch(`https://github.com/users/${username}/contributions`, {
    headers: {
      "User-Agent": "personal-website",
      "X-Requested-With": "XMLHttpRequest",
    },
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    return { total: 0, weeks: [] };
  }

  const html = await response.text();
  const totalMatch = html.match(/>\s*([\d,]+)\s+contributions?\s+in the last year\s*</i);
  const total = totalMatch ? Number.parseInt(totalMatch[1].replaceAll(",", ""), 10) : 0;

  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  const rows = Array.from(html.matchAll(rowRegex)).slice(1, 8);
  if (rows.length === 0) {
    return { total, weeks: [] };
  }

  const weekBuckets: ContributionWeek[] = [];

  rows.forEach((rowMatch) => {
    const row = rowMatch[1];
    const cellRegex =
      /<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="([^"]+)"[^>]*data-level="(\d)"[^>]*class="ContributionCalendar-day"[^>]*><\/td>\s*<tool-tip[^>]*for="\2"[^>]*>([^<]*)<\/tool-tip>/g;

    let cellMatch: RegExpExecArray | null;
    let weekIndex = 0;

    while ((cellMatch = cellRegex.exec(row)) !== null) {
      const date = cellMatch[1];
      const level = Number.parseInt(cellMatch[3], 10) as 0 | 1 | 2 | 3 | 4;
      const count = parseContributionCount(cellMatch[4]);

      if (!weekBuckets[weekIndex]) {
        weekBuckets[weekIndex] = [];
      }

      weekBuckets[weekIndex].push({ date, count, level });
      weekIndex += 1;
    }
  });

  return {
    total,
    weeks: weekBuckets.map(normalizeWeek),
  };
}
