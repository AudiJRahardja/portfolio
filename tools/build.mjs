// Zero-dependency static build for the portfolio.
//   node tools/build.mjs
// Reads data/projects.mjs and:
//   1. rewrites the regions between <!-- build:NAME --> ... <!-- /build:NAME --> in index.html
//   2. writes one static detail page per featured project to projects/<slug>.html
// The output is plain HTML, so GitHub Pages serves it as-is and it works without JavaScript.

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { projects, TAGS } from '../data/projects.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://audijrahardja.github.io/portfolio/';

// ---------- helpers ----------
const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const exists = (p) => access(path.join(root, p)).then(() => true, () => false);
const indent = (html, n) => html.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');

const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';

const STATUS = {
  live: { cls: 'badge--live', text: 'Live demo' },
  published: { cls: 'badge--pub', text: 'Published · IEEE' },
  'in-progress': { cls: 'badge--wip', text: 'In progress' },
};

const LINK_LABEL = { demo: 'Live demo', code: 'Code', paper: 'Paper (IEEE Xplore)', model: 'Model' };

// ---------- validation: keep the "no number without context" rule honest ----------
function validate() {
  const errors = [];
  const slugs = new Set();
  for (const p of projects) {
    if (slugs.has(p.slug)) errors.push(`duplicate slug ${p.slug}`);
    slugs.add(p.slug);
    for (const t of p.tags) if (!TAGS[t]) errors.push(`${p.slug}: unknown tag "${t}"`);
    if (p.metric && !p.metric.context) errors.push(`${p.slug}: headline metric has no context`);
    for (const r of p.results || []) if (!r.context) errors.push(`${p.slug}: result "${r.value}" has no context`);
    if (p.featured && !p.problem) errors.push(`${p.slug}: featured project needs a problem statement`);
  }
  if (errors.length) {
    console.error('Build failed:\n  ' + errors.join('\n  '));
    process.exit(1);
  }
}

// ---------- shared bits ----------
const badges = (p) => {
  const out = [];
  if (p.status && STATUS[p.status]) out.push(`<span class="badge ${STATUS[p.status].cls}">${STATUS[p.status].text}</span>`);
  out.push(`<span class="badge">${esc(p.kind)}</span>`);
  out.push(`<span class="badge">${esc(p.team)}</span>`);
  return `<div class="badges">${out.join('')}</div>`;
};

const metricBlock = (m) =>
  m
    ? `<p class="metric"><span class="metric-value">${esc(m.value)}</span> <span class="metric-label">${esc(m.label)}</span> <span class="metric-context">${esc(m.context)}</span></p>`
    : '';

const techList = (p, max = Infinity) =>
  `<ul class="tech" aria-label="Tech used">${p.tech.slice(0, max).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;

const linkRow = (p, prefix, { details = true } = {}) => {
  const items = [];
  if (details && p.featured) items.push(`<a class="text-link" href="${prefix}projects/${p.slug}.html">Case study<span class="visually-hidden">: ${esc(p.title)}</span></a>`);
  for (const k of ['demo', 'paper', 'code', 'model']) {
    if (!p.links?.[k]) continue;
    items.push(
      `<a class="text-link" href="${esc(p.links[k])}" target="_blank" rel="noopener noreferrer">${LINK_LABEL[k]}<span class="visually-hidden"> for ${esc(p.title)} (opens in a new tab)</span></a>`
    );
  }
  return items.length ? `<div class="card-links">${items.join('')}</div>` : '';
};

async function visual(p, prefix, { sizes = '(max-width: 768px) 100vw, 560px', eager = false } = {}) {
  if (p.image && (await exists(p.image))) {
    return `<img src="${prefix}${p.image}" alt="${esc(p.imageAlt || '')}" width="1280" height="800" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" sizes="${sizes}">`;
  }
  return `<span class="cover" aria-hidden="true">${esc(p.cover || p.title.split(' ')[0])}</span>`;
}

// Results table shown in place of a picture (real HTML table: readable, themeable, accessible)
function dataTable(t, { compact = false } = {}) {
  const hiCol = t.highlightCol ?? -1;
  const hiRow = t.highlight ?? -1;
  const cell = (v, i, tag) => `<${tag}${i === hiCol ? ' class="hi"' : ''}${tag === 'th' && i === 0 ? ' scope="row"' : ''}>${esc(v)}</${tag}>`;
  return `<figure class="data-table${compact ? ' data-table--compact' : ''}">
    <figcaption><span class="dt-title">${esc(t.title)}</span><span class="dt-source">Source: ${esc(t.source)}</span></figcaption>
    <div class="dt-scroll" tabindex="0" role="region" aria-label="${esc(t.title)}">
        <table>
            <thead><tr>${t.head.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
            <tbody>
${t.rows.map((r, ri) => `                <tr${ri === hiRow ? ' class="hi"' : ''}>${r.map((v, i) => cell(v, i, i === 0 ? 'th' : 'td')).join('')}</tr>`).join('\n')}
            </tbody>
        </table>
    </div>
</figure>`;
}

