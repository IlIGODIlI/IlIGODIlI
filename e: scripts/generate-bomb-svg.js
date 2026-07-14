#!/usr/bin/env node
/**
 * Generates an animated SVG "commit bomb calendar" from a GitHub user's
 * real contribution history.
 *
 * Every day you had at least one commit gets a small looping bomb that
 * detonates (spark -> burst -> fade) on top of the normal GitHub-style
 * contribution cell. Days with no commits stay dim and quiet.
 *
 * Requires env vars:
 *   GH_TOKEN     - a GitHub Personal Access Token with `read:user` scope
 *   GH_USERNAME  - the GitHub username to fetch contributions for
 */

const USERNAME = process.env.GH_USERNAME;
const TOKEN = process.env.GH_TOKEN;

if (!USERNAME || !TOKEN) {
  console.error("Missing GH_USERNAME or GH_TOKEN environment variables.");
  process.exit(1);
}

const QUERY = `
query ($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}
`;

async function fetchContributions() {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: QUERY, variables: { login: USERNAME } }),
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(json.errors)}`);
  }

  return json.data.user.contributionsCollection.contributionCalendar;
}

function levelFor(count, max) {
  if (count === 0) return 0;
  if (max <= 0) return 1;
  const ratio = count / max;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const MARGIN_LEFT = 20;
const MARGIN_TOP = 20;
const LOOP_SECONDS = 6; // one full left-to-right detonation sweep, then it loops

const LEVEL_COLORS = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];
const BG = "#0d1117";
const TEXT_COLOR = "#8b949e";

function buildSvg(calendar) {
  const weeks = calendar.weeks;
  const allDays = weeks.flatMap((w) => w.contributionDays);
  const max = Math.max(...allDays.map((d) => d.contributionCount), 0);
  const totalDays = allDays.length || 1;

  const width = MARGIN_LEFT + weeks.length * STEP + 20;
  const height = MARGIN_TOP + 7 * STEP + 30;

  let cells = "";
  let dayIndex = 0;

  weeks.forEach((week, wi) => {
    week.contributionDays.forEach((day) => {
      const dow = new Date(day.date + "T00:00:00Z").getUTCDay(); // 0 = Sunday
      const x = MARGIN_LEFT + wi * STEP;
      const y = MARGIN_TOP + dow * STEP;
      const level = levelFor(day.contributionCount, max);
      const color = LEVEL_COLORS[level];
      const delay = ((dayIndex / totalDays) * LOOP_SECONDS).toFixed(3);

      cells += `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2" ry="2" fill="${color}"><title>${day.date}: ${day.contributionCount} commit${day.contributionCount === 1 ? "" : "s"}</title></rect>`;

      if (day.contributionCount > 0) {
        const cx = x + CELL / 2;
        const cy = y + CELL / 2;
        cells += `
        <g class="bomb">
          <circle class="spark" cx="${cx}" cy="${cy}" r="1.5" fill="#ffd866" style="animation-delay:${delay}s; transform-origin:${cx}px ${cy}px;"/>
          <g class="rays" style="animation-delay:${delay}s; transform-origin:${cx}px ${cy}px;" stroke="#ff6b3d" stroke-width="1.4" stroke-linecap="round">
            <line x1="${cx}" y1="${cy}" x2="${cx - 6}" y2="${cy - 6}"/>
            <line x1="${cx}" y1="${cy}" x2="${cx + 6}" y2="${cy - 6}"/>
            <line x1="${cx}" y1="${cy}" x2="${cx - 6}" y2="${cy + 6}"/>
            <line x1="${cx}" y1="${cy}" x2="${cx + 6}" y2="${cy + 6}"/>
            <line x1="${cx}" y1="${cy}" x2="${cx - 8}" y2="${cy}"/>
            <line x1="${cx}" y1="${cy}" x2="${cx + 8}" y2="${cy}"/>
            <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - 8}"/>
            <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy + 8}"/>
          </g>
        </g>`;
      }
      dayIndex++;
    });
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    text { font-family: 'Segoe UI', Ubuntu, sans-serif; }
    .bomb .spark {
      animation-name: spark-pulse;
      animation-duration: ${LOOP_SECONDS}s;
      animation-timing-function: ease-in-out;
      animation-iteration-count: infinite;
    }
    .bomb .rays {
      animation-name: ray-burst;
      animation-duration: ${LOOP_SECONDS}s;
      animation-timing-function: ease-out;
      animation-iteration-count: infinite;
      opacity: 0;
    }
    @keyframes spark-pulse {
      0%   { r: 1.5; opacity: 1; }
      2%   { r: 3;   opacity: 1; }
      5%   { r: 0;   opacity: 0; }
      100% { r: 0;   opacity: 0; }
    }
    @keyframes ray-burst {
      0%   { opacity: 0; transform: scale(0.2); }
      3%   { opacity: 1; transform: scale(1); }
      9%   { opacity: 0; transform: scale(1.8); }
      100% { opacity: 0; transform: scale(1.8); }
    }
  </style>
  <rect width="${width}" height="${height}" fill="${BG}" rx="8"/>
  <text x="${MARGIN_LEFT}" y="14" fill="${TEXT_COLOR}" font-size="11">💣 ${calendar.totalContributions} contributions in the last year — every commit day detonates</text>
  ${cells}
</svg>`;
}

async function main() {
  const calendar = await fetchContributions();
  const svg = buildSvg(calendar);
  const fs = await import("fs");
  fs.mkdirSync("dist", { recursive: true });
  fs.writeFileSync("dist/bomb-commits.svg", svg);
  console.log("Wrote dist/bomb-commits.svg");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
