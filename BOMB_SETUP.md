# Setting up the Commit Bomb Calendar

GitHub sanitizes `<script>` tags out of README-embedded content, so this can't
be literal JavaScript — instead, `scripts/generate-bomb-svg.js` pre-renders
an **animated SVG** (CSS keyframe animations, no JS needed at render time),
and a GitHub Action keeps it fresh by regenerating it from your real
contribution data every day.

## One-time setup

1. **Drop these files into your profile repo** (the special repo named
   exactly `IlIGODIlI/IlIGODIlI`):
   - `scripts/generate-bomb-svg.js`
   - `.github/workflows/bomb.yml`
   - `README.md` (already wired to embed `./dist/bomb-commits.svg`)

2. **Create a Personal Access Token** so the workflow can read your
   contribution calendar via the GraphQL API (the default `GITHUB_TOKEN`
   doesn't have the `read:user` scope this needs):
   - GitHub → Settings → Developer settings → Personal access tokens →
     Fine-grained tokens (or classic) → generate one with `read:user` scope.

3. **Add it as a repo secret** named `BOMB_TOKEN`:
   - Your profile repo → Settings → Secrets and variables → Actions →
     New repository secret → name it `BOMB_TOKEN`, paste the token.

4. **Run it once manually**: Actions tab → "Update Commit Bomb Calendar" →
   Run workflow. It'll commit `dist/bomb-commits.svg`, and your README will
   pick it up immediately.

After that it regenerates automatically every day at 00:00 UTC, and also on
every push to `main`.

## Customizing

- `LOOP_SECONDS` in `generate-bomb-svg.js` controls how fast the detonation
  sweep loops (default 6s).
- `LEVEL_COLORS` controls the base cell color scale (currently GitHub's dark
  green scale, to match the `tokyonight` theme used elsewhere in your README).
- The bomb burst color (`#ff6b3d` rays, `#ffd866` spark) can be changed
  directly in the `<g class="rays">` and `<circle class="spark">` elements.
