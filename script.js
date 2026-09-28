// 1. Intersection Observer for Scroll Animations
const scrollElements = document.querySelectorAll('.scroll-anim');

const elementInView = (el, dividend = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return (elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend);
};

const displayScrollElement = (element) => {
    element.classList.add('visible');
};

const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
        if (elementInView(el, 1.25)) {
            displayScrollElement(el);
        }
    })
}

window.addEventListener('scroll', () => {
    handleScrollAnimation();
});
// Trigger once on load
handleScrollAnimation();


// 2. Carousel Logic
const track = document.querySelector('.carousel-track');
const slides = Array.from(track.children);
const nextButton = document.querySelector('.next-btn');
const prevButton = document.querySelector('.prev-btn');

let currentSlideIndex = 0;

const moveToSlide = (track, currentSlideIndex) => {
    track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
};

// Next Button
nextButton.addEventListener('click', () => {
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    moveToSlide(track, currentSlideIndex);
});

// Previous Button
prevButton.addEventListener('click', () => {
    currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    moveToSlide(track, currentSlideIndex);
});

// Auto-slide every 5 seconds
setInterval(() => {
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    moveToSlide(track, currentSlideIndex);
}, 5000);


// 3. Modal Logic
const modal = document.getElementById('project-modal');
const closeBtn = document.querySelector('.close-btn');
const gridItems = document.querySelectorAll('.grid-item');

// Modal content elements
const modalTitle = document.getElementById('modal-title');
const modalTech = document.getElementById('modal-tech');
const modalDesc = document.getElementById('modal-desc');

// Open modal and populate data
gridItems.forEach(item => {
    item.addEventListener('click', () => {
        const title = item.getAttribute('data-title');
        const tech = item.getAttribute('data-tech');
        const desc = item.getAttribute('data-desc');

        modalTitle.textContent = title;
        modalTech.textContent = tech;
        modalDesc.textContent = desc;

        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });
});

// Close modal logic
const closeModal = () => {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto'; // Restore scrolling
};

closeBtn.addEventListener('click', closeModal);

// Close modal when clicking outside the content box
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});