async function cardVisual(p) {
  const t = (p.tables || []).find((x) => !x.detailOnly);
  if (!(p.image && (await exists(p.image))) && t) {
    return `<div class="feat-visual feat-visual--data">${dataTable(t, { compact: true })}</div>`;
  }
  return `<a class="feat-visual" href="projects/${p.slug}.html" tabindex="-1" aria-hidden="true">${await visual(p, '')}</a>`;
}

// ---------- index regions ----------
async function featuredHTML() {
  const cards = [];
  for (const p of projects.filter((x) => x.featured)) {
    cards.push(`<article class="feat-card bezel reveal" data-tags="${p.tags.join(' ')}">
    <div class="core">
        ${await cardVisual(p)}
        <div class="feat-body">
            ${badges(p)}
            <h3><a href="projects/${p.slug}.html">${esc(p.title)}</a></h3>
            <p class="tagline">${esc(p.tagline)}</p>
            ${metricBlock(p.metric)}
            ${techList(p, 5)}
            ${linkRow(p, '')}
        </div>
    </div>
</article>`);
  }
  return cards.join('\n');
}

function gridHTML() {
  return projects
    .filter((p) => !p.featured)
    .map(
      (p) => `<article class="mini-card bezel reveal" data-tags="${p.tags.join(' ')}">
    <div class="core">
        ${badges(p)}
        <h3>${esc(p.title)}</h3>
        <p class="tagline">${esc(p.tagline)}</p>
        ${metricBlock(p.metric)}
        ${p.note ? `<p class="note">${esc(p.note)}</p>` : ''}
        ${p.role ? `<p class="role"><strong>My part:</strong> ${esc(p.role)}</p>` : ''}
        ${techList(p, 4)}
        ${linkRow(p, '', { details: false })}
    </div>
</article>`
    )
    .join('\n');
}

function filtersHTML() {
  const used = Object.keys(TAGS).filter((t) => projects.some((p) => p.tags.includes(t)));
  const btn = (key, label, pressed) =>
    `<button type="button" class="filter-btn" data-filter="${key}" aria-pressed="${pressed}">${esc(label)}</button>`;
  return [btn('all', 'All', true), ...used.map((t) => btn(t, TAGS[t], false))].join('\n');
}

