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

document.querySelectorAll('#hero, #experiences, #projects').forEach((s) => sectionObserver.observe(s));

const navToggle = document.querySelector('.nav-toggle');
const menuOverlay = document.getElementById('menu-overlay');

const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    navToggle.setAttribute('aria-expanded', open);
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuOverlay.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
};

navToggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
menuOverlay.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));


// 3. Carousel
const track = document.querySelector('.carousel-track');
const slides = Array.from(track.children);
const carousel = document.querySelector('.carousel');
const progress = document.querySelector('.carousel-progress span');
const countCurrent = document.querySelector('.carousel-count .current');
const SLIDE_MS = 6000;

let currentSlideIndex = 0;
let autoTimer;

document.querySelector('.carousel-count .total').textContent = String(slides.length).padStart(2, '0');
progress.style.setProperty('--slide-ms', `${SLIDE_MS}ms`);

const restartProgress = () => {
    progress.classList.remove('run');
    void progress.offsetWidth; // restart the CSS animation
    progress.classList.add('run');
};

const moveToSlide = (index) => {
    currentSlideIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    countCurrent.textContent = String(currentSlideIndex + 1).padStart(2, '0');
    restartProgress();
};

const startAuto = () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => moveToSlide(currentSlideIndex + 1), SLIDE_MS);
    restartProgress();
};

const stopAuto = () => {
    clearInterval(autoTimer);
    progress.classList.remove('run');
};

document.querySelector('.next-btn').addEventListener('click', () => { moveToSlide(currentSlideIndex + 1); startAuto(); });
document.querySelector('.prev-btn').addEventListener('click', () => { moveToSlide(currentSlideIndex - 1); startAuto(); });
carousel.addEventListener('mouseenter', stopAuto);
carousel.addEventListener('mouseleave', startAuto);

startAuto();


// 4. Project modal
const modal = document.getElementById('project-modal');
const closeBtn = modal.querySelector('.close-btn');
const modalTitle = document.getElementById('modal-title');
const modalTech = document.getElementById('modal-tech');
const modalDesc = document.getElementById('modal-desc');
let lastFocused;

const openModal = (item) => {
    modalTitle.textContent = item.dataset.title;
    modalTech.textContent = item.dataset.tech;
    modalDesc.textContent = item.dataset.desc;

    lastFocused = item;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
};

const closeModal = () => {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
};

document.querySelectorAll('.grid-item').forEach((item) => {
    item.addEventListener('click', () => openModal(item));
});

closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (modal.classList.contains('show')) closeModal();
    else if (document.body.classList.contains('menu-open')) setMenu(false);
});
