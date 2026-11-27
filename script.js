// 0. Contact: the WhatsApp button is built here, not in the HTML, so the number
//    never appears in the page source. That keeps it away from basic scrapers
//    (not foolproof, but it cuts most spam).
(() => {
    const slot = document.querySelector('[data-wa]');
    if (!slot) return;
    const n = ['62', '821', '1070', '8088'].join('');
    const msg = 'Hi Audi, I saw your portfolio and would like to get in touch.';
    const a = document.createElement('a');
    a.className = 'btn btn--solid btn--wa';
    a.href = `https://wa.me/${n}?text=${encodeURIComponent(msg)}`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.innerHTML =
        '<svg class="btn-logo" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.2 4.24-9.44 9.45-9.44a9.4 9.4 0 0 1 9.44 9.45c0 5.21-4.24 9.44-9.45 9.44m8.04-17.48A11.3 11.3 0 0 0 12.05.7C5.78.7.68 5.8.68 12.06c0 2 .52 3.96 1.52 5.68L.58 23.7l6.1-1.6a11.3 11.3 0 0 0 5.37 1.37h.01c6.26 0 11.36-5.1 11.36-11.36 0-3.04-1.18-5.89-3.33-8.04"/></svg>' +
        '<span>Chat on WhatsApp<span class="visually-hidden"> (opens in a new tab)</span></span>' +
        '<span class="btn-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg></span>';
    slot.append(a);
    slot.hidden = false;
})();


// 0b. Theme toggle: follows the system until the visitor picks one, then remembers it.
(() => {
    const btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
    const MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
    const current = () => root.dataset.theme || (media.matches ? 'dark' : 'light');
    // The sun / moon in the sky is a second theme switch (only clickable near the top of the page,
    // so it never sits over page content while scrolling).
    const sky = document.createElement('button');
    sky.type = 'button';
    sky.className = 'sky-toggle';
    document.body.append(sky);
    const render = () => {
        const dark = current() === 'dark';
        btn.innerHTML = dark ? SUN : MOON;
        btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
        sky.setAttribute('aria-label', dark ? 'Moon: switch to light theme' : 'Sun: switch to dark theme');
    };
    const skyVisible = () => { sky.hidden = scrollY > 160; };
    addEventListener('scroll', skyVisible, { passive: true });
    skyVisible();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = (next) => {
        root.dataset.theme = next;
        try { localStorage.setItem('theme', next); } catch (e) { /* private mode: still works for this visit */ }
        render();
    };
    const toggle = (origin) => {
        const next = current() === 'dark' ? 'light' : 'dark';
        if (reducedMotion.matches) { apply(next); return; }

        // Slow circular reveal from whatever was clicked (View Transitions), or a gentle colour fade as fallback.
        if (document.startViewTransition) {
            const r = origin.getBoundingClientRect();
            const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            root.style.setProperty('--vt-x', `${cx}px`);
            root.style.setProperty('--vt-y', `${cy}px`);
            root.style.setProperty('--vt-r', `${Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy))}px`);
            document.startViewTransition(() => apply(next));
        } else {
            root.classList.add('theme-fade');
            apply(next);
            setTimeout(() => root.classList.remove('theme-fade'), 900);
        }
    };
    btn.addEventListener('click', () => toggle(btn));
    sky.addEventListener('click', () => toggle(sky));
    media.addEventListener('change', render);
    render();
    btn.hidden = false;
})();


// 0c. CV download: only shown once cv.pdf actually exists next to the page.
(() => {
    const slots = document.querySelectorAll('[data-cv]');
    if (!slots.length || location.protocol === 'file:') return;
    fetch('cv.pdf', { method: 'HEAD' })
        .then((r) => { if (r.ok) slots.forEach((el) => { el.hidden = false; }); })
        .catch(() => { /* no CV yet: keep the button hidden */ });
})();


// 1. Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { rootMargin: '0px 0px -10% 0px' });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));


// 2. Navigation: active link + mobile menu
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
    });
}, { rootMargin: '-45% 0px -50% 0px' });

document.querySelectorAll('#about, #projects, #experiences, #contact').forEach((s) => sectionObserver.observe(s));

const navToggle = document.querySelector('.nav-toggle');
const menuOverlay = document.getElementById('menu-overlay');

const setMenu = (open) => {
    if (!navToggle || !menuOverlay) return;
    document.body.classList.toggle('menu-open', open);
    navToggle.setAttribute('aria-expanded', open);
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuOverlay.setAttribute('aria-hidden', !open);
    menuOverlay.inert = !open; // closed menu links can't be reached with Tab
    document.body.style.overflow = open ? 'hidden' : '';
};

if (navToggle && menuOverlay) {
    navToggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
    menuOverlay.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
            setMenu(false);
            navToggle.focus();
        }
    });
}