// ---------- detail pages ----------
async function detailPage(p) {
  const title = `${p.title} | Audi Joel Rahardja`;
  const desc = p.tagline;
  const ogImg = p.image && (await exists(p.image)) ? `${SITE}${p.image.replace(/\.webp$/, '.jpg')}` : `${SITE}images/og.jpg`;
  const results = (p.results || []).length
    ? `<section class="cs-block" aria-labelledby="results-h">
                <h2 id="results-h">Results</h2>
                <ul class="results">
${p.results
  .map(
    (r) => `                    <li class="bezel"><div class="core"><span class="metric-value">${esc(r.value)}</span><span class="metric-label">${esc(r.label)}</span><span class="metric-context">${esc(r.context)}</span></div></li>`
  )
  .join('\n')}
                </ul>
                ${p.caveat ? `<p class="caveat"><strong>Caveat:</strong> ${esc(p.caveat)}</p>` : ''}
            </section>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}">
    <link rel="canonical" href="${SITE}projects/${p.slug}.html">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${esc(p.title)}">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:url" content="${SITE}projects/${p.slug}.html">
    <meta property="og:image" content="${ogImg}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="color-scheme" content="light dark">
    <script>/*theme*/document.documentElement.classList.add('js');try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
    <link rel="icon" href="../favicon.svg" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..600&family=Geist:wght@400;500;600&family=Silkscreen&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css?v=__V__">
</head>
<body class="case-study">
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="wallpaper" aria-hidden="true"><span class="blob blob--1"></span><span class="blob blob--2"></span><span class="blob blob--3"></span></div>
    <div class="scroll-progress" aria-hidden="true"><span></span></div>
    <header class="nav-wrap">
        <nav class="nav-pill" aria-label="Main">
            <a href="../index.html" class="nav-mark" aria-label="Home">AJ</a>
            <ul class="nav-links nav-links--always">
                <li><a href="../index.html#projects">All projects</a></li>
            </ul>
            <button type="button" class="theme-toggle" aria-label="Switch to dark theme" hidden></button>
        </nav>
    </header>

    <main id="main" class="cs">
        <article>
            <header class="cs-head">
                <a class="back-link" href="../index.html#projects">← All projects</a>
                ${badges(p)}
                <h1>${esc(p.title)}</h1>
                <p class="cs-tagline">${esc(p.tagline)}</p>
                <p class="cs-meta">${esc(p.dates)}</p>
                ${linkRow(p, '../', { details: false })}
            </header>

            ${
              !(p.image && (await exists(p.image))) && (p.tables || []).length
                ? `<section class="cs-tables" aria-label="Results tables">${p.tables.map((t) => `<div class="bezel"><div class="core">${dataTable(t)}</div></div>`).join('\n')}</section>`
                : `<figure class="cs-visual bezel"><div class="core">${await visual(p, '../', { sizes: '(max-width: 1180px) 100vw, 1100px', eager: true })}</div></figure>`
            }

            <div class="cs-grid">
                <section class="cs-block" aria-labelledby="problem-h">
                    <h2 id="problem-h">Problem</h2>
                    <p>${esc(p.problem)}</p>
                </section>
                <section class="cs-block" aria-labelledby="approach-h">
                    <h2 id="approach-h">Approach</h2>
                    <ul class="cs-list">
${p.approach.map((a) => `                        <li>${esc(a)}</li>`).join('\n')}
                    </ul>
                </section>
                <section class="cs-block" aria-labelledby="role-h">
                    <h2 id="role-h">My role</h2>
                    <p>${esc(p.role)}</p>
                    <p class="cs-team">${esc(p.team)} · ${esc(p.kind)}</p>
                </section>
                <section class="cs-block" aria-labelledby="tech-h">
                    <h2 id="tech-h">Tech</h2>
                    ${techList(p)}
                </section>
            </div>
            ${results}
            ${p.citation ? `<section class="cs-block" aria-labelledby="cite-h"><h2 id="cite-h">Citation</h2><p class="citation">${esc(p.citation)}</p></section>` : ''}
        </article>
    </main>

    <footer class="footer">
        <div class="footer-row">
            <div class="footer-links">
                <a href="../index.html#contact">Contact</a>
                <a href="https://github.com/AudiJRahardja" target="_blank" rel="noopener noreferrer">GitHub</a>
                <a href="https://www.linkedin.com/in/audijoelrahardja/" target="_blank" rel="noopener noreferrer">LinkedIn</a>            </div>
            <div class="pixel-controls" data-pixel-controls hidden></div>
            <p>&copy; 2026 Audi Joel Rahardja</p>
        </div>
    </footer>
    <script src="../pixel.js?v=__V__" defer></script>
    <script src="../script.js?v=__V__" defer></script>
</body>
</html>
`;
}

// ---------- run ----------
validate();

const version = Date.now().toString(36);
let index = await readFile(path.join(root, 'index.html'), 'utf8');
const regions = { featured: await featuredHTML(), grid: gridHTML(), filters: filtersHTML() };

for (const [name, html] of Object.entries(regions)) {
  const re = new RegExp(`([ \\t]*)<!-- build:${name} -->[\\s\\S]*?<!-- /build:${name} -->`);
  const m = index.match(re);
  if (!m) { console.warn(`  (no build:${name} region in index.html yet, skipped)`); continue; }
  const pad = m[1];
  index = index.replace(re, `${pad}<!-- build:${name} -->\n${indent(html, pad.length)}\n${pad}<!-- /build:${name} -->`);
}
index = index.replace(/(style\.css|script\.js|pixel\.js)\?v=[\w]+/g, `$1?v=${version}`);
await writeFile(path.join(root, 'index.html'), index);

await mkdir(path.join(root, 'projects'), { recursive: true });
const featured = projects.filter((p) => p.featured);
for (const p of featured) {
  const html = (await detailPage(p)).replaceAll('__V__', version);
  await writeFile(path.join(root, 'projects', `${p.slug}.html`), html);
}

// sitemap + robots for search engines
const urls = ['', ...featured.map((p) => `projects/${p.slug}.html`)];
await writeFile(
  path.join(root, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}
</urlset>
`
);
await writeFile(path.join(root, 'robots.txt'), `User-agent: *
Allow: /
Sitemap: ${SITE}sitemap.xml
`);

console.log(`Built: index.html regions [${Object.keys(regions).join(', ')}], ${featured.length} case-study pages, asset version ${version}.`);
