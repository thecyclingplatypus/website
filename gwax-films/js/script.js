// Utility functions
const debounce = (func, wait = 100) => {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
};

// Cache DOM elements
const elements = {
    year: document.getElementById('year'),
    modal: document.getElementById('videoModal'),
    videoFrame: document.getElementById('videoFrame'),
    closeBtn: document.querySelector('.close'),
    filmCards: document.querySelectorAll('.film-card'),
    playIcons: document.querySelectorAll('.play-icon'),
    drawerToggle: document.querySelector('.drawer-toggle'),
    drawer: document.querySelector('.drawer'),
    header: document.querySelector('.main-header')
};

// Set current year in footer
if (elements.year) {
    elements.year.textContent = new Date().getFullYear();
}

// Initialize the application
const init = () => {
    // Set current year in footer
    if (elements.year) {
        elements.year.textContent = new Date().getFullYear();
    }
    
    setupEventListeners();
    setupIntersectionObserver();
    setupSmoothScrolling();
    setupVideoModal();
    setupDrawer();
    setupHeaderScroll();
    
    // Add event listener for modal open
    if (elements.modal) {
        elements.modal.addEventListener('show', handleModalOpen);
    }
};

// Setup all event listeners
const setupEventListeners = () => {
    // Close modal with Escape key
    document.addEventListener('keydown', handleKeyDown);
    
    // Close modal when clicking outside
    if (elements.modal) {
        elements.modal.addEventListener('click', handleOutsideClick);
    }
    
    // Close button for modal
    if (elements.closeBtn) {
        elements.closeBtn.addEventListener('click', closeVideoModal);
    }
};

// Setup Intersection Observer for lazy loading and animations
const setupIntersectionObserver = () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                target.style.opacity = '1';
                target.style.transform = 'translateY(0)';
                observer.unobserve(target);
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observe all film cards and other elements that should animate on scroll
    document.querySelectorAll('.film-card, .contact-section').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
};

// Setup smooth scrolling for navigation links
const setupSmoothScrolling = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 100;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Update active nav link
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
};

// Setup video modal functionality
const setupVideoModal = () => {
    if (!elements.filmCards || elements.filmCards.length === 0) return;

    elements.filmCards.forEach((card) => {
        const videoUrl = card.getAttribute('data-video');
        if (!videoUrl) return;

        const openModal = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Close any open modals first
            closeVideoModal();
            
            // Set the new video
            const embedUrl = getEmbedUrl(videoUrl);
            elements.videoFrame.src = embedUrl;
            elements.modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Focus on the close button for better keyboard navigation
            if (elements.closeBtn) {
                elements.closeBtn.focus();
            }
        };

        // Add click event to the entire card
        card.addEventListener('click', openModal);

        // Also add to play button if it exists
        const playButton = card.querySelector('.play-button');
        if (playButton) {
            playButton.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(e);
            });
        }
    });
};

// Convert various video URLs to embed format
const getEmbedUrl = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.includes('youtube.com') 
            ? url.split('v=')[1] 
            : url.split('youtu.be/')[1];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&enablejsapi=1`;
    } else if (url.includes('vimeo.com')) {
        const videoId = url.includes('player.vimeo.com') 
            ? url.split('video/')[1] 
            : url.split('vimeo.com/')[1];
        return `https://player.vimeo.com/video/${videoId}?autoplay=1&color=ff073a&title=0&byline=0&portrait=0`;
    }
    return url;
};

// Handle modal close
const closeVideoModal = () => {
    if (elements.videoFrame) {
        // Clear the iframe src to stop video playback
        elements.videoFrame.src = '';
    }
    if (elements.modal) {
        elements.modal.classList.remove('show');
    }
    document.body.style.overflow = 'auto';
    
    // Return focus to the last focused element before the modal was opened
    if (lastFocusedElement) {
        lastFocusedElement.focus();
    }
};

// Track the last focused element before modal opens
let lastFocusedElement = null;

// Handle outside click on modal
const handleOutsideClick = (e) => {
    if (e.target === elements.modal) {
        closeVideoModal();
    }
};

// Store the last focused element before modal opens
const handleModalOpen = () => {
    lastFocusedElement = document.activeElement;
};

// Handle keyboard events
const handleKeyDown = (e) => {
    if (e.key === 'Escape' && elements.modal.classList.contains('show')) {
        closeVideoModal();
    }
};

// Setup drawer functionality
const setupDrawer = () => {
    if (!elements.drawerToggle || !elements.drawer) return;

    elements.drawerToggle.addEventListener('click', () => {
        elements.drawer.classList.toggle('active');
        const icon = elements.drawerToggle.querySelector('.drawer-icon');
        if (elements.drawer.classList.contains('active')) {
            icon.textContent = '-';
        } else {
            icon.textContent = '+';
        }
    });
};

// Handle header scroll behavior
const setupHeaderScroll = () => {
    if (!elements.header) return;
    
    let lastScroll = 0;
    const headerHeight = elements.header.offsetHeight;
    
    const handleScroll = debounce(() => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            elements.header.classList.remove('hidden');
            return;
        }
        
        if (currentScroll > lastScroll && currentScroll > headerHeight) {
            // Scrolling down
            elements.header.classList.add('hidden');
        } else if (currentScroll < lastScroll) {
            // Scrolling up
            elements.header.classList.remove('hidden');
        }
        
        lastScroll = currentScroll;
    }, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
};

// Initialize the app when the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOMContentLoaded has already fired
    init();
}
