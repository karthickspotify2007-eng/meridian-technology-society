# Meridian Technology Society

A premium, enterprise-grade website for a fictional global technology professional
organization — built to match the **functionality and information architecture** of
sites like computer.org (membership, publications, conferences, learning, certifications,
communities, a member dashboard, an admin CMS) with a **completely original visual identity**
(no colors, layout, components, or branding copied from any real organization).

## Tech stack

Pure client-side, no build step: **HTML5, CSS3, vanilla ES6**, **Bootstrap 5.3** (customized via
CSS-variable overrides, not a Sass rebuild), **GSAP + ScrollTrigger**, **Three.js** (light —
one hero background), **Swiper.js**, **Lenis** smooth scroll, **AOS**, **Font Awesome**. All
libraries load from CDN; there is no `npm install` or bundler.

## Running it

```bash
cd meridian
python serve.py 8090
```

Open **http://localhost:8090**. A local server is required because pages `fetch()` the shared
header/footer partials and JSON data files, which don't load over `file://`.

Use `serve.py` instead of plain `python -m http.server` — it's the same server with one addition:
every response is sent with `Cache-Control: no-store`. Plain `http.server` sends no caching
headers at all, which lets browsers heuristically cache HTML/CSS/JS, so edits can appear to "not
apply" even after a normal reload because the browser is silently reusing an old copy of the file.
If you're not using `serve.py` and a change doesn't seem to show up, hard-refresh
(Ctrl/Cmd+Shift+R) before assuming the code is wrong.

**Demo accounts** (shown on the Login page too):
- Member: `demo@meridian.org` / `meridian2026`
- Admin: `admin@meridian.org` / `meridianadmin`

## Architecture

- **Public marketing site = true multi-page app.** Every page in `/pages` (plus `index.html`)
  is a real, separate `.html` file with its own title/meta/OG/canonical tags — this matters for
  SEO in a way a client-side-routed SPA wouldn't.
- **Dashboard and Admin = single-shell, hash-routed apps.** `dashboard.html#courses` and
  `admin.html#users` share one sidebar + `core/router.js` hash router each, instead of ~17
  near-duplicate shell pages. SEO doesn't matter behind a login wall, and it kept the component
  count sane while still giving every required section its own real, deep-linkable view.
- **Shared header/footer** live in `/components/header.html` and `footer.html`, fetched and
  injected by `assets/js/core/partials.js` into `[data-partial]` mounts on every page.
