// js/countdown.js
class CountdownTimer {
    constructor() {
        this.weddingDate = new Date('2026-09-05T17:00:00'); // 8 de mayo 2027, 17:00
        this.daysElement = document.getElementById('days');
        this.hoursElement = document.getElementById('hours');
        this.minutesElement = document.getElementById('minutes');
        this.secondsElement = document.getElementById('seconds');
        
        this.interval = null;
        
        this.init();
    }

    init() {
        this.updateCountdown();
        this.startTimer();
        
        // Update immediately when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateCountdown();
            }
        });
    }

    startTimer() {
        this.interval = setInterval(() => {
            this.updateCountdown();
        }, 1000);
    }

    updateCountdown() {
        const now = new Date().getTime();
        const distance = this.weddingDate.getTime() - now;

        if (distance < 0) {
            this.handleCountdownEnd();
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        this.updateDisplay(days, hours, minutes, seconds);
        
        // Add animation class for changes
        this.animateNumberChange();
    }

    updateDisplay(days, hours, minutes, seconds) {
        if (this.daysElement) {
            this.daysElement.textContent = days.toString().padStart(3, '0');
        }
        if (this.hoursElement) {
            this.hoursElement.textContent = hours.toString().padStart(2, '0');
        }
        if (this.minutesElement) {
            this.minutesElement.textContent = minutes.toString().padStart(2, '0');
        }
        if (this.secondsElement) {
            this.secondsElement.textContent = seconds.toString().padStart(2, '0');
        }
    }

    animateNumberChange() {
        // Add pulse animation to seconds element
        if (this.secondsElement) {
            this.secondsElement.classList.add('pulse');
            setTimeout(() => {
                this.secondsElement.classList.remove('pulse');
            }, 300);
        }
    }

    handleCountdownEnd() {
        clearInterval(this.interval);
        
        // Update display to zeros
        this.updateDisplay(0, 0, 0, 0);
        
        // Change message
        const countdownMessage = document.querySelector('.countdown-message p');
        if (countdownMessage) {
            countdownMessage.textContent = '¡El gran día ha llegado!';
            countdownMessage.style.color = '#d4af37';
            countdownMessage.style.fontSize = '2rem';
        }
        
        // Add celebration effect
        this.celebrate();
    }

    celebrate() {
        // Add celebration class to countdown container
        const countdownContainer = document.querySelector('.countdown-container');
        if (countdownContainer) {
            countdownContainer.classList.add('celebrating');
        }
        
        // Create some floating hearts
        this.createFloatingHearts();
        
        // Play celebration sound (optional)
        this.playCelebrationSound();
    }

    createFloatingHearts() {
        const container = document.querySelector('.countdown-section');
        if (!container) return;

        for (let i = 0; i < 15; i++) {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.innerHTML = '❤';
            heart.style.left = `${Math.random() * 100}%`;
            heart.style.animationDelay = `${Math.random() * 2}s`;
            heart.style.fontSize = `${Math.random() * 20 + 20}px`;
            heart.style.opacity = Math.random() * 0.5 + 0.5;
            
            container.appendChild(heart);
            
            // Remove after animation
            setTimeout(() => {
                heart.remove();
            }, 3000);
        }
    }

    playCelebrationSound() {
        // Optional: Play a celebration sound
        // const audio = new Audio('assets/audio/celebration.mp3');
        // audio.volume = 0.3;
        // audio.play().catch(e => console.log('Celebration sound prevented:', e));
    }

    getTimeRemaining() {
        const now = new Date().getTime();
        const distance = this.weddingDate.getTime() - now;
        
        if (distance < 0) {
            return {
                total: 0,
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            };
        }
        
        return {
            total: distance,
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
        };
    }

    // Format time for display
    formatTime(time) {
        return time < 10 ? `0${time}` : time;
    }

    // Destroy timer (clean up)
    destroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}

// Initialize countdown when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const countdownTimer = new CountdownTimer();
});

// Add CSS for animations (dynamically inject if needed)
const countdownStyles = `
    .pulse {
        animation: pulse 0.5s ease-in-out;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    .celebrating {
        animation: celebrate 2s ease-in-out;
    }
    
    @keyframes celebrate {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    .floating-heart {
        position: absolute;
        color: #ff6b6b;
        pointer-events: none;
        z-index: 10;
        animation: floatUp 3s ease-in-out forwards;
    }
    
    @keyframes floatUp {
        0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
        }
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = countdownStyles;
document.head.appendChild(styleSheet);