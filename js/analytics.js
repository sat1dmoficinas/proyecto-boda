// js/analytics.js
class WeddingAnalytics {
    constructor() {
        this.initialized = false;
        this.userId = this.getOrCreateUserId();
        this.sessionId = this.generateSessionId();
        this.pageStartTime = Date.now();
        
        this.init();
    }

    init() {
        this.trackPageView();
        this.setupEventTracking();
        this.setupErrorTracking();
        this.setupPerformanceTracking();
        this.setupScrollTracking();
        
        this.initialized = true;
    }

    getOrCreateUserId() {
        let userId = localStorage.getItem('wedding_user_id');
        
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('wedding_user_id', userId);
        }
        
        return userId;
    }

    generateSessionId() {
        return 'session_' + Date.now();
    }

    trackPageView() {
        const pageData = {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname,
            user_id: this.userId,
            session_id: this.sessionId,
            referrer: document.referrer,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
            user_agent: navigator.userAgent,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            online: navigator.onLine
        };

        // Send to Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('config', 'G-XXXXXXXXXX', {
                page_path: pageData.page_path,
                user_id: pageData.user_id,
                custom_map: {
                    'dimension1': 'user_id',
                    'dimension2': 'session_id',
                    'dimension3': 'screen_resolution'
                }
            });
        }

        // Send to custom analytics endpoint
        this.sendToAnalytics('page_view', pageData);
        
        // Store in localStorage for offline tracking
        this.storeEvent('page_view', pageData);
    }

    setupEventTracking() {
        // Track clicks on important elements
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Track navigation clicks
            if (target.matches('.nav-link')) {
                this.trackEvent('navigation_click', {
                    link_text: target.textContent.trim(),
                    link_href: target.getAttribute('href'),
                    link_position: this.getElementPosition(target)
                });
            }
            
            // Track button clicks
            if (target.matches('.btn') || target.closest('.btn')) {
                const button = target.closest('.btn');
                this.trackEvent('button_click', {
                    button_text: button.textContent.trim(),
                    button_class: button.className
                });
            }
            
            // Track external links
            if (target.matches('a[href^="http"]') && !target.href.includes(window.location.hostname)) {
                this.trackEvent('external_link_click', {
                    link_url: target.href,
                    link_text: target.textContent.trim()
                });
            }
            
            // Track accommodation clicks
            if (target.matches('.accommodation-actions a')) {
                this.trackEvent('accommodation_click', {
                    hotel_name: target.closest('.accommodation-card').querySelector('h3').textContent
                });
            }
        });

        // Track form interactions
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const formId = form.id || 'unknown_form';
                this.trackEvent('form_submit', {
                    form_id: formId,
                    form_name: form.querySelector('[name]') ? 'has_fields' : 'no_fields'
                });
            });
        });

        // Track video interactions
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.addEventListener('play', () => {
                this.trackEvent('video_play', {
                    video_src: video.src,
                    video_id: video.id || 'unknown'
                });
            });
            
            video.addEventListener('ended', () => {
                this.trackEvent('video_complete', {
                    video_src: video.src,
                    video_id: video.id || 'unknown'
                });
            });
        });

        // Track music toggle
        const musicToggle = document.getElementById('music-toggle');
        if (musicToggle) {
            musicToggle.addEventListener('click', () => {
                const audio = document.getElementById('background-audio');
                this.trackEvent('music_toggle', {
                    action: audio.paused ? 'play' : 'pause'
                });
            });
        }
    }

    setupErrorTracking() {
        // Track JavaScript errors
        window.addEventListener('error', (e) => {
            this.trackEvent('javascript_error', {
                error_message: e.message,
                error_filename: e.filename,
                error_lineno: e.lineno,
                error_colno: e.colno
            });
        });

        // Track promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.trackEvent('promise_rejection', {
                reason: e.reason?.message || e.reason
            });
        });

        // Track resource loading errors
        window.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                this.trackEvent('image_load_error', {
                    image_src: e.target.src
                });
            }
        }, true);
    }

    setupPerformanceTracking() {
        // Only track performance if supported
        if (!('performance' in window)) return;

        // Track page load performance
        window.addEventListener('load', () => {
            const timing = performance.timing;
            
            const perfData = {
                dns_lookup: timing.domainLookupEnd - timing.domainLookupStart,
                tcp_connection: timing.connectEnd - timing.connectStart,
                server_response: timing.responseEnd - timing.requestStart,
                dom_loading: timing.domContentLoadedEventStart - timing.domLoading,
                dom_interactive: timing.domInteractive - timing.navigationStart,
                dom_complete: timing.domComplete - timing.navigationStart,
                page_load: timing.loadEventEnd - timing.navigationStart,
                redirects: timing.redirectEnd - timing.redirectStart
            };

            this.trackEvent('performance_metrics', perfData);
        });

        // Track largest contentful paint
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.trackEvent('largest_contentful_paint', {
                        lcp_value: entry.startTime,
                        lcp_element: entry.element?.tagName || 'unknown'
                    });
                }
            });

            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }

    setupScrollTracking() {
        let scrollDepth = {
            25: false,
            50: false,
            75: false,
            100: false
        };

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;

            // Track scroll depth milestones
            Object.keys(scrollDepth).forEach(depth => {
                if (scrollPercent >= parseInt(depth) && !scrollDepth[depth]) {
                    scrollDepth[depth] = true;
                    this.trackEvent('scroll_depth', {
                        depth_percentage: depth,
                        scroll_position: scrollTop
                    });
                }
            });

            // Track time on page when user leaves
            this.trackTimeOnPage();
        });

        // Track time on page before unload
        window.addEventListener('beforeunload', () => {
            this.trackTimeOnPage();
        });
    }

    trackTimeOnPage() {
        const timeSpent = Date.now() - this.pageStartTime;
        this.trackEvent('time_on_page', {
            time_spent_ms: timeSpent,
            time_spent_seconds: Math.round(timeSpent / 1000)
        });
    }

    trackEvent(eventName, eventData = {}) {
        const eventPayload = {
            event: eventName,
            timestamp: new Date().toISOString(),
            user_id: this.userId,
            session_id: this.sessionId,
            page_url: window.location.href,
            ...eventData
        };

        // Send to Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, eventData);
        }

        // Send to custom analytics
        this.sendToAnalytics(eventName, eventPayload);
        
        // Store for offline tracking
        this.storeEvent(eventName, eventPayload);
    }

    sendToAnalytics(eventName, data) {
        // Your analytics endpoint URL
        const endpoint = 'https://your-analytics-endpoint.com/track';
        
        // Using navigator.sendBeacon for reliable delivery during page unload
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            navigator.sendBeacon(endpoint, blob);
        } else {
            // Fallback to fetch
            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                keepalive: true // Keep request alive after page unload
            }).catch(error => {
                console.error('Analytics error:', error);
                // Store for retry
                this.storeEvent(eventName, data);
            });
        }
    }

    storeEvent(eventName, data) {
        try {
            const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
            events.push({
                event: eventName,
                data: data,
                timestamp: new Date().toISOString()
            });
            
            // Keep only last 100 events to avoid localStorage overflow
            if (events.length > 100) {
                events.splice(0, events.length - 100);
            }
            
            localStorage.setItem('analytics_events', JSON.stringify(events));
        } catch (error) {
            console.error('Error storing analytics event:', error);
        }
    }

    flushEvents() {
        try {
            const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
            
            if (events.length === 0) return;

            // Send all stored events
            events.forEach(event => {
                this.sendToAnalytics(event.event, event.data);
            });

            // Clear stored events
            localStorage.removeItem('analytics_events');
        } catch (error) {
            console.error('Error flushing analytics events:', error);
        }
    }

    getElementPosition(element) {
        if (!element) return 'unknown';
        
        const siblings = Array.from(element.parentNode.children);
        const index = siblings.indexOf(element);
        
        if (index === 0) return 'first';
        if (index === siblings.length - 1) return 'last';
        return `position_${index + 1}`;
    }

    // Public methods for other components to use
    trackRSVPSubmission(data) {
        this.trackEvent('rsvp_submission', {
            ...data,
            form_completion_time: Date.now() - this.pageStartTime
        });
    }

    trackIntroCompletion(skipped = false) {
        this.trackEvent('intro_completion', {
            skipped: skipped,
            completion_time: Date.now() - this.pageStartTime
        });
    }

    trackShare(method, content) {
        this.trackEvent('share', {
            method: method,
            content_type: content
        });
    }
}

// Initialize analytics
document.addEventListener('DOMContentLoaded', () => {
    const analytics = new WeddingAnalytics();
    
    // Make analytics available globally for other components
    window.weddingAnalytics = analytics;
    
    // Flush any stored events on page load
    setTimeout(() => analytics.flushEvents(), 1000);
});

// Track offline/online status
window.addEventListener('online', () => {
    if (window.weddingAnalytics) {
        window.weddingAnalytics.trackEvent('connection_restored');
        window.weddingAnalytics.flushEvents();
    }
});

window.addEventListener('offline', () => {
    if (window.weddingAnalytics) {
        window.weddingAnalytics.trackEvent('connection_lost');
    }
});

// Track browser features
if (window.weddingAnalytics) {
    const features = {
        service_worker: 'serviceWorker' in navigator,
        push_notifications: 'PushManager' in window,
        geolocation: 'geolocation' in navigator,
        webgl: (() => {
            try {
                return !!window.WebGLRenderingContext;
            } catch (e) {
                return false;
            }
        })(),
        touch: 'ontouchstart' in window,
        cookie_enabled: navigator.cookieEnabled,
        do_not_track: navigator.doNotTrack
    };

    window.weddingAnalytics.trackEvent('browser_features', features);
}