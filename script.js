// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Platypus animation
document.addEventListener('DOMContentLoaded', () => {
    const platypus = document.getElementById('platypus-animation');
    if (!platypus) return;

    // Let the platypus roam the entire viewport like a game sprite.
    // Keep speeds low so the motion feels smooth and not jittery,
    // especially on mobile where frame rates may vary.

    const spriteSize = 64; // approx width/height used in CSS

    let x = (window.innerWidth - spriteSize) / 2;
    let y = (window.innerHeight - spriteSize) / 2;
    let vx = (Math.random() - 0.5) * 4;  // gentle horizontal velocity
    let vy = (Math.random() - 0.5) * 3;  // gentle vertical velocity

    function animate() {
        const maxX = window.innerWidth - spriteSize;
        const maxY = window.innerHeight - spriteSize;

        // Simple straight-line movement between bounces
        x += vx;
        y += vy;

        // Bounce off the edges horizontally
        if (x <= 0 || x >= maxX) {
            vx *= -1;
        }
        // Bounce vertically within the full window height
        if (y <= 0 || y >= maxY) {
            vy *= -1;
        }

        // Flip sprite based on horizontal direction: right when vx>0, left when vx<0
        if (vx >= 0) {
            platypus.style.transform = 'scaleX(1)';
        } else {
            platypus.style.transform = 'scaleX(-1)';
        }

        platypus.style.left = x + 'px';
        platypus.style.top = y + 'px';

        requestAnimationFrame(animate);
    }

    animate();
});

// Page preloader logic (main index page)
// Fades away once the initial UI is ready, without waiting for massive background assets
(function () {
    const preloader = document.getElementById('page-preloader');
    if (!preloader) return;

    const hidePreloader = () => {
        if (!preloader.classList.contains('is-active')) return;
        
        preloader.classList.remove('is-active');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 350);
    };

    // Hide after 2 seconds regardless, or when window loads
    const timeout = setTimeout(hidePreloader, 2000);

    window.addEventListener('load', () => {
        clearTimeout(timeout);
        hidePreloader();
    });
})();

