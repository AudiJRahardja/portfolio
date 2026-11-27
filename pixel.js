// Pixel friends: Mochi the cat, a knight, snacks and sword dividers.
// Purely decorative, keyboard-accessible, and switchable off (WCAG 2.2.2: moving content can be paused).
(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const store = {
        get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch (e) { return d; } },
        set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
    };

    // ---------- sprites (one letter = one pixel) ----------
    const PAL = {
        k: '#2a1b4d', o: '#f4a259', w: '#fff3e0', p: '#f28ca6', e: '#2a1b4d', r: '#d64550',
        s: '#c9cfe0', d: '#8a90a8', g: '#e8b931', b: '#eef2fb', h: '#7a4a2a', n: '#1f3b2d',
        t: '#c99a6e', q: '#3b2418', i: '#f28ca6', u: '#e8a95c', y: '#ffffff',
    };
    const CAT_TOP = [
        '..........k...k.',
        '.........kok.kok',
        'k.......kooooook',
        'ko......koeooeok',
        '.ko.....kooppook',
        '..kkkkkkkkooook.',
        '..koooooooooook.',
        '..kooowwwwwook..',
        '..kooooooooook..',
    ];
    const SPRITES = {
        catA: [...CAT_TOP, '..kk.kk...kk.kk.'],
        catB: [...CAT_TOP, '...kk.kk.kk.kk..'],
        knight: [
            '...rrr......',
            '..kkkkk...b.',
            '.ksssssk..b.',
            '.ksdddsk..b.',
            '.ksssssk..b.',
            '..kkkkk...b.',
            '.kdsssdk..b.',
            'kdssgssdk.b.',
            'kdssgssdkggg',
            '.kssssskkh..',
            '.kdddddk.h..',
            '.kss.ssk....',
            '.kss.ssk....',
            'kkkk.kkkk...',
        ],
        onigiri: [
            '....kk....', '...kwwk...', '..kwwwwk..', '..kwwwwk..', '.kwwwwwwk.',
            '.kwwwwwwk.', 'kwwnnnnwwk', 'kwwnnnnwwk', 'kwwnnnnwwk', '.kkkkkkkk.',
        ],
        boba: [
            '......r...', '.....r....', '.kkkkrkkk.', '.ktttrttk.', '.kttttttk.',
            '..kttttk..', '..kqtqtk..', '..ktqtqk..', '..kqqqqk..', '...kkkk...',
        ],
        donut: [
            '...kkkk...', '.kkiiiikk.', 'kiiyiiyiik', 'kiiikkiiik', 'kiik..kiik',
            'kuuk..kuuk', 'kuuukkuuuk', 'kuuuuuuuuk', '.kkuuuukk.', '...kkkk...',
        ],
        heart: ['.kk.kk.', 'kppkppk', 'kpppppk', '.kpppk.', '..kpk..', '...k...'],
        sword: ['....g.........', 'ghhhgbbbbbbbbk', 'ghhhgddddddddd', 'ghhhgbbbbbbbbk', '....g.........'],
    };

    const svg = (name, scale) => {
        const rows = SPRITES[name];
        const W = rows[0].length, H = rows.length;
        let rects = '';
        rows.forEach((row, y) => {
            let x = 0;
            while (x < W) {
                const c = row[x];
                if (c === '.') { x++; continue; }
                let n = 1;
                while (row[x + n] === c) n++;
                rects += `<rect x="${x}" y="${y}" width="${n}" height="1" fill="${PAL[c]}"/>`;
                x += n;
            }
        });
        return `<svg class="px-svg" viewBox="0 0 ${W} ${H}" width="${W * scale}" height="${H * scale}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${rects}</svg>`;
    };

    // ---------- on/off switch ----------
    let on = store.get('pixels', 'on') === 'on';
    const applyOn = () => document.documentElement.classList.toggle('no-pixels', !on);
    applyOn();

    // ---------- screen-reader announcements ----------
    const live = document.createElement('p');
    live.className = 'visually-hidden';
    live.setAttribute('role', 'status');
    document.body.append(live);
    const say = (t) => { live.textContent = ''; setTimeout(() => { live.textContent = t; }, 30); };

    // ---------- dividers ----------
    document.querySelectorAll('[data-px="sword"]').forEach((el) => { el.innerHTML = `<i></i>${svg('sword', 3)}<i></i>`; });

    // ---------- Mochi ----------
    const layer = document.createElement('div');
    layer.className = 'px-layer';
    const cat = document.createElement('button');
    cat.type = 'button';
    cat.className = 'px-cat';
    cat.setAttribute('aria-label', 'Pet Mochi the pixel cat');
    cat.innerHTML = `<span class="px-frame px-frame--a">${svg('catA', 3)}</span><span class="px-frame px-frame--b">${svg('catB', 3)}</span><span class="px-bubble" aria-hidden="true"></span>`;
    layer.append(cat);
    document.body.append(layer);
    const bubble = cat.querySelector('.px-bubble');

    const CAT_W = 48;
    let x = Math.max(16, window.innerWidth * 0.7);
    let target = x;
    let dir = -1;
    let state = 'sit';
    let until = performance.now() + 1500;
    let last = performance.now();
    let bubbleTimer;
    let dash = false; // sprints when a snack is on its way

    const talk = (text, ms = 1600) => {
        bubble.textContent = text;
        cat.classList.add('talking');
        clearTimeout(bubbleTimer);
        bubbleTimer = setTimeout(() => cat.classList.remove('talking'), ms);
    };
    const hearts = (n = 3) => {
        const r = cat.getBoundingClientRect();
        for (let i = 0; i < n; i++) {
            const h = document.createElement('span');
            h.className = 'px-heart';
            h.innerHTML = svg('heart', 3);
            h.style.left = `${r.left + r.width / 2 - 10 + (i - (n - 1) / 2) * 16}px`;
            h.style.top = `${r.top - 6}px`;
            h.style.animationDelay = `${i * 90}ms`;
            document.body.append(h);
            setTimeout(() => h.remove(), 1400 + i * 90);
        }
    };
    // move the button, mirror only the sprite (so the speech bubble text never flips)
    const place = () => { cat.style.transform = `translateX(${x}px)`; cat.style.setProperty('--dir', dir); };

    const PET = ['mrrp!', 'purr…', 'meow :3', '*headbutt*', 'more pets pls'];
    cat.addEventListener('click', () => {
        talk(PET[Math.floor(Math.random() * PET.length)]);
        hearts();
        state = 'sit';
        until = performance.now() + 2500;
        say('Mochi purrs.');
    });

    const maxX = () => window.innerWidth - CAT_W - 12;
    const tick = (now) => {
        const dt = Math.min(64, now - last) / 1000;
        last = now;
        if (on && !document.hidden) {
            if (state === 'walk') {
                const step = (dash ? 300 : 46) * dt;
                if (Math.abs(target - x) <= step) {
                    x = target;
                    state = 'sit';
                    dash = false;
                    until = now + 1800 + Math.random() * 4200;
                    if (pendingSnack) { pendingSnack(); pendingSnack = null; }
                } else {
                    dir = target > x ? 1 : -1; // sprite faces right; mirrored when walking left
                    x += Math.sign(target - x) * step;
                }
            } else if (now > until && !reduced) {
                target = 16 + Math.random() * (maxX() - 16);
                state = 'walk';
            }
            cat.classList.toggle('walking', state === 'walk');
            cat.classList.toggle('step', state === 'walk' && Math.floor(now / 180) % 2 === 0);
            x = Math.min(Math.max(12, x), maxX());
            place();
        }
        requestAnimationFrame(tick);
    };
    place();
    requestAnimationFrame(tick);

    // ---------- snacks ----------
    let eaten = Number(store.get('snacks', '0')) || 0;
    let pendingSnack = null;
    const counterEls = [];
    const updateCounter = () => counterEls.forEach((el) => {
        el.textContent = eaten === 0 ? 'Mochi is hungry. Find the snacks!' : `Mochi has eaten ${eaten} snack${eaten === 1 ? '' : 's'}`;
    });

    const NAMES = { onigiri: 'an onigiri', boba: 'a boba tea', donut: 'a donut' };
    document.querySelectorAll('[data-snack]').forEach((slot) => {
        const kind = slot.dataset.snack;
        if (!SPRITES[kind]) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'px-snack';
        btn.setAttribute('aria-label', `Feed Mochi ${NAMES[kind]}`);
        btn.innerHTML = svg(kind, 3);
        slot.append(btn);

        btn.addEventListener('click', () => {
            if (btn.classList.contains('gone')) return;
            const from = btn.getBoundingClientRect();
            btn.classList.add('gone');
            setTimeout(() => btn.classList.remove('gone'), 30000);

            // the cat walks to a spot near the right side of the viewport while the snack flies down
            const landing = Math.min(Math.max(40, from.left), maxX() - 20);
            target = landing;
            state = 'walk';
            dash = true;
            talk('!!', 900);

            const fly = document.createElement('span');
            fly.className = 'px-fly';
            fly.innerHTML = svg(kind, 3);
            fly.style.left = `${from.left}px`;
            fly.style.top = `${from.top}px`;
            document.body.append(fly);
            const endY = window.innerHeight - 40 - from.top;
            const endX = landing + 30 - from.left;
            const done = () => {
                fly.remove();
                eaten++;
                store.set('snacks', String(eaten));
                updateCounter();
                talk('nom nom!', 1800);
                hearts(2);
                say(`Mochi ate ${NAMES[kind]}.`);
            };
            if (reduced || !fly.animate) {
                fly.remove();
                x = landing; state = 'sit'; until = performance.now() + 3000;
                done();
                return;
            }
            fly.animate(
                [
                    { transform: 'translate(0, 0) rotate(0)' },
                    { transform: `translate(${endX * 0.5}px, ${Math.min(-60, endY * 0.2)}px) rotate(180deg)`, offset: 0.4 },
                    { transform: `translate(${endX}px, ${endY}px) rotate(360deg) scale(0.6)` },
                ],
                { duration: 1100, easing: 'cubic-bezier(0.5, 0, 0.5, 1)' }
            ).onfinish = () => {
                fly.style.opacity = '0';
                if (state === 'walk') pendingSnack = done; else done();
            };
        });
    });

    // ---------- knight ----------
    const LINES = ['Huzzah!', 'Onward!', 'For higher F1!', 'A worthy quest!', 'En garde!'];
    document.querySelectorAll('[data-knight]').forEach((slot) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'px-knight';
        btn.setAttribute('aria-label', 'Knight: swing sword');
        btn.innerHTML = `${svg('knight', 4)}<span class="px-bubble" aria-hidden="true"></span>`;
        slot.append(btn);
        const kb = btn.querySelector('.px-bubble');
        let n = 0, t;
        btn.addEventListener('click', () => {
            btn.classList.remove('swing');
            void btn.offsetWidth;
            btn.classList.add('swing');
            kb.textContent = LINES[n++ % LINES.length];
            btn.classList.add('talking');
            clearTimeout(t);
            t = setTimeout(() => btn.classList.remove('talking'), 1500);
            const r = btn.getBoundingClientRect();
            for (let i = 0; i < 6; i++) {
                const s = document.createElement('span');
                s.className = 'px-spark';
                s.style.left = `${r.right - 10}px`;
                s.style.top = `${r.top + 10}px`;
                s.style.setProperty('--dx', `${Math.cos((i / 6) * Math.PI * 2) * 34}px`);
                s.style.setProperty('--dy', `${Math.sin((i / 6) * Math.PI * 2) * 34}px`);
                document.body.append(s);
                setTimeout(() => s.remove(), 700);
            }
            say(kb.textContent);
        });
    });

    // ---------- controls (footer) ----------
    document.querySelectorAll('[data-pixel-controls]').forEach((box) => {
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'px-toggle';
        const count = document.createElement('span');
        count.className = 'px-count';
        counterEls.push(count);
        const render = () => {
            toggle.setAttribute('aria-pressed', String(on));
            toggle.innerHTML = `${svg('catA', 1.5)}<span>Pixel friends: ${on ? 'on' : 'off'}</span>`;
        };
        toggle.addEventListener('click', () => {
            on = !on;
            store.set('pixels', on ? 'on' : 'off');
            applyOn();
            document.querySelectorAll('.px-toggle').forEach((b) => b.dispatchEvent(new CustomEvent('px-render')));
        });
        toggle.addEventListener('px-render', render);
        render();
        box.append(toggle, count);
        box.hidden = false;
    });
    updateCounter();
})();
