if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => { });
    });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const platypus = document.getElementById('platypus-animation');
    if (!platypus) return;

    let x = Math.random() * (window.innerWidth - 50);
    let y = Math.random() * (window.innerHeight - 50);
    let vx = (Math.random() - 0.5) * 20;
    let vy = (Math.random() - 0.5) * 20;

    function animate() {
        x += vx;
        y += vy;
        if (x <= 0 || x >= window.innerWidth - 50) vx *= -1;
        if (y <= 0 || y >= window.innerHeight - 50) vy *= -1;
        platypus.style.transform = vx >= 0 ? 'scaleX(1)' : 'scaleX(-1)';
        platypus.style.left = x + 'px';
        platypus.style.top = y + 'px';
        requestAnimationFrame(animate);
    }
    animate();
});

(function () {
    const preloader = document.getElementById('page-preloader');
    if (!preloader) return;
    const hidePreloader = () => {
        if (!preloader.classList.contains('is-active')) return;
        preloader.classList.remove('is-active');
        setTimeout(() => { preloader.style.display = 'none'; }, 350);
    };
    const timeout = setTimeout(hidePreloader, 2000);
    window.addEventListener('load', () => {
        clearTimeout(timeout);
        hidePreloader();
    });
})();

document.addEventListener('DOMContentLoaded', () => {
    const filmItems = document.querySelectorAll('.film-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const row = entry.target.closest('.film-row');
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                if (row) row.classList.add('title-dim');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    filmItems.forEach(item => observer.observe(item));

    const filmRows = document.querySelectorAll('.film-row');
    filmRows.forEach((row, rowIndex) => {
        const title = row.querySelector('.film-category-title');
        if (!title) return;
        const words = title.textContent.trim().split(/\s+/);
        title.textContent = '';
        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.textContent = word;
            span.classList.add('title-word');
            title.appendChild(span);
            if (index < words.length - 1) title.appendChild(document.createTextNode(' '));
        });

        const rowItems = row.querySelectorAll('.film-item');
        rowItems.forEach((item, i) => {
            item.style.transitionDelay = `${i * 0.1}s`;
        });
    });

    const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const title = entry.target.querySelector('.film-category-title');
            if (!title) return;
            const words = title.querySelectorAll('.title-word');
            words.forEach((word, index) => {
                setTimeout(() => { word.classList.add('word-visible'); }, index * 80);
            });
            titleObserver.unobserve(entry.target);
        });
    }, { threshold: 0.05 });

    filmRows.forEach(row => titleObserver.observe(row));

    filmRows.forEach(row => {
        const slider = row.querySelector('.film-row-slider');
        if (!slider) return;
        const trackOuter = slider.querySelector('.film-row-track');
        const items = Array.from(trackOuter.querySelectorAll('.film-item'));
        if (items.length === 0) return;

        const inner = document.createElement('div');
        inner.classList.add('film-row-track-inner');
        items.forEach(item => inner.appendChild(item));
        trackOuter.appendChild(inner);

        let currentIndex = 0;
        let cachedItemWidth = 0;
        const leftArrow = slider.querySelector('.slider-arrow-left');
        const rightArrow = slider.querySelector('.slider-arrow-right');

        function updateSlider() {
            const itemsPerView = window.innerWidth >= 768 ? 3 : 1;
            const maxIndex = Math.max(0, items.length - itemsPerView);
            if (currentIndex > maxIndex) currentIndex = maxIndex;
            if (currentIndex < 0) currentIndex = 0;

            if (!cachedItemWidth || cachedItemWidth < 100) {
                cachedItemWidth = inner.firstElementChild.getBoundingClientRect().width + 32;
            }

            inner.style.transform = `translateX(${-(cachedItemWidth * currentIndex)}px)`;
            if (leftArrow) leftArrow.style.visibility = currentIndex === 0 ? 'hidden' : 'visible';
            if (rightArrow) rightArrow.style.visibility = currentIndex === maxIndex ? 'hidden' : 'visible';
        }

        window.addEventListener('resize', () => {
            cachedItemWidth = 0;
            updateSlider();
        });

        if (leftArrow) leftArrow.addEventListener('click', () => { currentIndex -= 1; updateSlider(); });
        if (rightArrow) rightArrow.addEventListener('click', () => { currentIndex += 1; updateSlider(); });
        updateSlider();
    });

    const bottomBanner = document.querySelector('.bottom-banner');
    if (bottomBanner) {
        const sentinel = document.createElement('div');
        sentinel.style.position = 'absolute';
        sentinel.style.bottom = '100px';
        sentinel.style.height = '10px';
        sentinel.style.width = '100%';
        sentinel.style.pointerEvents = 'none';
        document.body.appendChild(sentinel);
        const bannerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => { bottomBanner.style.opacity = entry.isIntersecting ? '1' : '0'; });
        }, { rootMargin: '0px' });
        bannerObserver.observe(sentinel);
    }

    const heroVideo = document.getElementById('hero-video-element');
    const heroToggle = document.getElementById('hero-video-toggle');
    const playOverlay = document.getElementById('video-play-overlay');

    if (heroVideo && playOverlay) {
        // Lazy load video on first interaction
        const loadAndPlayVideo = () => {
            if (heroVideo.hasAttribute('data-lazy-load')) {
                // Video hasn't been loaded yet
                const videoSrc = heroVideo.getAttribute('src');
                heroVideo.removeAttribute('data-lazy-load');
                heroVideo.load(); // Force reload with new settings
            }

            heroVideo.play().then(() => {
                playOverlay.style.display = 'none';
                if (heroToggle) heroToggle.style.display = 'block';
            }).catch(err => {
                console.error('Video playback failed:', err);
            });
        };

        // Click overlay to start video
        playOverlay.addEventListener('click', loadAndPlayVideo);

        // Toggle button functionality
        if (heroToggle) {
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
    }
});

