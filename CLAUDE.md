# claude-seo — project memory

SEO agent project. This repo holds site exports we audit/work on plus notes from those audits.

## Sites

### `sites/Naukri360/`

Static export of **Naukri360**, InfoEdge/Naukri's free resume & cover-letter builder
microsite, live at `https://www.naukri.com/naukri360`. Plain HTML/CSS/JS (Satoshi
webfont, no framework) — ~111 HTML pages, ~11MB with fonts/images.

- `admin.html` — a standalone no-code CMS editor UI (148KB) used to manage page content.
- `js/cms-data.js` (and the larger `pages/js/cms-data.js`) — the CMS content store: per-page
  `seo` (title/desc/keywords/canonical), `schema` (ratings, breadcrumbs), and `hero` (h1/copy)
  objects that the admin tool publishes into `pages/*.html`.
- `pages/` — the programmatic-SEO landing pages: `resume-templates-*.html` (44 variants),
  `cover-letter-templates-*.html` (6 variants), `ats-resume-checker.html`, `cover-letter-generator.html`.
- `Backup/` — a duplicate snapshot of `pages/`/`js/` shipped inside the site root (not blocked
  from crawling as far as this export shows).
- `sitemap.xml`, `llms.txt` — present at site root; no `robots.txt` anywhere in the export.

Site was added to this repo on 2026-08-27 from a user-supplied zip for SEO analysis; not
a live sync — re-export from the CMS if the source changes.

#### Audit findings (2026-08-27), most severe first

1. **Broken CSS on 54/57 `pages/*.html` files.** The stylesheet `<link>` uses an unresolved
   no-code template token instead of a real URL:
   `href="{{nr_desktop_resume_templates_wdgt_tmpl_svc_tmpl_v0_nocode_service.response.successResponse.resumeTemplatesCssUrl}}"`.
   If this export reflects production, these pages render unstyled.
2. **~20 landing pages are byte-identical duplicates of the `resume-templates.html` hub**
   (same `<title>`, meta description, `<h1>`, and intro paragraph) — affected slugs: `acting`,
   `ai-powered`, `college`, `colorful`, `combination`, `entry-level`, `freelance`,
   `graphic-design`, `high-school`, `hybrid`, `infographic`, `model`, `music`, `scholarship`,
   `seek`, `writer`, plus `cover-letter-templates-creative/-modern`, `ats-resume-checker.html`,
   `cover-letter-generator.html`. Root cause: those slugs' `seo`/`hero` fields are empty in
   `cms-data.js`, so the renderer falls back to hub defaults.
3. **`sitemap.xml` lists only 5 URLs** vs. ~55 real indexable pages. No `robots.txt` exists.
4. **Reused fake-looking review/rating schema.** The same `aggregateRating` (4.8 /
   12,847 / 8,934) and the same named reviews are copy-pasted across the homepage, every
   template page, and an unrelated `Naukri Resume Maker` schema block — a structured-data
   spam pattern if not genuine per-page reviews.
5. **`ItemList`/`CollectionPage` schema is malformed**: all 9 `CreativeWork` items on a page
   share one `url` (the page itself) instead of per-template URLs.
6. Minor: inconsistent URL casing (`resume-templates-Photo.html`, `-Two-Page.html` vs.
   lowercase elsewhere), keyword-stuffed templated meta descriptions, misused Google
   Scholar `citation_*` meta tags.

Full narrative writeup was given in chat on 2026-08-27; this file is the durable summary —
re-derive details from the source files above rather than assuming this list is exhaustive.

Note: an editor's local `.claude/settings.local.json` (containing another user's Windows
username/path) was present in the original zip and was dropped when importing into this repo.