// 3. Project filters (progressive enhancement: without JS every card stays visible)
(() => {
    const bar = document.querySelector('[data-filter-bar]');
    if (!bar) return;
    const buttons = Array.from(bar.querySelectorAll('.filter-btn'));
    const cards = Array.from(document.querySelectorAll('.feat-card, .mini-card'));
    const status = document.querySelector('[data-filter-status]');
    const empty = document.querySelector('[data-filter-empty]');
    const miniCards = cards.filter((c) => c.classList.contains('mini-card'));

    const apply = (filter) => {
        let shown = 0;
        cards.forEach((card) => {
            const match = filter === 'all' || card.dataset.tags.split(' ').includes(filter);
            card.hidden = !match;
            if (match) {
                shown++;
                card.classList.add('visible'); // don't leave newly shown cards waiting on the scroll reveal
            }
        });
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
        if (empty) empty.hidden = miniCards.some((c) => !c.hidden);
        if (status) {
            const label = buttons.find((b) => b.dataset.filter === filter)?.textContent ?? filter;
            status.textContent = filter === 'all' ? `Showing all ${shown} projects` : `Showing ${shown} ${label} project${shown === 1 ? '' : 's'}`;
        }
    };

    buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter)));
    bar.hidden = false;
})();


// 4. Reading progress bar
(() => {
    const bar = document.querySelector('.scroll-progress span');
    if (!bar) return;
    let ticking = false;
    const update = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
        ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
})();


// 5. Cards: a soft light follows the pointer; featured cards tilt slightly (mouse only, not with reduced motion)
(() => {
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine) return;
    document.querySelectorAll('.feat-card, .mini-card, .skills .bezel, .exp-list > li, .pub-card, .results .bezel').forEach((card) => {
        card.classList.add('spot');
        const tilt = !calm && card.classList.contains('feat-card');
        card.addEventListener('pointermove', (e) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
            card.style.setProperty('--mx', `${px * 100}%`);
            card.style.setProperty('--my', `${py * 100}%`);
            if (tilt) card.style.transform = `perspective(1200px) rotateX(${(0.5 - py) * 3}deg) rotateY(${(px - 0.5) * 4}deg)`;
        });
        card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
})();


// 6. Hero: rotating "currently" line (static text stays for screen readers)
(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; // keep the first wording, no cycling
    document.querySelectorAll('[data-rotate]').forEach((el, n) => {
        const words = JSON.parse(el.dataset.rotate);
        let i = Math.max(0, words.indexOf(el.textContent.trim()));
        setTimeout(() => setInterval(() => {
            if (document.hidden) return;
            el.classList.add('out');
            setTimeout(() => {
                i = (i + 1) % words.length;
                el.textContent = words[i];
                el.classList.remove('out');
            }, 350);
        }, n === 0 ? 2800 : 3400), n * 700); // stagger so they don't change at the same moment
    });
})();