- **Data-driven content**: every list of publications/conferences/events/courses/etc. lives in
  `/data/*.json` and is rendered through one shared engine —
  `assets/js/components/Card.js` (card markup), `Filters.js` (search/filter/sort/paginate),
  `Pagination.js`, and `DetailModal.js` (the "single item" view, driven by `?id=` in the URL
  instead of one static file per publication/conference/event — that's how Home's "Featured
  Publications" and the Publications library both point at the exact same detail modal).
- **Mock authentication** (`core/auth.js`): the specified stack has no backend, so a "session"
  is a JSON blob in `localStorage`, checked against `/data/members.json` plus any account
  created via Register (kept in a separate localStorage list). `requireAuth()` guards
  `dashboard.html` and `admin.html`. This is a genuine front-end simulation, not a security
  boundary — do not reuse this pattern for anything real.
- **The Admin CMS is functionally live, not cosmetic.** Admin → Publications/Events/Blogs/
  Communities each run through one generic CRUD table+form engine
  (`createResourceManager` in `assets/js/pages/admin.js`) that writes to a localStorage
  overlay per resource (`admin-overlay-<name>`). `core/data.js`'s `getMerged()` applies that
  overlay on every read, and the public listing pages + Home call `getMerged()` for those four
  resource types — so an edit/add/delete in Admin shows up on the live site immediately, in the
  same browser. Admin → CMS additionally lets you overwrite the Home hero heading/subheading
  directly (`localStorage` key `cms-home`, read by `assets/js/pages/home.js`).
- **Everything else that "persists"** — bookmarks, community memberships, course enrollment,
  event registration, certification applications, notification read-state, blog comments —
  goes through `assets/js/core/state.js`'s small localStorage-backed store
  (`Meridian.store.read/write/toggleInSet`), namespaced per feature.

## Folder layout

```
index.html, 404.html, robots.txt, sitemap.xml
pages/          Public content pages (about, membership, communities, publications,
                conferences, events, learning, certifications, resources, news, blog,
                blog-post, careers, contact, search-results)
auth/           login.html, register.html, forgot-password.html
dashboard.html  Member dashboard shell (7 hash-routed sections)
admin.html      Admin CMS shell (10 hash-routed sections)
components/     header.html, footer.html (fetched + injected)
assets/css/     variables.css (design tokens/theme) -> base.css -> layout.css ->
                components/*.css -> pages/*.css
assets/js/
  core/         partials, theme, auth, data, state, a11y, router
  components/   Navbar, SearchModal, Card, Filters, Pagination, DetailModal, Modal, Toast,
                Counter, Tilt, Bookmark, Notifications, ShareButton, CommentThread
  lib-init/     gsap-init, lenis-init, aos-init, three-hero
  pages/        one script per page (home.js, publications.js, dashboard.js, admin.js, ...)
data/           *.json mock content (publications, conferences, events, news, blog,
                communities, courses, certifications, jobs, members, testimonials, partners,
                stats, notifications)
```

## Design system

- **Brand**: "Meridian" — deep navy (`#0F172A`) as the primary ink color, royal blue (`#1E3A8A`)
  as the interactive/brand accent, a cool off-white (`#F8FAFC`) background, and amber gold
  (`#FBBF24`) used sparingly for highlights, ratings, and "live" indicators. Glass-panel surfaces
  over soft gradient mesh backgrounds, "Sora" (display) + "Inter" (body) typefaces.
- **Tokens** live in `assets/css/variables.css` as CSS custom properties, including a full
  `[data-bs-theme='dark']` override block — dark/light mode is Bootstrap 5.3's native
  `data-bs-theme` attribute, toggled and persisted by `core/theme.js` under the
  `meridian:theme:v2` localStorage key (defaults to **light** for anyone with no stored
  preference, regardless of OS setting — bump the key's `:vN` suffix again in `theme.js` and
  every page's inline snippet if the default ever needs to change and force-override a
  previously-stored choice). Each page has a tiny inline `<script>` in `<head>` that sets the
  attribute before first paint to avoid a flash of the wrong theme.

## Accessibility & performance notes

- Skip-to-content link, semantic landmarks, focus-visible styling, a shared focus-trap
  (`core/a11y.js`) used by every modal/mega-menu/off-canvas menu, full keyboard support for the
  mega menu and global search (Ctrl/Cmd+K).
- All motion (GSAP ScrollTrigger reveals, counters, tilt, Lenis, the Three.js hero) respects
  `prefers-reduced-motion` and degrades to a static/instant state.
- Images/art are inline SVG (no raster assets to optimize); non-critical scripts load with
  `defer`; JSON is fetched once per page and cached in-memory.

## What's intentionally out of scope

- **No real backend.** Auth, the Admin CMS, dashboard state, comments, bookmarking, etc. are
  front-end simulations over `localStorage` + the seed JSON files, clearly commented as such in
  the source. Refreshing `localStorage` (or using a different browser) resets everything.
- **No real payments.** The Membership page's "Join now" flow does not process any transaction.
- **No real file storage.** Admin → Media's "Upload" and the publication/resource "Download"
  buttons show a toast explaining they're demo-only rather than faking a download.
- **Lighthouse 95+** was a design constraint we built toward (lazy-loading, deferred scripts,
  SVG-only art, minimal CSS per page), not a number we measured — that requires an actual
  hosting/CDN environment to audit honestly.