function initPhotoGallery(containerSelector, images) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    container.innerHTML = '';
    images.forEach(imgData => {
        const src = typeof imgData === 'string' ? imgData : imgData.full;
        const name = typeof imgData === 'string' ? '' : (imgData.name || '');
        const btn = document.createElement('button');
        btn.className = 'photo-thumb w-full sm:w-[80%] lg:w-[45%] opacity-0 transform translate-y-4 transition-all duration-500';
        btn.setAttribute('data-full', src);
        btn.setAttribute('data-name', name);
        const img = document.createElement('img');
        let thumbSrc = src;
        if (src.includes('cloudinary.com')) {
            thumbSrc = src.includes('f_auto,q_auto') ? src.replace('/upload/', '/upload/w_800/') : src.replace('/upload/', '/upload/w_800,f_auto,q_auto/');
        }
        img.src = thumbSrc;
        img.alt = name;
        img.loading = 'lazy';
        btn.appendChild(img);
        container.appendChild(btn);
        btn.addEventListener('click', () => {
            const lightbox = document.getElementById('photo-lightbox');
            const lightboxImage = document.getElementById('photo-lightbox-image');
            if (lightbox && lightboxImage) {
                lightboxImage.src = src;
                lightbox.classList.remove('hidden');
            }
        });
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('opacity-0', 'translate-y-4');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        observer.observe(btn);
    });
    preloadImages(images.map(i => typeof i === 'string' ? i : i.full));
}

function initVideoStills(containerSelector, stillsMap, currentVideoId) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const stills = stillsMap[currentVideoId] || [];
    if (stills.length === 0) {
        const parentSection = container.closest('section');
        if (parentSection) parentSection.style.display = 'none';
        return;
    }
    container.innerHTML = '';
    stills.forEach(url => {
        const box = document.createElement('div');
        box.className = 'video-still-box';
        if (url.startsWith('http') || url.startsWith('/')) {
            const inner = document.createElement('img');
            inner.src = url;
            inner.className = 'w-full h-full object-cover absoulte inset-0';
            box.appendChild(inner);
        } else {
            const inner = document.createElement('div');
            inner.className = 'video-still-box-inner';
            inner.textContent = url;
            box.appendChild(inner);
        }
        container.appendChild(box);
    });
}

function preloadImages(urls) {
    if (!urls || urls.length === 0) return;
    window.addEventListener('load', () => {
        setTimeout(() => {
            let loadedCount = 0;
            const loadNext = () => {
                if (loadedCount >= urls.length) return;
                const img = new Image();
                img.src = urls[loadedCount];
                img.onload = () => { loadedCount++; setTimeout(loadNext, 50); };
                img.onerror = () => { loadedCount++; loadNext(); };
            };
            loadNext();
        }, 1000);
    });
}
