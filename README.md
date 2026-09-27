# Eva’s Earworms

**Songs that refuse to leave.** A small, accessible music blog prototype built with [Eleventy](https://www.11ty.dev/). It uses no client-side JavaScript, trackers, external fonts, or third-party assets.

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Local development

```powershell
npm ci
npm run serve
```

Eleventy prints the local URL (normally `http://localhost:8080/`). For a production build and local checks:

```powershell
npm test
```

The generated site is written to `_site/`. `npm run check` verifies essential document landmarks, local links, forbidden third-party scripts/fonts, and that the draft stays out of the build.

## Content

Posts live in `src/posts/`. The included “Glow” piece is intentionally unpublished: its front matter sets `draft: true`, `permalink: false`, and `eleventyExcludeFromCollections: true`. Remove those safeguards only when the piece has been reviewed and is ready.

## Deployment

### GitHub Pages

1. Build with the repository subpath (replace `REPOSITORY`):
   ```powershell
   $env:PATH_PREFIX="/REPOSITORY/"
   $env:SITE_URL="https://YOUR-ACCOUNT.github.io/REPOSITORY/"
   npm ci
   npm run build
   ```
2. Publish the contents of `_site/` with your preferred Pages workflow.

For a user/organization site at the domain root, use `PATH_PREFIX=/`.

### Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `_site`
- Environment variable: `SITE_URL=https://your-domain.example/`
- Optional `PATH_PREFIX`: `/` (the default)

`SITE_URL` supplies absolute URLs in the RSS feed. Without it, the feed uses the deliberately non-routable `https://example.invalid/` placeholder. No deployment or remote repository is included.
