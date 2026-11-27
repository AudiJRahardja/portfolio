// Zero-dependency static build for the portfolio.
//   node tools/build.mjs
// Reads data/projects.mjs and:
//   1. rewrites the regions between <!-- build:NAME --> ... <!-- /build:NAME --> in index.html
//   2. writes one static detail page per featured project to projects/<slug>.html
// The output is plain HTML, so GitHub Pages serves it as-is and it works without JavaScript.

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { projects as rawProjects, TAGS } from '../data/projects.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://audijrahardja.github.io/portfolio/';

// ---------- helpers ----------
const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const exists = (p) => access(path.join(root, p)).then(() => true, () => false);
const indent = (html, n) => html.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');

const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';

const STATUS = {
  shipped: { cls: 'badge--live', text: 'Shipped' },
  'in-progress': { cls: 'badge--wip', text: 'In progress' },
  planned: { cls: 'badge--plan', text: 'Planned' },
};

const LINK_LABEL = { demo: 'Live demo', code: 'Code', paper: 'Paper (IEEE Xplore)', model: 'Model', video: 'Video' };

// ---------- TODOs: unknown facts stay in the data file, never on the site ----------
const isTodo = (v) => typeof v === 'string' && /^TODO\b/.test(v.trim());
const todos = [];
function stripTodos(v, where) {
  if (Array.isArray(v)) {
    return v.flatMap((x, i) => {
      if (isTodo(x)) { todos.push(`${where}[${i}]: ${x}`); return []; }
      return [stripTodos(x, `${where}[${i}]`)];
    });
  }
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, x] of Object.entries(v)) {
      if (isTodo(x)) { todos.push(`${where}.${k}: ${x}`); continue; }
      out[k] = stripTodos(x, `${where}.${k}`);
    }
    return out;
  }
  return v;
}
const projects = rawProjects.map((p) => stripTodos(p, p.slug));
const hasDD = (p) => Array.isArray(p.pipeline) && p.pipeline.length > 0;
const ddProjects = projects.filter(hasDD);
const hasPage = (p) => p.featured || hasDD(p);

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
    if (!STATUS[p.status]) errors.push(`${p.slug}: status must be shipped, in-progress or planned`);
    if (hasDD(p)) {
      const rawP = rawProjects.find((r) => r.slug === p.slug);
      for (const f of ['problem', 'role']) if (!p[f] && !isTodo(rawP[f])) errors.push(`${p.slug}: deep-dive needs "${f}"`);
      for (const s of p.pipeline) {
        const raw = rawProjects.find((r) => r.slug === p.slug).pipeline.find((x) => x.id === s.id) || {};
        for (const f of ['id', 'label', 'input', 'operation', 'output']) if (!s[f] && !isTodo(raw[f])) errors.push(`${p.slug}/${s.id}: stage needs "${f}"`);
        if (!s.bullets || s.bullets.length < 1 || s.bullets.length > 3) errors.push(`${p.slug}/${s.id}: stage needs 1-3 bullets`);
        if (s.status && !STAGE_STATUS[s.status]) errors.push(`${p.slug}/${s.id}: unknown stage status "${s.status}"`);
      }
      for (const r of p.results || []) if (!r.source) errors.push(`${p.slug}: result "${r.value}" has no source file`);
      for (const r of p.results || []) if (r.model && !r.baseline) errors.push(`${p.slug}: model score "${r.value}" needs a baseline`);
      const bars = p.chart?.bars || [];
      if (p.chart && !p.chart.source) errors.push(`${p.slug}: chart has no source file`);
      if (bars.some((b) => b.model) && !bars.some((b) => b.baseline)) errors.push(`${p.slug}: model chart needs a baseline bar`);
    }
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
  if (p.published) out.push('<span class="badge badge--pub">Published · IEEE</span>');
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
  if (hasDD(p)) items.push(`<a class="text-link" href="${prefix}projects/${p.slug}.html" data-dd="${p.slug}">Explore the pipeline<span class="visually-hidden">: ${esc(p.title)}</span></a>`);
  else if (details && p.featured) items.push(`<a class="text-link" href="${prefix}projects/${p.slug}.html">Case study<span class="visually-hidden">: ${esc(p.title)}</span></a>`);
  for (const k of ['demo', 'paper', 'code', 'model', 'video']) {
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
  return `<a class="feat-visual" href="projects/${p.slug}.html"${hasDD(p) ? ` data-dd="${p.slug}"` : ''} tabindex="-1" aria-hidden="true">${await visual(p, '')}</a>`;
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
            <h3><a href="projects/${p.slug}.html"${hasDD(p) ? ` data-dd="${p.slug}"` : ''}>${esc(p.title)}</a></h3>
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
      (p) => `<article class="mini-card bezel reveal${hasDD(p) ? ' has-dd' : ''}" data-tags="${p.tags.join(' ')}">
    <div class="core">
        ${badges(p)}
        <h3>${hasDD(p) ? `<a href="projects/${p.slug}.html" data-dd="${p.slug}">${esc(p.title)}</a>` : esc(p.title)}</h3>
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

// ---------- deep-dive (popup on the home page + static page) ----------
const STAGE_STATUS = { done: 'Done', 'in-progress': 'Ongoing', planned: 'Planned' };
const num = (i) => String(i + 1).padStart(2, '0');
const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10-6.5z"/></svg>';
const LINK_ICON = { demo: ARROW, code: ARROW, paper: ARROW, model: ARROW, video: ARROW };

function pipelineHTML(p) {
  const st = p.pipeline;
  const sid = (s) => `${p.slug}-st-${s.id}`;
  const planned = st.filter((s) => s.status === 'planned').length;
  const parts = st.map((s, i) => {
    const status = s.status || 'done';
    const node = `<button type="button" class="pipe-node pipe-node--${status}" id="${sid(s)}-btn" aria-controls="${sid(s)}" aria-pressed="${i === 0}" data-i="${i}">
                        <span class="pn-num">${num(i)}</span>
                        <span class="pn-label">${esc(s.label)}</span>
                        ${s.tech ? `<span class="pn-tech">${esc(s.tech)}</span>` : ''}
                        ${status !== 'done' ? `<span class="pn-status">${STAGE_STATUS[status]}</span>` : ''}
                    </button>`;
    const card = (k, label, v) =>
      `<div class="pd-card pd-card--${k}"><span class="pd-k">${label}</span><p>${v ? esc(v) : '<span class="pd-unknown">Not known yet</span>'}</p></div>`;
    const detail = `<div class="pipe-detail" id="${sid(s)}" role="region" aria-labelledby="${sid(s)}-h">
                        <div class="pd-head">
                            <span class="pd-num">Stage ${num(i)} of ${num(st.length - 1)}</span>
                            <h4 id="${sid(s)}-h">${esc(s.label)}</h4>
                            <span class="pd-status pd-status--${status}">${STAGE_STATUS[status]}</span>
                        </div>
                        <div class="pd-io">
                            ${card('in', 'Input', s.input)}
                            <span class="pd-arrow" aria-hidden="true"></span>
                            ${card('op', 'Operation', s.operation)}
                            <span class="pd-arrow" aria-hidden="true"></span>
                            ${card('out', 'Output', s.output)}
                        </div>
                        <ul class="pd-bullets">${s.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
                        ${s.flow ? `<p class="pd-flow"><span class="visually-hidden">Flow: </span><code>${esc(s.flow)}</code></p>` : ''}
                    </div>`;
    const next = st[i + 1];
    const link = next
      ? `<span class="pipe-link${next.status === 'planned' ? ' pipe-link--planned' : ''}" aria-hidden="true"><svg viewBox="0 0 40 14" preserveAspectRatio="none"><path class="pl-line" d="M1 7H33"/><path class="pl-head" d="M31 2.5 37.5 7 31 11.5"/></svg></span>`
      : '';
    return `<div class="pipe-stage">
                    ${node}
                    ${detail}
                </div>${link}`;
  });
  const cols = `repeat(${st.length - 1}, minmax(0, 1fr) 1.75rem) minmax(0, 1fr)`;
  return `<section class="dd-block dd-pipeline" aria-labelledby="${p.slug}-pipe-h">
            <div class="dd-block-head">
                <h2 id="${p.slug}-pipe-h">How it <em>works</em></h2>
                <button type="button" class="btn btn--ghost btn--sm pipe-run" hidden><span class="pipe-run-label">Run trace</span><span class="btn-icon">${PLAY}</span></button>
            </div>
            <p class="dd-hint">${st.length} stages${planned ? `, ${planned} still planned (dashed)` : ''}.<span class="pipe-hint-js" hidden> Pick a stage to see what goes in, what happens and what comes out. Arrow keys move between stages.</span></p>
            <div class="pipe-wrap">
                <div class="pipe" role="group" aria-label="Pipeline stages" style="--cols: ${cols}">
                ${parts.join('\n                ')}
                </div>
            </div>
            <p class="visually-hidden pipe-live" aria-live="polite"></p>
        </section>`;
}

function statsHTML(p) {
  const rs = p.results || [];
  if (!rs.length && !p.chart && !p.resultsNote) return '';
  const stat = (r) => `<li class="bezel"><div class="core">
                    <span class="metric-value">${esc(r.value)}</span>
                    <span class="metric-label">${esc(r.label)}</span>
                    ${r.baseline ? `<span class="dd-base">Baseline: ${esc(r.baseline)}</span>` : ''}
                    ${r.plain ? `<span class="dd-plain">${esc(r.plain)}</span>` : ''}
                    <span class="metric-context">${esc(r.context)}</span>
                    <span class="dd-source">Source: <code>${esc(r.source)}</code></span>
                </div></li>`;
  const c = p.chart;
  let chart = '';
  if (c) {
    const max = Math.max(...c.bars.map((b) => b.value));
    const fmt = (v) => (c.unit === '%' ? `${v}%` : v.toLocaleString('en-US'));
    chart = `<figure class="dd-chart bezel"><div class="core">
                <figcaption><span class="dt-title">${esc(c.title)}</span><span class="dt-source">Source: <code>${esc(c.source)}</code></span></figcaption>
                <ul class="bars">
${c.bars
  .map(
    (b) => `                    <li class="bar${b.baseline ? ' bar--base' : ''}${b.model ? ' bar--model' : ''}"><span class="bar-label">${esc(b.label)}${b.baseline ? ' <span class="bar-tag">baseline</span>' : ''}</span><span class="bar-track" aria-hidden="true"><span class="bar-fill" style="--w: ${((b.value / max) * 100).toFixed(1)}%"></span></span><span class="bar-value">${fmt(b.value)}</span></li>`
  )
  .join('\n')}
                </ul>
                ${c.plain ? `<p class="dd-plain">${esc(c.plain)}</p>` : ''}
            </div></figure>`;
  }
  return `<section class="dd-block" aria-labelledby="${p.slug}-res-h">
            <h2 id="${p.slug}-res-h">Results <em>so far</em></h2>
            ${p.resultsNote ? `<p class="dd-note">${esc(p.resultsNote)}</p>` : ''}
            ${rs.length ? `<ul class="dd-stats">${rs.map(stat).join('\n')}</ul>` : ''}
            ${chart}
            ${p.caveat ? `<p class="caveat"><strong>Caveat:</strong> ${esc(p.caveat)}</p>` : ''}
        </section>`;
}

async function deepDive(p, prefix) {
  const i = ddProjects.indexOf(p);
  const prev = ddProjects[(i - 1 + ddProjects.length) % ddProjects.length];
  const next = ddProjects[(i + 1) % ddProjects.length];
  const btns = ['demo', 'paper', 'code', 'model', 'video']
    .filter((k) => p.links?.[k])
    .map(
      (k, n) =>
        `<a class="btn ${n === 0 ? 'btn--solid' : 'btn--ghost'} btn--sm" href="${esc(p.links[k])}" target="_blank" rel="noopener noreferrer">${LINK_LABEL[k]}<span class="visually-hidden"> (opens in a new tab)</span><span class="btn-icon">${LINK_ICON[k]}</span></a>`
    );
  const hasImg = p.image && (await exists(p.image));
  const list = (items) => `<ul class="cs-list">${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  const pager =
    ddProjects.length > 1
      ? `<nav class="dd-pager" aria-label="More projects">
            <a href="${prefix}projects/${prev.slug}.html" data-dd="${prev.slug}" rel="prev"><span class="dd-pager-k">← Previous</span><span class="dd-pager-t">${esc(prev.title)}</span></a>
            <a href="${prefix}projects/${next.slug}.html" data-dd="${next.slug}" rel="next"><span class="dd-pager-k">Next →</span><span class="dd-pager-t">${esc(next.title)}</span></a>
        </nav>`
      : '';
  return `<article class="dd" data-slug="${p.slug}" aria-labelledby="${p.slug}-title">
        <header class="dd-head">
            <a class="back-link" href="${prefix}index.html#projects">← All projects</a>
            ${badges(p)}
            <h1 id="${p.slug}-title">${esc(p.title)}</h1>
            <p class="cs-tagline">${esc(p.tagline)}</p>
            <p class="cs-meta">${esc(p.dates)}</p>
            ${btns.length ? `<div class="dd-actions">${btns.join('')}</div>` : ''}
            ${(p.related || []).map((r) => `<p class="dd-related"><a class="text-link" href="${esc(r.href)}" target="_blank" rel="noopener noreferrer">${esc(r.label)}<span class="visually-hidden"> (opens in a new tab)</span></a></p>`).join('')}
        </header>
        ${hasImg ? `<figure class="cs-visual bezel"><div class="core">${await visual(p, prefix, { sizes: '(max-width: 1180px) 100vw, 1000px' })}</div></figure>` : ''}

        <div class="dd-grid">
            <section class="dd-block" aria-labelledby="${p.slug}-prob-h">
                <h2 id="${p.slug}-prob-h">The <em>problem</em></h2>
                <p>${esc(p.problem)}</p>
            </section>
            <section class="dd-block" aria-labelledby="${p.slug}-role-h">
                <h2 id="${p.slug}-role-h">My <em>part</em></h2>
                <p>${p.role ? esc(p.role) : '<span class="pd-unknown">To be decided.</span>'}</p>
                <p class="cs-team">${esc(p.team)} · ${esc(p.kind)}</p>
                <ul class="tech" aria-label="Tech used">${p.tech.map((t) => `<li>${esc(t)}</li>`).join('')}${(p.techPlanned || []).map((t) => `<li class="tech--planned">${esc(t)}<span class="visually-hidden"> (planned)</span></li>`).join('')}</ul>
            </section>
        </div>

        ${pipelineHTML(p)}
        ${statsHTML(p)}
        ${(p.tables || []).length ? `<div class="cs-tables dd-tables">${p.tables.map((t) => `<div class="bezel"><div class="core">${dataTable(t)}</div></div>`).join('\n')}</div>` : ''}
        ${p.citation ? `<section class="dd-block" aria-labelledby="${p.slug}-cite-h"><h2 id="${p.slug}-cite-h">Cite <em>it</em></h2><p class="citation">${esc(p.citation)}</p></section>` : ''}
        ${
          p.embed
            ? `<section class="dd-block" aria-labelledby="${p.slug}-try-h">
            <h2 id="${p.slug}-try-h">Try <em>it</em></h2>
            <div class="dd-try" data-embed="${esc(p.embed.url)}" data-embed-title="${esc(p.embed.title)}">
                <p>${esc(p.embed.note || 'The live demo loads from an outside site, so it only starts when you ask.')}</p>
                <button type="button" class="btn btn--solid btn--sm">Load the demo<span class="btn-icon">${PLAY}</span></button>
                <a class="text-link" href="${esc(p.embed.url)}" target="_blank" rel="noopener noreferrer">Or open it in a new tab</a>
            </div>
        </section>`
            : ''
        }
        ${
          (p.learnings || []).length || (p.next || []).length
            ? `<div class="dd-grid">
            ${(p.learnings || []).length ? `<section class="dd-block" aria-labelledby="${p.slug}-learn-h"><h2 id="${p.slug}-learn-h">What I <em>learned</em></h2>${list(p.learnings)}</section>` : ''}
            ${(p.next || []).length ? `<section class="dd-block" aria-labelledby="${p.slug}-next-h"><h2 id="${p.slug}-next-h">What's <em>next</em></h2>${list(p.next)}</section>` : ''}
        </div>`
            : ''
        }
        ${pager}
    </article>`;
}

// ---------- detail pages ----------
async function detailPage(p) {
  const dd = hasDD(p) ? await deepDive(p, '../') : null;
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
    <script>/*theme*/(function(){var r=document.documentElement,t=null;r.classList.add('js');try{t=localStorage.getItem('theme')}catch(e){}if(t)r.dataset.theme=t;if((t||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'))==='dark')r.classList.add('is-night')})()</script>
    <link rel="icon" href="../favicon.svg" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..600&family=Geist:wght@400;500;600&family=Silkscreen&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css?v=__V__">
</head>
<body class="case-study${dd ? " dd-page" : ""}">
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="wallpaper" aria-hidden="true"><span class="blob blob--1"></span><span class="blob blob--2"></span><span class="blob blob--3"></span><span class="sun"></span><span class="moon"></span><canvas class="stars"></canvas></div>
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
        ${dd ?? `
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
        </article>`}
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
    ${dd ? '<script src="../deepdive.js?v=__V__" defer></script>' : ''}
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
index = index.replace(/(style\.css|script\.js|pixel\.js|deepdive\.js)\?v=[\w]+/g, `$1?v=${version}`);
await writeFile(path.join(root, 'index.html'), index);

await mkdir(path.join(root, 'projects'), { recursive: true });
const featured = projects.filter(hasPage);
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

console.log(`Built: index.html regions [${Object.keys(regions).join(', ')}], ${featured.length} project pages (${ddProjects.length} deep-dive), asset version ${version}.`);
if (todos.length) console.log(`\n${todos.length} TODO(s) hidden from the site, fill them in data/projects.mjs:\n  ` + todos.join('\n  '));
