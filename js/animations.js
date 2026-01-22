// js/animations.js
class WeddingAnimations {
    constructor() {
        this.animations = [];
        this.intersectionObserver = null;
        
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupParallaxEffects();
        this.setupHoverAnimations();
        this.setupConfetti();
       /*  this.setupTextAnimations(); */
    }

    setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, observerOptions);

        // Observe all elements with data-animate attribute
        document.querySelectorAll('[data-animate]').forEach(el => {
            this.intersectionObserver.observe(el);
        });
    }

    animateElement(element) {
        const animationType = element.dataset.animate;
        const delay = element.dataset.delay || 0;
        
        setTimeout(() => {
            element.classList.add('animate__animated', `animate__${animationType}`);
            
            // Remove animation class after completion for re-triggering
            element.addEventListener('animationend', () => {
                element.classList.remove('animate__animated', `animate__${animationType}`);
            }, { once: true });
        }, delay);
    }

    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        if (!parallaxElements.length) return;

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = parseFloat(element.dataset.parallax) || 0.5;
                const yPos = -(scrollTop * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    setupHoverAnimations() {
        // Add hover effects to cards
        const cards = document.querySelectorAll('.card, .accommodation-card, .timeline-content');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.classList.add('hover-lift');
            });
            
            card.addEventListener('mouseleave', () => {
                card.classList.remove('hover-lift');
            });
        });

        // Add ripple effect to buttons
        const buttons = document.querySelectorAll('.btn:not(.no-ripple)');
        
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.7);
                    transform: scale(0);
                    animation: ripple-animation 0.6s linear;
                    width: ${size}px;
                    height: ${size}px;
                    top: ${y}px;
                    left: ${x}px;
                    pointer-events: none;
                `;
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // Add CSS for ripple animation
        const rippleStyle = document.createElement('style');
        rippleStyle.textContent = `
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            .btn {
                position: relative;
                overflow: hidden;
            }
        `;
        document.head.appendChild(rippleStyle);
    }

    setupConfetti() {
        // Create confetti button
        const confettiButton = document.getElementById('confetti-button');
        if (!confettiButton) return;

        confettiButton.addEventListener('click', () => {
            this.launchConfetti();
        });
    }

    launchConfetti() {
        const confettiCount = 150;
        const container = document.querySelector('.hero-section') || document.body;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.innerHTML = '❤️✨🌸';
            
            // Random properties
            const left = Math.random() * 100;
            const size = Math.random() * 20 + 10;
            const color = this.getRandomColor();
            const duration = Math.random() * 3 + 2;
            const delay = Math.random() * 2;
            
            confetti.style.cssText = `
                position: absolute;
                top: -50px;
                left: ${left}%;
                font-size: ${size}px;
                color: ${color};
                opacity: 0;
                z-index: 9999;
                pointer-events: none;
                animation: confetti-fall ${duration}s ease-in ${delay}s forwards;
            `;
            
            container.appendChild(confetti);
            
            // Remove after animation
            setTimeout(() => {
                confetti.remove();
            }, (duration + delay) * 1000);
        }

        // Add confetti animation CSS
        if (!document.querySelector('#confetti-styles')) {
            const style = document.createElement('style');
            style.id = 'confetti-styles';
            style.textContent = `
                @keyframes confetti-fall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    getRandomColor() {
        const colors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
            '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

/*     setupTextAnimations() {
        // Animate hero title letters
        const heroTitle = document.querySelector('.hero-title');
        if (!heroTitle) return;

        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        
        text.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? ' ' : char;
            span.style.animationDelay = `${index * 0.1}s`;
            span.classList.add('letter-animate');
            heroTitle.appendChild(span);
        });

        // Add CSS for letter animation
        const letterStyle = document.createElement('style');
        letterStyle.textContent = `
            .letter-animate {
                display: inline-block;
                opacity: 0;
                transform: translateY(20px);
                animation: letter-appear 0.5s ease forwards;
            }
            @keyframes letter-appear {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(letterStyle);
    } */

    // Utility function to create floating hearts
    createFloatingHearts(count = 10, container = document.body) {
        for (let i = 0; i < count; i++) {
            const heart = document.createElement('div');
            heart.innerHTML = '❤️';
            heart.style.cssText = `
                position: absolute;
                color: #ff6b6b;
                font-size: ${Math.random() * 20 + 20}px;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: 0;
                pointer-events: none;
                z-index: 9998;
                animation: float-heart ${Math.random() * 3 + 2}s ease-in-out forwards;
            `;
            
            container.appendChild(heart);
            
            setTimeout(() => {
                heart.remove();
            }, 5000);
        }

        // Add floating animation CSS if not exists
        if (!document.querySelector('#float-styles')) {
            const style = document.createElement('style');
            style.id = 'float-styles';
            style.textContent = `
                @keyframes float-heart {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100px) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Typewriter effect for text
    typewriter(element, text, speed = 50) {
        let i = 0;
        element.textContent = '';
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }

    // Scroll progress indicator
    setupScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #8a9b6e, #d4af37);
            width: 0%;
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
        });
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const animations = new WeddingAnimations();
    
    // Make available globally
    window.weddingAnimations = animations;
});

// Add loading animation for images
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    images.forEach(img => {
        // Add loading class
        img.classList.add('loading');
        
        // Remove loading class when loaded
        if (img.complete) {
            img.classList.remove('loading');
        } else {
            img.addEventListener('load', () => {
                img.classList.remove('loading');
                img.classList.add('loaded');
            });
        }
    });
    
    // Add CSS for loading animation
    const loadingStyle = document.createElement('style');
    loadingStyle.textContent = `
        img.loading {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        img.loaded {
            opacity: 1;
            animation: fadeIn 0.5s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(loadingStyle);
});
document.addEventListener('DOMContentLoaded', () => {
  const heroElements = document.querySelectorAll('#home .animate-on-scroll-hero');

  const heroObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        heroElements.forEach((el, index) => {
          setTimeout(() => {
            el.classList.add('animated');
          }, index * 300); // 300ms entre cada elemento
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  if (heroElements.length) {
    heroObserver.observe(heroElements[0]);
  }
});
