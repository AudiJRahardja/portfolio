// Project deep-dives.
//  - The pipeline explorer works on the static pages (projects/<slug>.html) and inside the popup.
//  - On the home page, links with data-dd open the deep-dive in a <dialog> instead of a new page.
//    The address becomes #/projects/<slug>, so a popup can be linked to and Back closes it.
//    Without JS the links simply go to the static page.
(() => {
    const STEP_MS = 700;

    // ---------- pipeline explorer ----------
    function initPipelines(root) {
        root.querySelectorAll('.dd-pipeline:not([data-ready])').forEach((sec) => {
            sec.dataset.ready = '';
            const nodes = [...sec.querySelectorAll('.pipe-node')];
            if (!nodes.length) return;
            const panels = nodes.map((n) => sec.querySelector(`#${CSS.escape(n.getAttribute('aria-controls'))}`));
            const links = [...sec.querySelectorAll('.pipe-link')];
            const run = sec.querySelector('.pipe-run');
            const runLabel = run.querySelector('.pipe-run-label');
            const live = sec.querySelector('.pipe-live');
            let cur = 0;
            let timer = null;

            const select = (i, { focus = false, trace = false } = {}) => {
                cur = i;
                nodes.forEach((n, k) => {
                    const on = k === i;
                    n.setAttribute('aria-pressed', String(on));
                    n.tabIndex = on ? 0 : -1;
                    n.classList.toggle('is-traced', trace && k < i);
                    panels[k].hidden = !on;
                });
                links.forEach((l, k) => l.classList.toggle('is-lit', trace && k < i));
                if (focus) nodes[i].focus();
            };

            const stop = (message) => {
                if (!timer) return;
                clearInterval(timer);
                timer = null;
                runLabel.textContent = 'Run trace';
                if (message) live.textContent = message;
            };

            const start = () => {
                select(0, { trace: true });
                runLabel.textContent = 'Stop trace';
                live.textContent = `Running through all ${nodes.length} stages.`;
                timer = setInterval(() => {
                    if (!sec.isConnected || !sec.offsetParent) { stop(); return; } // popup closed
                    if (cur + 1 < nodes.length) { select(cur + 1, { trace: true }); return; }
                    nodes.forEach((n) => n.classList.add('is-traced'));
                    stop(`Done: stage ${nodes.length}, ${nodes[cur].querySelector('.pn-label').textContent}.`);
                }, STEP_MS);
            };

            nodes.forEach((n, i) => {
                n.addEventListener('click', () => { stop(); select(i); });
                n.addEventListener('keydown', (e) => {
                    const last = nodes.length - 1;
                    const to = { ArrowRight: cur + 1, ArrowDown: cur + 1, ArrowLeft: cur - 1, ArrowUp: cur - 1, Home: 0, End: last }[e.key];
                    if (to === undefined) return;
                    e.preventDefault();
                    stop();
                    select(Math.max(0, Math.min(last, to)), { focus: true });
                });
            });
            run.addEventListener('click', () => (timer ? stop('Trace stopped.') : start()));

            // wide layout: the stages zig-zag up and down, so each connector is an S-curve drawn
            // from the middle of one stage to the middle of the next (measured, then redrawn on resize)
            const drawLinks = () => {
                links.forEach((l, k) => {
                    const svg = l.querySelector('svg');
                    if (!svg || getComputedStyle(svg).display === 'none') return;
                    const r = l.getBoundingClientRect();
                    if (!r.width || !r.height) return;
                    const a = nodes[k].getBoundingClientRect();
                    const b = nodes[k + 1].getBoundingClientRect();
                    const w = r.width, h = r.height;
                    const y1 = a.top + a.height / 2 - r.top, y2 = b.top + b.height / 2 - r.top;
                    const x2 = w - 2;
                    svg.setAttribute('viewBox', `0 0 ${w.toFixed(1)} ${h.toFixed(1)}`);
                    const [line, head] = svg.querySelectorAll('path');
                    line.setAttribute('d', `M1 ${y1.toFixed(1)} C ${(w * 0.6).toFixed(1)} ${y1.toFixed(1)}, ${(w * 0.4).toFixed(1)} ${y2.toFixed(1)}, ${(x2 - 1).toFixed(1)} ${y2.toFixed(1)}`);
                    head.setAttribute('d', `M${(x2 - 6).toFixed(1)} ${(y2 - 4.5).toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} L${(x2 - 6).toFixed(1)} ${(y2 + 4.5).toFixed(1)}`);
                });
            };
            if (window.ResizeObserver) new ResizeObserver(() => requestAnimationFrame(drawLinks)).observe(sec.querySelector('.pipe'));

            sec.classList.add('is-live');
            sec.querySelector('.pipe-hint-js').hidden = false;
            run.hidden = false;
            select(0);
        });
    }

    // ---------- "Try it": outside demos only load after a click ----------
    function initEmbeds(root) {
        root.querySelectorAll('.dd-try[data-embed]:not([data-ready])').forEach((box) => {
            box.dataset.ready = '';
            box.querySelector('button')?.addEventListener('click', () => {
                const f = document.createElement('iframe');
                f.src = box.dataset.embed;
                f.title = box.dataset.embedTitle || 'Live demo';
                f.loading = 'lazy';
                f.allow = 'clipboard-write';
                box.replaceChildren(f);
                f.focus();
            });
        });
    }

    initPipelines(document);
    initEmbeds(document);

    // ---------- popup (home page only) ----------
    if (document.body.classList.contains('case-study') || !document.querySelector('a[data-dd]') || !window.HTMLDialogElement) return;

    const HASH = '#/projects/';
    const base = new URL('./', location.href);
    const cache = new Map();

    const load = (slug) => {
        if (!cache.has(slug)) {
            const p = fetch(new URL(`projects/${slug}.html`, base))
                .then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
                .then((html) => {
                    const art = new DOMParser().parseFromString(html, 'text/html').querySelector('article.dd');
                    if (!art) throw new Error('no deep-dive');
                    // the static page lives one folder down: make its links work from here
                    art.querySelectorAll('[src], [href]').forEach((el) => {
                        for (const a of ['src', 'href']) {
                            const v = el.getAttribute(a);
                            if (v && v.startsWith('../')) el.setAttribute(a, v.slice(3));
                        }
                    });
                    return art;
                });
            p.catch(() => cache.delete(slug));
            cache.set(slug, p);
        }
        return cache.get(slug).then((art) => art.cloneNode(true));
    };

    const dlg = document.createElement('dialog');
    dlg.className = 'dd-dialog';
    dlg.innerHTML = `<button type="button" class="dd-close" aria-label="Close project"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
        <div class="dd-frame"><div class="dd-body"></div></div>`;
    document.body.append(dlg);
    const frame = dlg.querySelector('.dd-frame');
    const body = dlg.querySelector('.dd-body');

    let opener = null;
    let pushed = false; // we added a history entry for the open popup
    let current = null;

    const slugFromHash = () => (location.hash.startsWith(HASH) ? decodeURIComponent(location.hash.slice(HASH.length)) : null);

    async function show(slug, { history: mode = 'push', from = null } = {}) {
        if (from) opener = from;
        current = slug;
        if (mode === 'push') { history.pushState({ dd: slug }, '', HASH + slug); pushed = true; }
        if (mode === 'replace') history.replaceState(history.state, '', HASH + slug);
        const swapping = dlg.open;
        if (!swapping) {
            body.innerHTML = '<p class="dd-loading">Loading…</p>';
            dlg.showModal();
        }
        try {
            const art = await load(slug);
            if (current !== slug) return;
            body.replaceChildren(art);
            dlg.setAttribute('aria-labelledby', art.getAttribute('aria-labelledby'));
            initPipelines(art);
            initEmbeds(art);
            frame.scrollTop = 0;
            if (swapping) {
                const h = art.querySelector('h1');
                h.tabIndex = -1;
                h.focus({ preventScroll: true });
            }
        } catch {
            location.href = new URL(`projects/${slug}.html`, base).href; // fall back to the static page
        }
    }

    function finish() {
        current = null;
        pushed = false;
        if (dlg.open) dlg.close();
        body.replaceChildren();
        if (opener?.isConnected) opener.focus({ preventScroll: true });
        opener = null;
    }

    function requestClose() {
        if (pushed && history.state?.dd) { history.back(); return; } // popstate finishes the close
        history.replaceState(null, '', location.pathname + location.search);
        finish();
    }

    dlg.addEventListener('cancel', (e) => { e.preventDefault(); requestClose(); }); // Esc
    dlg.querySelector('.dd-close').addEventListener('click', requestClose);
    dlg.addEventListener('click', (e) => {
        if (e.target !== dlg) return;
        const r = dlg.getBoundingClientRect();
        const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        if (!inside) requestClose(); // click on the dimmed backdrop
    });

    window.addEventListener('popstate', () => {
        const slug = slugFromHash();
        if (slug) show(slug, { history: 'none' });
        else if (dlg.open) finish();
    });

    document.addEventListener('click', (e) => {
        const a = e.target.closest('a[data-dd]');
        if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        const slug = a.dataset.dd;
        if (dlg.contains(a)) show(slug, { history: 'replace' }); // prev / next inside the popup
        else show(slug, { from: a.closest('article')?.querySelector('h3 a') || a });
    });

    // start loading as soon as someone points at or tabs to a card
    const warm = (e) => { const a = e.target.closest?.('a[data-dd]'); if (a) load(a.dataset.dd).catch(() => {}); };
    document.addEventListener('pointerover', warm, { passive: true });
    document.addEventListener('focusin', warm);

    const initial = slugFromHash();
    if (initial) show(initial, { history: 'none' });
})();
