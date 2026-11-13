# Overlap

Simple multi-day cycling map generator. Drop Strava (or other) GPX files into the browser, overlay each day on one Leaflet map, and export a high-res PNG.

**Live:** [ryazlee.github.io/overlap](https://ryazlee.github.io/overlap/) (after GitHub Pages is enabled)

## Privacy

- **GPX stays local.** Files are parsed in your browser. Nothing is uploaded to a server, and there is no login or account.
- **Map tiles are remote.** Viewing and exporting the map loads tiles from a public provider ([CARTO](https://carto.com/) basemaps / [OpenStreetMap](https://www.openstreetmap.org/copyright) data). Your approximate map viewport is visible to that provider the same way it is on any map site.
- **Analytics.** Anonymous pageviews go to GoatCounter. Paths only — no GPX content, filenames, or hashes.

Exported PNGs have no Overlap watermark.

## Develop

```bash
npm ci
npm run dev
```

```bash
npm run build
npm run lint
npm run preview
```

The Vite `base` is `/overlap/` for GitHub Pages. Local preview uses the same base path.

## Deploy

Push to `main` runs [`.github/workflows/deploy.yaml`](.github/workflows/deploy.yaml) (Node 20, `npm ci`, build, upload `dist`, deploy Pages).

**One-time GitHub setup** (repo owner):

1. **Settings → Pages** → Source: **GitHub Actions**
2. Ensure the `github-pages` environment can be deployed by the Actions workflow (default is fine for a personal public repo)
3. Merge to `main` (or run **Deploy to GitHub Pages** via workflow dispatch)

Site URL: `https://ryazlee.github.io/overlap/`

## Stack

Vite + React 19 + TypeScript, Leaflet, semantic CSS + Tailwind 4 tokens, oxlint. Patterns from [ryazlee/dev-guide](https://github.com/ryazlee/dev-guide) / plannr.
