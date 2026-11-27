// Pixel friends: Kopi the walking cat, big Mochi + his feeder, a campfire scene, a knight, snacks and sword dividers.
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
        // feeder + campfire
        l: '#cfe8f5', c: '#c98a4b', m: '#8a5a2b', v: '#5b3a9c', z: '#8d8a9e',
        a: '#f7931e', Y: '#ffd23f', f: '#f2c9a0', S: '#5b3a9c', P: '#3b3f5c', D: '#b07a4a', L: '#7a4a2a',
        B: '#3d6fd8', N: '#23408f', R: '#a8323e', E: '#5fbf4a',
    };
    const BIG_TOP = [
        '..kk........kk..',
        '..kok......kok..',
        '..kpokkkkkkopk..',
        '..kooooooooook..',
        '.kooooooooooook.',
    ];
    const BIG_EYES = ['.kooeeooooeeook.', '.kooeeooooeeook.'];
    const BIG_HAPPY = ['.koookooookoook.', '.kookokookokook.'];
    const BIG_NOSE = ['.koooooppoooook.'];
    const BIG_MOUTH = ['.kowwwwkkwwwwok.', '..kowwwwwwwwok..'];
    const BIG_CHOMP = ['.kowwwkppkwwwok.', '..kowwwkkwwwok..'];
    const BIG_BODY = [
        '...kkoooooookk..',
        '..koooowwooook..',
        '.koooowwwwooook.',
        '.koooowwwwooook.',
        '.kooowwwwwwoook.',
        '..kkkkkkkkkkkk..',
    ];
    const PERSON = [
        '...hhhh....',
        '..hhhhhh...',
        '..hhfffh...',
        '..hffeff...',
        '...ffff....',
        '...SSSS...m',
        '..SSSSSS.m.',
        '..SSSSSfm..',
        '..SSSSSS...',
        '..PPPPPPPP.',
        '..PPPPPPPP.',
        '........PP.',
        '........PP.',
        '........kkk',
    ];
    const FIRE = (rows) => rows;
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
        // standing knight: silver armour, blue plume, tabard and shoulder plates, gold emblem
        knight: [
            '....BB......',
            '...BBBB...b.',
            '..kkkkkk..b.',
            '.kbssssdk.b.',
            '.ksskkkdk.b.',
            '.kssssddk.b.',
            '..kkkkkk..b.',
            '.kBsbbsBk.b.',
            'kBNsgssNBggg',
            'kBNssssNBkh.',
            '.kNBBBBNk.h.',
            '.kBBBgBBk...',
            '.kss.ssk....',
            '.kss.ssk....',
            '.kdd.ddk....',
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

        // big Mochi (front-facing) in three moods
        bigCat: [...BIG_TOP, ...BIG_EYES, ...BIG_NOSE, ...BIG_MOUTH, ...BIG_BODY],
        bigChomp: [...BIG_TOP, ...BIG_EYES, ...BIG_NOSE, ...BIG_CHOMP, ...BIG_BODY],
        bigHappy: [...BIG_TOP, ...BIG_HAPPY, ...BIG_NOSE, ...BIG_MOUTH, ...BIG_BODY],

        feeder: [
            '....kkkkkk....',
            '..kkllllllkk..',
            '.klclccllclck.',
            '.kcclcccclcck.',
            'klcccclccccclk',
            'kcclcccclcccck',
            'klcccccccccclk',
            '.kcccccccccck.',
            '..kkkkkkkkkk..',
            '..krrrrrrrrk..',
            '..krrYYYYrrk..',
            '..krrrrrrrrk..',
            '..krrkkkkrrk..',
            '..krrk..krrk..',
            '..krrkkkkrrk..',
            '..krrrrrrrrk..',
            '.kkkkkkkkkkkk.',
            '.kddddddddddk.',
            '.kkkkkkkkkkkk.',
        ],
        // neat rectangular stack of kibble with a shine stripe, in a glossy bowl
        // a rounded hill of cat bites (brick pattern, highlight down the left slope) in a glossy bowl
        tower: [
            '.....kkkk.....',
            '....kwmmuk....',
            '...kwmmmmmk...',
            '...kwcmwuck...',
            '..kwcmmucmmk..',
            '..kwmmmmmmmk..',
            '.kwmwucmwucmk.',
            '.kwmucmmucmmk.',
            '.kwmmmmmmmmmk.',
            'kwmwucmwucmwuk',
            'kwmucmmucmmuck',
            'kwmmmmmmmmmmmk',
            'kkkkkkkkkkkkkk',
            'kvwvvvvvvvvvvk',
            '.kvvvvvvvvvvk.',
            '..kkkkkkkkkk..',
        ],
        bite: ['mc', 'cm'],
        // little red tent
        tent: [
            '.........m..........',
            '........rRr.........',
            '.......rrRRr........',
            '......rrrRRRr.......',
            '.....rrrrRkRRr......',
            '....rrrrrRkkRRr.....',
            '...rrrrrrRkkkRRr....',
            '..rrrrrrrRkkkkRRr...',
            '.rrrrrrrrRkkkkkRRr..',
            'rrrrrrrrrRkkkkkkRRr.',
            'rrrrrrrrrRkkkkkkRRrr',
            'm..................m',
        ],
        // fish snack
        fish: [
            '...zzzzz...z',
            '.zzzzzzzz.zz',
            'zezzzzzzzzz.',
            'zllllllzzzz.',
            '.zzzzzzzz.zz',
            '...zzzzz...z',
        ],
        // cookie snack
        cookie: [
            '...uuuu...',
            '.uuuuuuuu.',
            '.uquuuuqu.',
            'uuuuuquuuu',
            'uuquuuuuuu',
            'uuuuuuuquu',
            'uuuquuuuuu',
            '.uuuuuuqu.',
            '.uuuuuuuu.',
            '...uuuu...',
        ],
        // man (beard, red flannel, jeans) sitting on a trunk, eating a burger
        manIdle: [
            '.....hhhh.......',
            '....hhhhhh......',
            '....hhffff......',
            '....hffeff......',
            '....hffffff..uu.',
            '....hhhffff.uuuu',
            '.....hhhff.fEEEE',
            '...rRrRrrrrfqqqq',
            '..rRrRrRrRr..uuu',
            '..RrRrRrRrR.....',
            '..rRrRrRrRr.....',
            '..BBBBBBBBBBBB..',
            '..NBBBBBBBBBBB..',
            '..........BB....',
            '..........BB....',
            '..........BB....',
            '.........LLLL...',
        ],
        // man tossing a bite to the dog (burger resting on his lap)
        manToss: [
            '.....hhhh...ff..',
            '....hhhhhh..ff..',
            '....hhffff.ff...',
            '....hffeffrf....',
            '....hfffffr.....',
            '....hhhfffr.....',
            '.....hhhff......',
            '...rRrRrrr..uuu.',
            '..rRrRrRrRr.qqq.',
            '..RrRrRrRrRfuuu.',
            '..rRrRrRrRr.....',
            '..BBBBBBBBBBBB..',
            '..NBBBBBBBBBBB..',
            '..........BB....',
            '..........BB....',
            '..........BB....',
            '.........LLLL...',
        ],
        // dog catching (head up, mouth open)
        dogCatch: [
            '......DDn.',
            '.....DDDp.',
            '.....DeDDD',
            '......LDDD',
            '..DDDDDDD.',
            '.DDDDDDDD.',
            'DDDDDDDD..',
            '.DD.DD.DD.',
        ],
        // cut tree trunk (rings on top) that the man sits on
        stump: [
            'LccuuccccL',
            'LmmmmmmmmL',
            'LmLmmmmLmL',
            'LmmmLmmmmL',
            'LLLmmmmLLL',
        ],
        // marshmallow on a stick planted in the ground
        mallowStick: [
            '........ww',
            '........ww',
            '.......m..',
            '......mm..',
            '......m...',
            '.....m....',
            '....mm....',
            '....m.....',
            '...mm.....',
            '..mm......',
            '..m.......',
            '.m........',
            'mm........',
            'm.........',
        ],
        // rocket
        rocket: [
            '...r...',
            '..rrr..',
            '.rwwwr.',
            '.wwBww.',
            '.wBlBw.',
            '.wwBww.',
            '.wwwww.',
            '.wwwww.',
            'rwwwwwr',
            'rrwwwrr',
            'r.ddd.r',
        ],
        // rocket flame frame A
        flameA: [
            '..YaY..',
            '...a...',
        ],
        // rocket flame frame B
        flameB: [
            '..aYa..',
            '..YaY..',
            '...a...',
        ],
        // bird, wings up
        birdA: [
            'k...k',
            '.k.k.',
            '..k..',
        ],
        // bird, wings level
        birdB: [
            '.....',
            'kk.kk',
            '..k..',
        ],
        // kneeling knight: red cape and plume, hands on the hilt of a sword planted in the ground
        knightKneel: [
            '....rr........',
            '...kkkkk......',
            '..ksbsssk.....',
            '..kssskkk..g..',
            '.Rksssssssshs.',
            '.RRkssssskggg.',
            '.RRkrrrrrk.b..',
            '.RRRkrrrrk.b..',
            '.RRRksssss.b..',
            '.RRRRkss.ssb..',
            '.RRRRkss.ssb..',
            'RRRRkkkk.kkbm.',
        ],
        // long log bench
        bench: [
            '.LmmmmmmmmmmmmmmmmmmmmL.',
            'cLmmLmmmmmmmLmmmmmmLmmLc',
            'cLmmmmmmLmmmmmmmmLmmmmLc',
            '.LLLLLLLLLLLLLLLLLLLLLL.',
        ],
        // curled-up sleeping cat
        sleepCat: [
            '......o.o.',
            '..ooooooo.',
            '.ooookkooo',
            'oooooooooo',
            'oowwwwooo.',
        ],
        // stretched-out sleeping dog
        sleepDog: [
            '........DD..',
            '..DDDDDDDDD.',
            '.DDDDDDLDkkD',
            'DDDDDDDDDDDn',
            '.DDDDDDDDDD.',
        ],

        // campfire scene
        person: PERSON,
        personIdle: PERSON.map((r) => r.replace(/m/g, '.')),
        smallCat: [
            '......o.o',
            '......ooo',
            '......oeo',
            '...ooooo.',
            '..oooooo.',
            '.ooooooo.',
            'o.oooooo.',
            'oo.oo.oo.',
        ],
        dog: [
            '......DDD.',
            '.....DDDDD',
            '.....DDeDn',
            '......LDDD',
            '..DDDDDDD.',
            '.DDDDDDDD.',
            'DDDDDDDD..',
            '.DD.DD.DD.',
        ],
        logs: [
            '....m......m....',
            '.zz..mm..mm..zz.',
            'zzz...mmmm...zzz',
            '.zzzzzmmmmzzzzz.',
        ],
        fire1: FIRE([
            '....r.....', '...rr..r..', '...rar.rr.', '..raar.rar', '.raaarraar',
            '.raaYaaar.', 'raaYYYaaar', 'raaYYYYaar', '.raaYYaar.', '..raaaar..',
        ]),
        fire2: FIRE([
            '......r...', '..r..rr...', '.rr.rar...', '.rar.raar.', 'raarraaar.',
            '.raaaYaar.', 'raaaYYYaar', 'raaYYYYaar', '.raaYYaar.', '..raaaar..',
        ]),
        fire3: FIRE([
            '...r......', '...rr.r...', '..rar.rr..', '..raarrar.', '.raaaaaar.',
            '.raaYYaar.', 'raaYYYYaar', 'raaYYYYaar', '.raaYYaar.', '..raaaar..',
        ]),
    };

    const svg = (name, scale, pal = {}) => {
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
                rects += `<rect x="${x}" y="${y}" width="${n}" height="1" fill="${pal[c] || PAL[c]}"/>`;
                x += n;
            }
        });
        return `<svg class="px-svg" viewBox="0 0 ${W} ${H}" width="${W * scale}" height="${H * scale}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${rects}</svg>`;
    };

    const KOPI = { o: '#9b97ad', w: '#f1eef8' }; // the small walking cat is Kopi (grey); Mochi is the big orange one

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
    cat.setAttribute('aria-label', 'Pet Kopi the pixel cat');
    cat.innerHTML = `<span class="px-frame px-frame--a">${svg('catA', 3, KOPI)}</span><span class="px-frame px-frame--b">${svg('catB', 3, KOPI)}</span><span class="px-bubble" aria-hidden="true"></span>`;
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
        say('Kopi purrs.');
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
    let bites = Number(store.get('bites', '0')) || 0;
    let pendingSnack = null;
    const counterEls = [];
    const updateCounter = () => counterEls.forEach((el) => {
        const k = eaten === 0 ? 'Kopi is hungry, find the snacks!' : `Kopi: ${eaten} snack${eaten === 1 ? '' : 's'}`;
        const m = bites === 0 ? 'Mochi: try the feeder' : `Mochi: ${bites} bite${bites === 1 ? '' : 's'}`;
        el.textContent = `${k} · ${m}`;
    });

    const NAMES = { onigiri: 'an onigiri', boba: 'a boba tea', donut: 'a donut', fish: 'a fish', cookie: 'a cookie' };
    document.querySelectorAll('[data-snack]').forEach((slot) => {
        const kind = slot.dataset.snack;
        if (!SPRITES[kind]) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'px-snack';
        btn.setAttribute('aria-label', `Feed Kopi ${NAMES[kind]}`);
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
                say(`Kopi ate ${NAMES[kind]}.`);
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
    const makeKnight = (slot, scale = 4) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'px-knight';
        btn.setAttribute('aria-label', 'Knight: swing sword');
        btn.innerHTML = `${svg('knight', scale)}<span class="px-bubble" aria-hidden="true"></span>`;
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
    };
    document.querySelectorAll('[data-knight]').forEach((slot) => makeKnight(slot));

    // ---------- big Mochi + bite feeder (hero, beside the name) ----------
    document.querySelectorAll('[data-feeder]').forEach((box) => {
        const M = 5; // px per pixel for Mochi
        box.innerHTML = `
            <button type="button" class="fd-machine" aria-label="Cat-bite machine: dispense a bite for Mochi">${svg('feeder', 4)}</button>
            <button type="button" class="fd-mochi" aria-label="Pet Mochi the big cat">
                <span class="fd-face fd-face--idle">${svg('bigCat', M)}</span>
                <span class="fd-face fd-face--chomp">${svg('bigChomp', M)}</span>
                <span class="fd-face fd-face--happy">${svg('bigHappy', M)}</span>
                <span class="px-bubble" aria-hidden="true"></span>
            </button>
            <span class="fd-tower" aria-hidden="true" title="Mochi's emergency bite reserve">${svg('tower', 4)}</span>`;
        const machine = box.querySelector('.fd-machine');
        const mochi = box.querySelector('.fd-mochi');
        const mb = mochi.querySelector('.px-bubble');
        let mt, moodT;
        const mood = (m, ms) => {
            mochi.dataset.mood = m;
            clearTimeout(moodT);
            moodT = setTimeout(() => { mochi.dataset.mood = 'idle'; }, ms);
        };
        const mTalk = (t) => {
            mb.textContent = t;
            mochi.classList.add('talking');
            clearTimeout(mt);
            mt = setTimeout(() => mochi.classList.remove('talking'), 1500);
        };
        const mHearts = () => {
            const r = mochi.getBoundingClientRect();
            for (let i = 0; i < 3; i++) {
                const h = document.createElement('span');
                h.className = 'px-heart';
                h.innerHTML = svg('heart', 3);
                h.style.left = `${r.left + r.width / 2 - 10 + (i - 1) * 18}px`;
                h.style.top = `${r.top}px`;
                h.style.animationDelay = `${i * 90}ms`;
                document.body.append(h);
                setTimeout(() => h.remove(), 1500);
            }
        };
        mochi.dataset.mood = 'idle';

        const PURR = ['purrrr…', 'mrrrp :3', '*slow blink*', 'more bites?'];
        mochi.addEventListener('click', () => {
            mood('happy', 1400);
            mTalk(PURR[Math.floor(Math.random() * PURR.length)]);
            mHearts();
            say('Mochi purrs.');
        });

        let busy = false;
        machine.addEventListener('click', () => {
            if (busy) return;
            busy = true;
            machine.classList.remove('shake'); void machine.offsetWidth; machine.classList.add('shake');
            const m = machine.getBoundingClientRect();
            const c = mochi.getBoundingClientRect();
            // chute opening (feeder col 6-7, row 13 at 4px) -> Mochi's mouth (col 7-8, row 8 at 5px)
            const sx = m.left + 6 * 4, sy = m.top + 13 * 4;
            const ex = c.left + 7 * M, ey = c.top + 8 * M;
            const bite = document.createElement('span');
            bite.className = 'px-fly';
            bite.innerHTML = svg('bite', 5);
            bite.style.left = `${sx}px`;
            bite.style.top = `${sy}px`;
            document.body.append(bite);
            mood('chomp', 900);
            const land = () => {
                bite.remove();
                bites++;
                store.set('bites', String(bites));
                updateCounter();
                mood('chomp', 600);
                mochi.classList.remove('munch'); void mochi.offsetWidth; mochi.classList.add('munch');
                mTalk(bites % 10 === 0 ? `${bites} bites! nom!!` : 'nom!');
                say(`Mochi ate a bite. ${bites} so far.`);
                busy = false;
            };
            if (reduced || !bite.animate) { land(); return; }
            const dx = ex - sx, dy = ey - sy;
            bite.animate(
                [
                    { transform: 'translate(0, 0) rotate(0)' },
                    { transform: `translate(${dx * 0.45}px, ${Math.min(dy, 0) - 70}px) rotate(200deg)`, offset: 0.5 },
                    { transform: `translate(${dx}px, ${dy}px) rotate(400deg) scale(0.8)` },
                ],
                { duration: 650, easing: 'cubic-bezier(0.3, 0, 0.6, 1)' }
            ).onfinish = land;
        });
        box.hidden = false;
    });

    // ---------- campfire scene (under the profile picture) ----------
    // Layout is in scene pixels (W x H); ground is the bottom row. Logs are benches.
    document.querySelectorAll('[data-campfire]').forEach((scene) => {
        const W = 134, H = 34;
        const S = window.innerWidth < 420 ? 2.3 : window.innerWidth < 640 ? 2.6 : 3; // px per pixel, so it fits the screen
        scene.style.width = `${W * S}px`;
        scene.style.height = `${H * S}px`;
        const at = (el, x, y) => { el.style.left = `${x * S}px`; el.style.top = `${y * S}px`; scene.append(el); return el; };
        const deco = (sprite, x, y, cls, pal) => {
            const d = document.createElement('span');
            d.className = cls;
            d.innerHTML = svg(sprite, S, pal);
            return at(d, x, y);
        };

        const FIRE_X = 63, FIRE_Y = 20; // flames top-left
        const glow = document.createElement('span');
        glow.className = 'cf-glow';
        glow.style.width = `${64 * S}px`;
        glow.style.height = `${28 * S}px`;
        at(glow, FIRE_X + 5 - 32, FIRE_Y + 6 - 14);

        const chatter = (btn, lines, cls = 'hop') => {
            const bb = btn.querySelector('.px-bubble');
            let i = 0, t;
            btn.addEventListener('click', () => {
                bb.textContent = lines[i++ % lines.length];
                btn.classList.add('talking');
                btn.classList.remove(cls); void btn.offsetWidth; btn.classList.add(cls);
                clearTimeout(t);
                t = setTimeout(() => btn.classList.remove('talking'), 1700);
                say(bb.textContent);
            });
        };
        const actor = (sprite, x, y, label, lines, { flip = false, pal, cls = 'cf-actor', anim = 'hop' } = {}) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = cls;
            b.setAttribute('aria-label', label);
            b.innerHTML = `<span class="cf-sprite${flip ? ' cf-flip' : ''}">${svg(sprite, S, pal)}</span><span class="px-bubble" aria-hidden="true"></span>`;
            at(b, x, y);
            chatter(b, lines, anim);
            return b;
        };

        // benches first, so everyone sitting on them is drawn in front
        deco('bench', 36, 30, 'cf-bench');
        deco('bench', 77, 30, 'cf-bench');

        // fire: logs + 3 flickering frames, clickable to stoke
        deco('logs', FIRE_X - 3, 30, 'cf-logs');
        const fire = document.createElement('button');
        fire.type = 'button';
        fire.className = 'cf-fire';
        fire.setAttribute('aria-label', 'Stoke the campfire');
        fire.style.width = fire.style.height = `${10 * S}px`;
        fire.innerHTML = `<span class="cf-flame">${svg('fire1', S)}</span><span class="cf-flame">${svg('fire2', S)}</span><span class="cf-flame">${svg('fire3', S)}</span><span class="px-bubble" aria-hidden="true"></span>`;
        at(fire, FIRE_X, FIRE_Y);

        const spark = (burst = false) => {
            const s = document.createElement('span');
            s.className = 'cf-spark';
            s.style.left = `${(FIRE_X + 2 + Math.random() * 6) * S}px`;
            s.style.top = `${FIRE_Y * S}px`;
            s.style.setProperty('--sx', `${(Math.random() - 0.5) * (burst ? 60 : 24)}px`);
            s.style.setProperty('--sy', `${-(burst ? 50 : 30) - Math.random() * 30}px`);
            scene.append(s);
            setTimeout(() => s.remove(), 1400);
        };
        const fb = fire.querySelector('.px-bubble');
        let ft;
        fire.addEventListener('click', () => {
            fire.classList.remove('stoked'); void fire.offsetWidth; fire.classList.add('stoked');
            for (let i = 0; i < 10; i++) setTimeout(() => spark(true), i * 40);
            fb.textContent = 'crackle!';
            fire.classList.add('talking');
            clearTimeout(ft);
            ft = setTimeout(() => fire.classList.remove('talking'), 1200);
            say('The fire crackles.');
        });
        if (!reduced) setInterval(() => { if (on && !document.hidden && scene.offsetParent) spark(); }, 450);

        // the two knights guard the left end of the camp
        const kslot = document.createElement('span');
        kslot.className = 'knight-slot';
        at(kslot, 0, H - 16);
        makeKnight(kslot, S);
        actor('knightKneel', 12, H - 12, 'Kneeling knight with a red cape', ['…', 'I keep watch.', 'May your models converge.', 'For the realm!'], { anim: 'bow' });

        // ground sleepers
        actor('sleepCat', 26, H - 5, 'Sleeping cat', ['zzz…', '*snore*', 'five more minutes…'], { cls: 'cf-actor cf-sleep', anim: 'stir', pal: { o: '#e7a56a' } });
        actor('sleepDog', 122, H - 5, 'Sleeping dog', ['zzz…', '*dreams of bones*', '*snore*'], { cls: 'cf-actor cf-sleep', anim: 'stir' });

        // on the left bench
        actor('smallCat', 37, 22, 'Orange cat on the log', ['meow', '*stares at the flames*', 'mrrp?'], { pal: { o: '#f4a259' } });
        actor('person', 46, 19, 'Friend toasting a marshmallow', ['Perfect night for this.', 'Mine is going to be golden.', 'Model is still training…'], { pal: { h: '#2a1b4d', S: '#5b3a9c' } });

        // on the right bench
        actor('person', 79, 19, 'Friend with a marshmallow stick', ['Who brought snacks?', 'Ahh, cozy.', 'Mine caught fire again.'], { flip: true, pal: { h: '#7a4a2a', S: '#d64550', f: '#e0b48a' } });
        actor('smallCat', 90, 22, 'Grey cat on the log', ['…mew', '*loafs*', 'is that a marshmallow'], { flip: true, pal: { o: '#9b97ad' } });

        // ground sitters on the right
        actor('personIdle', 101, H - 14, 'Friend sitting on the ground', ['Ground is comfier.', 'I hear an owl…', 'Best evening.'], { flip: true, pal: { h: '#3b2418', S: '#2f8f6b', P: '#2a1b4d', f: '#c9966b' } });
        actor('dog', 112, H - 8, 'Brown dog', ['woof!', '*tail wag*', 'bork?'], { flip: true });

        // marshmallows on the two sticks: click to toast (raw -> golden -> toasted -> burnt -> fresh)
        const STAGES = [['#fffaf0', 'raw'], ['#f3d79a', 'golden'], ['#c98a4b', 'toasted'], ['#3a2a20', 'burnt']];
        [[57, 22, 'left'], [76, 22, 'right']].forEach(([x, y, side]) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'cf-mallow';
            b.innerHTML = '<i></i><span class="px-bubble" aria-hidden="true"></span>';
            b.style.width = b.style.height = `${6 * S}px`;
            b.querySelector('i').style.width = b.querySelector('i').style.height = `${2 * S}px`;
            at(b, x - 2, y - 2); // 6x6-pixel hit area around the 2x2 marshmallow
            const dot = b.querySelector('i');
            const mbb = b.querySelector('.px-bubble');
            let st = 0, t;
            const render = () => {
                dot.style.background = STAGES[st][0];
                b.setAttribute('aria-label', `Toast the ${side} marshmallow (now ${STAGES[st][1]})`);
            };
            b.addEventListener('click', () => {
                st = (st + 1) % STAGES.length;
                render();
                mbb.textContent = st === 1 ? 'perfect!' : st === 2 ? 'mmm, toasty' : st === 3 ? 'oops…' : 'fresh one!';
                b.classList.add('talking');
                clearTimeout(t);
                t = setTimeout(() => b.classList.remove('talking'), 1300);
                say(`Marshmallow is ${STAGES[st][1]}.`);
            });
            render();
        });
        scene.hidden = false;
    });

    // ---------- bottom-left camp: a man eating a burger, tossing bites to his dog ----------
    document.querySelectorAll('[data-restcamp]').forEach((scene) => {
        const S = 3.5, W = 64, H = 24;
        scene.style.width = `${W * S}px`;
        scene.style.height = `${H * S}px`;
        const at = (el, x, y) => { el.style.left = `${x * S}px`; el.style.top = `${y * S}px`; scene.append(el); return el; };
        const deco = (sprite, x, y, cls = 'rc-deco', pal) => {
            const d = document.createElement('span');
            d.className = cls;
            d.innerHTML = svg(sprite, S, pal);
            return at(d, x, y);
        };

        const glow = document.createElement('span');
        glow.className = 'cf-glow';
        glow.style.width = `${44 * S}px`;
        glow.style.height = `${20 * S}px`;
        at(glow, 12, 6);

        deco('tent', 40, 12, 'rc-deco rc-tent');
        deco('logs', 26, 20, 'rc-deco cf-logs');
        const flames = document.createElement('span');
        flames.className = 'rc-flames';
        flames.style.width = flames.style.height = `${10 * S}px`;
        flames.innerHTML = `<span class="cf-flame">${svg('fire1', S)}</span><span class="cf-flame">${svg('fire2', S)}</span><span class="cf-flame">${svg('fire3', S)}</span>`;
        at(flames, 29, 10);
        deco('mallowStick', 18, 10);
        deco('mallowStick', 38, 10, 'rc-deco cf-flip');
        deco('stump', 2, 19); // the cut trunk he sits on (drawn before him, so his legs are in front)

        const mk = (frames, x, y, label, flip, pal) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'cf-actor rc-actor';
            b.setAttribute('aria-label', label);
            b.innerHTML = frames.map(([name, sprite]) => `<span class="cf-sprite rc-frame rc-frame--${name}${flip ? ' cf-flip' : ''}">${svg(sprite, S, pal)}</span>`).join('') + '<span class="px-bubble" aria-hidden="true"></span>';
            b.dataset.frame = frames[0][0];
            return at(b, x, y);
        };
        const man = mk([['idle', 'manIdle'], ['toss', 'manToss']], 1, 6, 'Man sitting on a tree trunk, eating a burger', false, { h: '#3b2418', f: '#e0b48a' });
        const dog = mk([['idle', 'dog'], ['catch', 'dogCatch']], 50, 16, 'His dog, waiting for a bite', true);

        const talk = (b, text, ms = 1500) => {
            const bb = b.querySelector('.px-bubble');
            bb.textContent = text;
            b.classList.add('talking');
            clearTimeout(b._t);
            b._t = setTimeout(() => b.classList.remove('talking'), ms);
        };
        const frame = (b, f, ms) => {
            b.dataset.frame = f;
            clearTimeout(b._f);
            b._f = setTimeout(() => { b.dataset.frame = b === man ? 'idle' : 'idle'; }, ms);
        };

        let tossing = false;
        const toss = () => {
            if (tossing || !on || document.hidden) return;
            tossing = true;
            frame(man, 'toss', 700);
            const food = document.createElement('span');
            food.className = 'rc-food';
            food.innerHTML = svg('bite', S, { m: '#3b2418', c: '#e8a95c' });
            at(food, 13, 6);
            const land = () => {
                food.remove();
                frame(dog, 'catch', 600);
                dog.classList.remove('hop'); void dog.offsetWidth; dog.classList.add('hop');
                talk(dog, '*chomp*');
                say('The dog catches a bite.');
                tossing = false;
            };
            if (reduced || !food.animate) { land(); return; }
            const dx = (50 - 13) * S, dy = (18 - 6) * S;
            food.animate(
                [
                    { transform: 'translate(0, 0) rotate(0)' },
                    { transform: `translate(${dx * 0.5}px, ${-6 * S}px) rotate(180deg)`, offset: 0.5 },
                    { transform: `translate(${dx}px, ${dy}px) rotate(360deg)` },
                ],
                { duration: 800, easing: 'cubic-bezier(0.3, 0, 0.6, 1)' }
            ).onfinish = land;
        };
        const MAN = ['mm, burger.', 'Want some, buddy?', 'Best seat in the house.'];
        let mi = 0;
        man.addEventListener('click', () => { talk(man, MAN[mi++ % MAN.length]); setTimeout(toss, 250); });
        const DOG = ['woof!', '*begs*', 'more please'];
        let di = 0;
        dog.addEventListener('click', () => {
            talk(dog, DOG[di++ % DOG.length]);
            dog.classList.remove('hop'); void dog.offsetWidth; dog.classList.add('hop');
        });
        const loop = () => setTimeout(() => { toss(); if (Math.random() < 0.3) setTimeout(() => talk(man, 'mm, burger.'), 1600); loop(); }, 7000 + Math.random() * 4000);
        if (!reduced) loop();
        scene.hidden = false;
    });

    // ---------- sky life: a rocket now and then, small flocks of birds ----------
    const life = document.createElement('div');
    life.className = 'sky-life';
    life.setAttribute('aria-hidden', 'true');
    (document.querySelector('.wallpaper') || document.body.firstElementChild).after(life);

    const launchRocket = () => {
        if (!on || document.hidden || reduced) return;
        const r = document.createElement('span');
        r.className = 'rocket';
        r.innerHTML = `<span class="rk-body">${svg('rocket', 4)}</span><span class="rk-flame rk-flame--a">${svg('flameA', 4)}</span><span class="rk-flame rk-flame--b">${svg('flameB', 4)}</span>`;
        // launch from the side margins when there are any, otherwise anywhere
        const g = (innerWidth - 1180) / 2;
        const x = g > 80 ? (Math.random() < 0.5 ? 20 + Math.random() * (g - 60) : innerWidth - g + 20 + Math.random() * (g - 60)) : 20 + Math.random() * (innerWidth - 60);
        r.style.left = `${x}px`;
        life.append(r);
        const drift = (Math.random() - 0.5) * 120;
        const anim = r.animate(
            [{ transform: 'translate(0, 0)' }, { transform: `translate(${drift}px, ${-(innerHeight + 220)}px)` }],
            { duration: 9000 + Math.random() * 3000, easing: 'cubic-bezier(0.45, 0, 0.75, 1)' }
        );
        const puff = setInterval(() => {
            const rr = r.getBoundingClientRect();
            const p = document.createElement('span');
            p.className = 'rk-smoke';
            p.style.left = `${rr.left + rr.width / 2 - 4 + (Math.random() - 0.5) * 6}px`;
            p.style.top = `${rr.bottom}px`;
            life.append(p);
            setTimeout(() => p.remove(), 1600);
        }, 140);
        anim.onfinish = () => { clearInterval(puff); r.remove(); };
    };

    const flock = () => {
        if (!on || document.hidden || reduced) return;
        const n = 2 + Math.floor(Math.random() * 3);
        const ltr = Math.random() < 0.5;
        const y = (8 + Math.random() * 30) / 100 * innerHeight;
        const dur = 14000 + Math.random() * 6000;
        for (let i = 0; i < n; i++) {
            const b = document.createElement('span');
            b.className = 'bird';
            b.innerHTML = `<span class="bd bd-a">${svg('birdA', 3, { k: 'currentColor' })}</span><span class="bd bd-b">${svg('birdB', 3, { k: 'currentColor' })}</span>`;
            b.style.top = `${y + (i % 2) * 14 + i * 4}px`;
            b.style.animationDelay = `${-i * 0.17}s`;
            life.append(b);
            const from = ltr ? -60 - i * 30 : innerWidth + 60 + i * 30;
            const to = ltr ? innerWidth + 80 : -80 - i * 30;
            b.animate([{ transform: `translateX(${from}px)` }, { transform: `translateX(${to}px)` }], { duration: dur, easing: 'linear' })
                .onfinish = () => b.remove();
        }
    };

    if (!reduced) {
        setTimeout(launchRocket, 12000);
        setTimeout(flock, 5000);
        const again = (fn, min, spread) => setTimeout(() => { fn(); again(fn, min, spread); }, min + Math.random() * spread);
        again(launchRocket, 30000, 25000);
        again(flock, 18000, 17000);
    }

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