// Scroll-reveal animation for film items and title pop animation
document.addEventListener('DOMContentLoaded', () => {
    const filmItems = document.querySelectorAll('.film-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const row = entry.target.closest('.film-row');
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                if (row) row.classList.add('title-dim');
            } else {
                entry.target.classList.remove('is-visible');
                // If none of the row's items are visible anymore, restore full title opacity
                if (row) {
                    const anyVisible = row.querySelector('.film-item.is-visible');
                    if (!anyVisible) {
                        row.classList.remove('title-dim');
                    }
                }
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the item is visible
    });

    filmItems.forEach(item => {
        observer.observe(item);
    });

    // Split each category title into words for animation
    const filmRows = document.querySelectorAll('.film-row');

    filmRows.forEach(row => {
        const title = row.querySelector('.film-category-title');
        if (!title) return;

        const words = title.textContent.trim().split(/\s+/);
        title.textContent = '';

        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.textContent = word;
            span.classList.add('title-word');
            title.appendChild(span);
            if (index < words.length - 1) {
                title.appendChild(document.createTextNode(' '));
            }
        });
    });

    // Observe rows to trigger title word fade-in animation
    const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const title = entry.target.querySelector('.film-category-title');
            if (!title) return;

            const words = title.querySelectorAll('.title-word');
            words.forEach((word, index) => {
                setTimeout(() => {
                    word.classList.add('word-visible');
                }, index * 120); // stagger words
            });

            // Only animate once
            titleObserver.unobserve(entry.target);
        });
    }, {
        // Very low threshold so all titles start animating as soon as
        // their row touches the viewport, even on fast scroll
        threshold: 0.05
    });

    filmRows.forEach(row => titleObserver.observe(row));

    // Horizontal slider logic for each film row
    filmRows.forEach(row => {
        const slider = row.querySelector('.film-row-slider');
        if (!slider) return;

        const trackOuter = slider.querySelector('.film-row-track');
        const items = Array.from(trackOuter.querySelectorAll('.film-item'));
        if (items.length === 0) return;

        // Wrap items in an inner flex track
        const inner = document.createElement('div');
        inner.classList.add('film-row-track-inner');
        items.forEach(item => inner.appendChild(item));
        trackOuter.appendChild(inner);

        let currentIndex = 0;

        function updateSlider() {
            const isDesktop = window.innerWidth >= 768;
            const itemsPerView = isDesktop ? 3 : 1;
            const maxIndex = Math.max(0, items.length - itemsPerView);
            if (currentIndex > maxIndex) currentIndex = maxIndex;
            if (currentIndex < 0) currentIndex = 0;

            let step = 0;

            if (isDesktop) {
                // Desktop/tablet: base step on distance between first two items
                const first = inner.children[0];
                const second = inner.children[1];

                if (second) {
                    const box1 = first.getBoundingClientRect();
                    const box2 = second.getBoundingClientRect();
                    step = box2.left - box1.left;
                } else {
                    step = first.getBoundingClientRect().width;
                }
            } else {
                // Mobile: move by the exact width of a single card so a
                // single centered thumbnail is shown each time.
                const first = inner.children[0];
                step = first ? first.getBoundingClientRect().width : trackOuter.getBoundingClientRect().width;
            }

            const offset = -(step * currentIndex);
            inner.style.transform = `translateX(${offset}px)`;

            // Show/hide arrows depending on position
            if (leftArrow) {
                leftArrow.style.visibility = currentIndex === 0 ? 'hidden' : 'visible';
            }
            if (rightArrow) {
                rightArrow.style.visibility = currentIndex === maxIndex ? 'hidden' : 'visible';
            }
        }

        const leftArrow = slider.querySelector('.slider-arrow-left');
        const rightArrow = slider.querySelector('.slider-arrow-right');

        if (leftArrow) {
            leftArrow.addEventListener('click', () => {
                currentIndex -= 1;
                updateSlider();
            });
        }

        if (rightArrow) {
            rightArrow.addEventListener('click', () => {
                currentIndex += 1;
                updateSlider();
            });
        }

        // Basic touch-swipe support for mobile/touch devices
        let touchStartX = 0;
        let touchStartY = 0;
        let touchDeltaX = 0;

        const swipeThreshold = 40; // minimum horizontal movement in px to trigger a slide

        inner.addEventListener('touchstart', (event) => {
            const touch = event.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchDeltaX = 0;
        }, { passive: true });

        inner.addEventListener('touchmove', (event) => {
            const touch = event.touches[0];
            touchDeltaX = touch.clientX - touchStartX;

            // If the user is swiping mostly horizontally, prevent vertical scroll from hijacking
            if (Math.abs(touchDeltaX) > Math.abs(touch.clientY - touchStartY)) {
                event.preventDefault();
            }
        }, { passive: false });

        inner.addEventListener('touchend', () => {
            if (Math.abs(touchDeltaX) < swipeThreshold) return;

            if (touchDeltaX < 0) {
                // Swipe left -> next slide
                currentIndex += 1;
            } else {
                // Swipe right -> previous slide
                currentIndex -= 1;
            }
            updateSlider();
        });

        window.addEventListener('resize', updateSlider);
        updateSlider();
    });

    // Bottom banner visibility: only show when user is near the bottom of the page
    const bottomBanner = document.querySelector('.bottom-banner');
    if (bottomBanner) {
        function updateBannerVisibility() {
            const scrollBottom = window.innerHeight + window.scrollY;
            const docHeight = document.documentElement.scrollHeight;
            bottomBanner.style.opacity = scrollBottom >= docHeight - 80 ? '1' : '0';
        }

        window.addEventListener('scroll', updateBannerVisibility);
        window.addEventListener('resize', updateBannerVisibility);
        updateBannerVisibility();
    }

    // Hero video custom play/pause control (no fullscreen or other controls)
    const heroVideo = document.getElementById('hero-video-element');
    const heroToggle = document.getElementById('hero-video-toggle');

    if (heroVideo && heroToggle) {
        // If a src is set later, it will autoplay muted in a loop
        heroToggle.addEventListener('click', () => {
            if (heroVideo.paused) {
                heroVideo.play();
                heroToggle.textContent = 'Pause';
            } else {
                heroVideo.pause();
                heroToggle.textContent = 'Play';
            }
        });
    }
});