// 7. Night sky: twinkling stars and the occasional shooting star (drawn only in dark mode)
(() => {
    const canvas = document.querySelector('.stars');
    if (!canvas) return;
    const root = document.documentElement;
    const media = matchMedia('(prefers-color-scheme: dark)');
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isNight = () => (root.dataset.theme || (media.matches ? 'dark' : 'light')) === 'dark';
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, stars = [], shoot = null, nextShoot = 0, running = false, last = 0;

    const make = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = innerWidth; H = innerHeight;
        canvas.width = W * dpr; canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const n = Math.round((W * H) / 2600);
        stars = Array.from({ length: n }, () => {
            const big = Math.random() < 0.06;
            const tintRoll = Math.random();
            return {
                x: Math.random() * W,
                y: Math.random() * H,
                r: big ? 1.1 + Math.random() * 0.9 : 0.35 + Math.random() * 0.75,
                a: 0.35 + Math.random() * 0.6,
                s: 0.4 + Math.random() * 1.6, // twinkle speed
                p: Math.random() * Math.PI * 2, // twinkle phase
                big,
                tint: tintRoll < 0.12 ? '#dcd0ff' : tintRoll < 0.2 ? '#fff1d6' : '#ffffff',
            };
        });
    };

    const draw = (t, dt) => {
        ctx.clearRect(0, 0, W, H);
        for (const st of stars) {
            const tw = calm ? 1 : 0.6 + 0.4 * Math.sin((t / 1000) * st.s + st.p);
            const horizon = 1 - Math.max(0, st.y / H - 0.65) * 2; // fade towards the warm horizon
            const alpha = Math.max(0, st.a * tw * horizon);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = st.tint;
            ctx.beginPath();
            ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
            ctx.fill();
            if (st.big) { // soft cross glint on the brightest stars
                ctx.globalAlpha = alpha * 0.45;
                ctx.fillRect(st.x - st.r * 3.2, st.y - 0.35, st.r * 6.4, 0.7);
                ctx.fillRect(st.x - 0.35, st.y - st.r * 3.2, 0.7, st.r * 6.4);
            }
        }
        if (!calm) {
            if (!shoot && t > nextShoot) {
                const fromLeft = Math.random() < 0.5;
                shoot = {
                    x: fromLeft ? Math.random() * W * 0.45 : W * 0.55 + Math.random() * W * 0.45,
                    y: Math.random() * H * 0.35,
                    vx: (fromLeft ? 1 : -1) * (0.75 + Math.random() * 0.35),
                    vy: 0.3 + Math.random() * 0.2,
                    life: 0,
                    max: 900 + Math.random() * 500,
                };
            }
            if (shoot) {
                shoot.life += dt;
                const k = shoot.life / shoot.max;
                const hx = shoot.x + shoot.vx * shoot.life, hy = shoot.y + shoot.vy * shoot.life;
                const len = 140, sp = Math.hypot(shoot.vx, shoot.vy);
                const tx = hx - (shoot.vx / sp) * len, ty = hy - (shoot.vy / sp) * len;
                const fade = Math.sin(Math.min(1, k) * Math.PI); // ease in and out
                const g = ctx.createLinearGradient(tx, ty, hx, hy);
                g.addColorStop(0, 'rgba(255,255,255,0)');
                g.addColorStop(1, `rgba(255,255,255,${0.9 * fade})`);
                ctx.globalAlpha = 1;
                ctx.strokeStyle = g;
                ctx.lineWidth = 1.6;
                ctx.lineCap = 'round';
                ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
                ctx.fillStyle = `rgba(255,255,255,${fade})`;
                ctx.beginPath(); ctx.arc(hx, hy, 1.4, 0, Math.PI * 2); ctx.fill();
                if (k >= 1) { shoot = null; nextShoot = t + 8000 + Math.random() * 10000; }
            }
        }
        ctx.globalAlpha = 1;
    };

    const loop = (t) => {
        if (!running) return;
        const dt = Math.min(64, t - last);
        if (dt >= 32) { // ~30 fps is plenty for a calm sky
            last = t;
            if (!document.hidden) draw(t, dt);
        }
        requestAnimationFrame(loop);
    };

    const update = () => {
        const night = isNight();
        root.classList.toggle('is-night', night);
        if (night && calm) { draw(0, 0); return; }
        if (night && !running) {
            running = true;
            last = performance.now();
            nextShoot = last + 3000 + Math.random() * 5000; // first one comes fairly soon
            requestAnimationFrame(loop);
        } else if (!night) {
            running = false;
        }
    };

    let rt;
    addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(() => { make(); if (calm && isNight()) draw(0, 0); }, 200);
    });
    new MutationObserver(update).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    media.addEventListener('change', update);
    make();
    update();
})();



// 8. Bible verses (World English Bible, public domain) that fade in and out in the empty side margins
(() => {
    const VERSES = [
        ['Love is patient and is kind; love doesn’t envy. Love doesn’t brag, is not proud.', '1 Corinthians 13:4'],
        ['Beloved, let’s love one another, for love is of God.', '1 John 4:7'],
        ['I can do all things through Christ, who strengthens me.', 'Philippians 4:13'],
        ['For we walk by faith, not by sight.', '2 Corinthians 5:7'],
    ];
    const layer = document.createElement('div');
    layer.className = 'verses';
    layer.setAttribute('aria-hidden', 'true'); // decorative; it changes on its own, so keep it out of screen-reader flow
    document.body.append(layer);
    let i = Math.floor(Math.random() * VERSES.length);
    let lastSide = Math.random() < 0.5 ? 'left' : 'right';

    const schedule = () => setTimeout(show, 6000 + Math.random() * 8000);
    function show() {
        const gutter = (innerWidth - 1180) / 2; // page content is at most 1180px wide
        if (document.hidden || gutter < 190) { schedule(); return; }
        const [text, ref] = VERSES[i++ % VERSES.length];
        const el = document.createElement('figure');
        el.className = 'verse';
        const q = document.createElement('blockquote');
        q.textContent = `“${text}”`;
        const c = document.createElement('figcaption');
        c.textContent = ref;
        el.append(q, c);
        const side = lastSide === 'left' ? 'right' : 'left'; // alternate sides
        lastSide = side;
        const w = Math.min(260, gutter - 48);
        el.style.width = `${w}px`;
        el.style[side] = `${Math.max(20, (gutter - w) / 2)}px`;
        el.style.top = `${30 + Math.random() * 38}vh`; // clear of the sun/moon and the bottom-left camp
        el.style.textAlign = side === 'right' ? 'right' : 'left';
        layer.append(el);
        requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
        setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => el.remove(), 1600);
            schedule();
        }, 9000);
    }
    setTimeout(show, 3500);
})();


// 9. In-page links scroll smoothly without adding "#section" to the address bar
(() => {
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a[href^="#"]');
        if (!a || a.classList.contains('skip-link') || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
        const id = a.getAttribute('href').slice(1);
        const target = id ? document.getElementById(id) : null;
        if (!target) return;
        e.preventDefault();
        if (id === 'hero') window.scrollTo({ top: 0, behavior: 'smooth' });
        else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true }); // keyboard users continue from the section they jumped to
        if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    });
})();
