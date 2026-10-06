# For developers

Technical notes for anyone maintaining the code. Volunteers updating content should read the main `README.md` instead.

## Stack

- **[Eleventy 3](https://www.11ty.dev/)** static site generator, with Nunjucks templates and Markdown content.
- **Plain CSS** (`src/assets/css/site.css`) and a few lines of **vanilla JavaScript** (`src/assets/js/site.js`). No framework and no build step for CSS/JS. Every page works with JavaScript off.
- **Self-hosted fonts:** Barlow Condensed (700, 800) and Public Sans (variable), both under the SIL Open Font License (licenses in `src/assets/fonts/`). The site makes no requests to outside services unless analytics are turned on.
- **Hosting:** GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`). See `DEPLOYMENT.md`.

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (once) |
| `npm start` | Check `site-details.yaml`, then serve a live preview at http://localhost:8080 |
| `npm run build` | Check, then build to `_site/` |
| `npm run check` | Only run the checks |
| `npm run todo` | List every missing item. Add `-- --write` to save it to `docs/TODO.md` |

## Layout

```
site-details.yaml        ← ALL yearly facts (dates, venue, cost, contacts, documents)
README.md                ← volunteer guide ("How to update the site for a new year")
eleventy.config.js       ← Eleventy setup
lib/
  site-details.js        ← loads + validates site-details.yaml; computes dates, status, etc.
  shortcodes.js          ← {% … %} building blocks used in Markdown pages
  markdown.js            ← shared markdown-it instance
  transforms.js          ← highlights [TODO: …] in the built HTML
scripts/
  check-site.js          ← pre-build validation (runs before every build)
  list-todos.js          ← TODO report
src/
  _data/site.js          ← exposes site-details.yaml to templates as `site`
  _data/navigation.yaml  ← menus
  _includes/layouts/     ← base.njk (frame), page.njk (inner pages), home.njk
  _includes/partials/    ← header, footer, call to action, session card, icon sprite
  pages/*.md             ← one Markdown file per page; URL = file name
  assets/                ← css, js, fonts
  documents/             ← uploaded PDFs/Word files (copied as-is)
  images/                ← uploaded images (copied as-is)
  static/                ← favicon, share image, etc. (copied to the site root)
```

## How data flows

`lib/site-details.js` reads `site-details.yaml` (or the file named in the `SITE_DETAILS_FILE` environment variable) and returns the raw values plus computed ones. Templates use them as `site.*`:

- `site.session.announced`, `dates_text`, `dates_short`, `deadline_text`, `deadline_sentence`, `refund_text`, `refund_sentence`, `ordinal`
- `site.session.iso_start` / `iso_end` / `iso_deadline`: ISO timestamps in America/Boise time. The deadline is 23:59:59 local on the deadline day.
- `site.session.status`: `coming-soon | open | full | closed | in-session | over`, as of build time
- `site.cost.text`, `site.cost.check_payable_to_text`, `site.contact.people[].tel`, normalized `site.documents[]` (`href`, `kind`, `external`)

Markdown pages are pre-processed with Nunjucks (`markdownTemplateEngine: "njk"`), so they can use `{{ site.… }}` and shortcodes.

**Status changes at run time.** The home page session card renders every status message, hidden except the build-time one. `site.js` recomputes the status in the browser and runs the countdown, so the page stays correct between builds. Visitors without JavaScript see the build-time state and the deadline date.

## Shortcodes (for Markdown pages)

| Shortcode | Output |
|---|---|
| `{% sessionFacts %}` / `{% sessionFacts "posts" %}` / `{% sessionFacts "delegates" %}` | Grid of key facts (when, where, cost, deadline…) |
| `{% documentList "posts" %}` | Documents for one audience (`posts`, `delegates`, `staff`) |
| `{% contactList %}` | Program email plus each contact person |
| `{% mailingAddress %}` | The Department mailing address |
| `{% findAPost %}` | Large "Find a Post near you" button |
| `{% button "Label", "/url/", "garnet" %}` | Button link (`garnet`, `gold`, `ghost-dark`) |
| `{% socialLinks %}` | Instagram link, or a TODO if none is set |
| `{% photo "images/x.jpg", "alt text", "caption" %}` | Photo, or a placeholder if the path is `""` |
| `{% video "YouTubeID", "Title" %}` | Click-to-load YouTube (privacy-enhanced), or a placeholder |
| `{% emblem %}` | Legion emblem, or the labeled placeholder until approved |
| `{% callout "Title", "gold" %}…{% endcallout %}` | Highlighted box (`navy`, `gold`, `garnet`) |
| `{% faq "Question?" %}…{% endfaq %}` | Expandable question and answer |
| `{% steps %}1. …{% endsteps %}` | Numbered steps (wraps a Markdown ordered list) |
| `{% cards %}{% card "Title", "icon" %}…{% endcard %}{% endcards %}` | Card grid. Icons are the `i-*` symbols in `partials/icons.njk` |

Nunjucks requires **commas between arguments**. Shortcodes return HTML with no blank lines, because a blank line would end Markdown's HTML block.

## Guardrails

- **Venue name:** `scripts/check-site.js` fails the build if any word in `venue.check_words` appears in a file under `src/`, `docs/`, or `README.md`. The venue lives only in `site-details.yaml`.
- **Validation:** missing or invalid fields, impossible dates, a deadline after the start date, and document or emblem files that don't exist all stop the build with plain-English messages. File-name capitalization is checked exactly, because the host is case-sensitive even when your laptop isn't.
- **Placeholder phone numbers** (555-01xx) produce a warning.
- **TODOs:** any `[TODO: …]` in visible text is wrapped in `<mark class="todo">` (see `lib/transforms.js`), so gaps are obvious in previews and in the prototype.

## Paths and hosting

`pathPrefix` comes from the `PATH_PREFIX` environment variable. The workflow sets it from `actions/configure-pages`. This repository is an organization site (`idaho-gem-boys-state.github.io`), so the prefix is `/` both now and on a custom domain. A project-site repository (for example `…github.io/website/`) would get `/website/` automatically. Eleventy's `HtmlBasePlugin` rewrites every absolute URL in the HTML, so templates and Markdown should use root-relative links like `/about/`. CSS uses relative URLs for fonts.

When testing a prefixed build locally in Git Bash, set `MSYS_NO_PATHCONV=1`, or Git Bash rewrites a value like `/website/` into a Windows path.

## Testing different states locally

To preview "dates announced" without touching the real data file, copy `site-details.yaml` somewhere outside the project, edit it, and run:

```bash
SITE_DETAILS_FILE=/path/to/copy.yaml npx @11ty/eleventy --serve --port=8081
```

## Accessibility and quality checks done at launch

- axe-core (WCAG 2.0/2.1/2.2 A and AA, plus best practices) on all pages at 375px and 1280px: no violations.
- Worst-case contrast of text over gradients and artwork, measured from rendered pixels: all text meets AA.
- html-validate: no errors (style-only rules aside).
- Keyboard: skip link, menu button (`aria-expanded`, Escape closes it and returns focus, closes when focus leaves), visible 3px focus rings, native `<details>` for FAQs.
- `prefers-reduced-motion` turns off the twinkle and hover motion. Forced-colors mode is supported.

Re-run checks like these after significant design changes.

## Dependencies

`npm audit` reports advisories in packages Eleventy uses while building (for example `chokidar`, `braces`, `nunjucks`). They run only on the build machine. Nothing from them is shipped to visitors, who receive static HTML, CSS, and JS. Don't run `npm audit fix --force`: it "fixes" them by downgrading Eleventy to a years-old version. Update Eleventy normally when new versions come out.

## Design tokens

Colors, fonts, and spacing are CSS custom properties at the top of `site.css`: navy, garnet (Idaho's state gem), and a gold accent. The gem logo, background artwork, and icons are inline SVG symbols in `src/_includes/partials/icons.njk`. The logo is a **placeholder** until an official one exists. The share image (`src/static/og-image.png`) and PNG icons were rendered from the same artwork. Re-render them if the logo changes.
