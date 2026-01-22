// js/main.js
class MainApp {
    constructor() {
        this.navToggle = document.getElementById('nav-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.backToTop = document.getElementById('back-to-top');
        this.musicToggle = document.getElementById('music-toggle');
        this.backgroundAudio = document.getElementById('background-audio');
        this.rsvpForm = document.getElementById('rsvp-form');
        this.faqQuestions = document.querySelectorAll('.faq-question');

        this.isNavOpen = false;
        this.isMusicPlaying = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.setupScrollHandlers();
        this.checkAudioState();
    }

    setupEventListeners() {
        // Navigation toggle
        if (this.navToggle && this.navMenu) {
            this.navToggle.addEventListener('click', () => this.toggleNavigation());
        }

        // Close navigation when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isNavOpen && 
                !this.navToggle.contains(e.target) && 
                !this.navMenu.contains(e.target)) {
                this.closeNavigation();
            }
        });

        // Navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavLinkClick(e);
            });
        });

        // Back to top
        if (this.backToTop) {
            this.backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Music toggle
        if (this.musicToggle && this.backgroundAudio) {
            this.musicToggle.addEventListener('click', () => this.toggleMusic());
        }

        // FAQ accordion
        this.faqQuestions.forEach(question => {
            question.addEventListener('click', () => this.toggleFAQ(question));
        });

        // Listen for intro completion
        document.addEventListener('introCompleted', () => {
            this.onIntroCompleted();
        });

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);

        // Observe all elements with animate-on-scroll class
    /*     document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        }); */

        // Observe sections for active nav link
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.getAttribute('id');
                if (entry.isIntersecting) {
                    this.setActiveNavLink(id);
                }
            });
        }, { threshold: 0.5 });

        // Observe all sections
        document.querySelectorAll('section[id]').forEach(section => {
            sectionObserver.observe(section);
        });
    }

    setupScrollHandlers() {
        let lastScrollTop = 0;
        const nav = document.querySelector('.main-nav');

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // Show/hide back to top button
            if (this.backToTop) {
                if (scrollTop > 500) {
                    this.backToTop.classList.add('visible');
                } else {
                    this.backToTop.classList.remove('visible');
                }
            }

            // Navbar hide/show on scroll
            if (nav) {
                if (scrollTop > lastScrollTop && scrollTop > 100) {
                    // Scrolling down
                    nav.style.transform = 'translateY(-100%)';
                } else {
                    // Scrolling up
                    nav.style.transform = 'translateY(0)';
                }
                lastScrollTop = scrollTop;
            }
        });
    }

    toggleNavigation() {
        this.isNavOpen = !this.isNavOpen;
        
        if (this.navToggle && this.navMenu) {
            if (this.isNavOpen) {
                this.navToggle.classList.add('open');
                this.navMenu.classList.add('open');
                document.body.style.overflow = 'hidden';
            } else {
                this.navToggle.classList.remove('open');
                this.navMenu.classList.remove('open');
                document.body.style.overflow = '';
            }
        }
    }

    closeNavigation() {
        this.isNavOpen = false;
        
        if (this.navToggle && this.navMenu) {
            this.navToggle.classList.remove('open');
            this.navMenu.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    handleNavLinkClick(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Close mobile navigation if open
            this.closeNavigation();

            // Smooth scroll to target
            const navHeight = document.querySelector('.main-nav')?.offsetHeight || 0;
            const targetPosition = targetElement.offsetTop - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Update URL without page reload
            history.pushState(null, '', targetId);
        }
    }

    setActiveNavLink(sectionId) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }

    checkAudioState() {
        if (this.backgroundAudio) {
            this.isMusicPlaying = !this.backgroundAudio.paused;
            this.updateMusicToggleIcon();
        }
    }

    toggleMusic() {
        if (!this.backgroundAudio) return;

        if (this.backgroundAudio.paused) {
            this.backgroundAudio.play().then(() => {
                this.isMusicPlaying = true;
                this.updateMusicToggleIcon();
                this.trackEvent('music_played');
            }).catch(error => {
                console.log('Audio play failed:', error);
            });
        } else {
            this.backgroundAudio.pause();
            this.isMusicPlaying = false;
            this.updateMusicToggleIcon();
            this.trackEvent('music_paused');
        }
    }

    updateMusicToggleIcon() {
        if (this.musicToggle) {
            const icon = this.musicToggle.querySelector('i');
            if (icon) {
                icon.className = this.isMusicPlaying ? 
                    'fas fa-volume-up' : 'fas fa-volume-mute';
            }
        }
    }

    toggleFAQ(question) {
        const isExpanded = question.getAttribute('aria-expanded') === 'true';
        const answer = question.nextElementSibling;

        // Close all other FAQs
        this.faqQuestions.forEach(q => {
            if (q !== question) {
                q.setAttribute('aria-expanded', 'false');
                q.nextElementSibling.classList.remove('open');
            }
        });

        // Toggle current FAQ
        question.setAttribute('aria-expanded', !isExpanded);
        answer.classList.toggle('open');

        // Track FAQ interaction
        this.trackEvent('faq_toggled', {
            question: question.textContent.trim(),
            expanded: !isExpanded
        });
    }

    onIntroCompleted() {
        // Initialize any components that depend on intro completion
        console.log('Main app initialized after intro completion');
        
        // Track page view
        this.trackPageView();
    }

    handleResize() {
        // Close navigation on resize to desktop
        if (window.innerWidth >= 768 && this.isNavOpen) {
            this.closeNavigation();
        }
    }

    trackPageView() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }
    }

    trackEvent(eventName, data = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'Engagement',
                ...data
            });
        }
    }
}

// Initialize main app
document.addEventListener('DOMContentLoaded', () => {
    const mainApp = new MainApp();
});

// Social sharing functions
function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Invitación para la boda de Jeison y Sonia');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'share', {
            method: 'Facebook',
            content_type: 'invitation'
        });
    }
}

function shareOnWhatsApp() {
    const text = encodeURIComponent('¡Invitación para la boda de Jeison y Sonia! ' + window.location.href);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'share', {
            method: 'WhatsApp',
            content_type: 'invitation'
        });
    }
}

function shareByEmail() {
    const subject = encodeURIComponent('Invitación Boda Jeison y Sonia');
    const body = encodeURIComponent(`Te invito a ver la invitación digital para la boda de Jeison y Sonia:\n\n${window.location.href}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'share', {
            method: 'Email',
            content_type: 'invitation'
        });
    }
}