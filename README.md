# ERO | VISUALS — Portfolio Site

My personal portfolio site as a video editor and content creator. Built with plain HTML, CSS, and JavaScript — no frameworks.

**Live site:** add your deployed link here
**Contact:** generosomerwin10@gmail.com

## How it works

The whole site is data-driven. Every section (hero, work, stats, skills, dev, about, contact) is rendered by `js/main.js`, which fetches its content from a matching JSON file in `data/`.

This means I can update almost anything on the site — text, stats, projects — just by editing a JSON file. No need to touch the HTML or JS for normal content changes.

```
index.html        → page shell, section containers only
css/style.css      → all styling
js/main.js         → fetches data/*.json and renders each section
data/nav.json      → nav bar links
data/hero.json     → hero heading, tagline, stats, video frame
data/work.json     → project/case study cards
data/stats.json    → audience numbers and bars
data/skills.json   → toolkit/software list
data/dev.json      → side dev projects
data/about.json    → about text, education, certifications
data/contact.json  → contact links and footer
```

If a JSON file is missing or malformed, that section just falls back to a small message instead of breaking the whole page.

## Running it locally

This site fetches JSON files, so it needs to run from a local server (opening `index.html` directly as a file will fail due to browser fetch restrictions).

Easiest options:
- VS Code "Live Server" extension → right-click `index.html` → "Open with Live Server"
- Or run `python -m http.server` in the project folder and open `http://localhost:8000`

## Tech

- Vanilla HTML/CSS/JS, no build step, no dependencies
- Fonts: Archivo Black, Space Grotesk, IBM Plex Mono (Google Fonts)
- Data fetched client-side with `fetch()` and rendered into the DOM

## About me

4th year BS Information Technology student (NU Laguna × Asia Pacific College), video editor running ERO | VISUALS, and Web Development Lead for Microsoft Student Community — NU Laguna.

- TikTok: [@eroedtx](https://www.tiktok.com/@eroedtx)
- LinkedIn: [generosomm](https://linkedin.com/in/generosomm)
- GitHub: [generosomm](https://github.com/generosomm)