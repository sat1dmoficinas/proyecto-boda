// js/form.js
class RSVPForm {
    constructor() {
        this.form = document.getElementById('rsvp-form');
        this.successMessage = document.getElementById('success-message');
        this.closeSuccessBtn = document.getElementById('close-success');
        this.rsvpEndpoint = 'https://script.google.com/macros/s/AKfycbwQgd712SR-D712EAp3ienx_LgT7M8jAe7jliolAeOF7U7Ny4PYTwQJytxoU6NnWnXM/exec';

        this.init();
    }

    init() {
        if (!this.form) return;

        this.setupEventListeners();
        this.setupFormValidation();
        this.loadFormData(); // Load saved data if any
    }

    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Close success message
        if (this.closeSuccessBtn) {
            this.closeSuccessBtn.addEventListener('click', () => {
                this.hideSuccessMessage();
            });
        }

        // Auto-save form data
        this.form.addEventListener('input', () => {
            this.saveFormData();
        });

        // Allergy checkboxes
        const allergyCheckboxes = this.form.querySelectorAll('input[name="allergy"]');
        allergyCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateAllergyField();
            });
        });

        // Other allergy input
        const otherAllergyInput = this.form.querySelector('#other-allergy');
        if (otherAllergyInput) {
            otherAllergyInput.addEventListener('input', () => {
                this.saveFormData();
            });
        }
    }

    setupFormValidation() {
        // Real-time validation
        const nameInput = this.form.querySelector('#guest-name');
        if (nameInput) {
            nameInput.addEventListener('blur', () => {
                this.validateName(nameInput);
            });
        }

        const emailInput = this.form.querySelector('#guest-email');
        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                this.validateEmail(emailInput);
            });
        }
    }

    validateName(input) {
        const value = input.value.trim();
        if (value.length < 2) {
            this.showError(input, 'Por favor, introduce un nombre válido');
            return false;
        }
        this.clearError(input);
        return true;
    }

    validateEmail(input) {
        const value = input.value.trim();
        if (value && !this.isValidEmail(value)) {
            this.showError(input, 'Por favor, introduce un email válido');
            return false;
        }
        this.clearError(input);
        return true;
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    showError(input, message) {
        this.clearError(input);
        
        const error = document.createElement('div');
        error.className = 'form-error';
        error.textContent = message;
        error.style.color = '#ef4444';
        error.style.fontSize = '0.875rem';
        error.style.marginTop = '0.25rem';
        
        input.parentNode.appendChild(error);
        input.classList.add('error');
    }

    clearError(input) {
        const error = input.parentNode.querySelector('.form-error');
        if (error) {
            error.remove();
        }
        input.classList.remove('error');
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Validate form
        if (!this.validateForm()) {
            return;
        }

        // Get form data
        const formData = this.getFormData();

        // Show loading state
        this.showLoading();

        try {
            // Try to submit online first
            const success = await this.submitOnline(formData);
            
            if (success) {
                // Online submission successful
                this.handleSuccess(formData);
            } else {
                // Fallback to offline storage
                this.saveOffline(formData);
                this.handleSuccess(formData);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            // Save offline and show success anyway
            this.saveOffline(formData);
            this.handleSuccess(formData);
        }
    }

    validateForm() {
        let isValid = true;

        // Validate required fields
        const nameInput = this.form.querySelector('#guest-name');
        if (!this.validateName(nameInput)) {
            isValid = false;
        }

        const emailInput = this.form.querySelector('#guest-email');
        if (emailInput.value.trim()) {
            if (!this.validateEmail(emailInput)) {
                isValid = false;
            }
        }

        // Validate attendance selection
        const attendanceSelected = this.form.querySelector('input[name="attendance"]:checked');
        if (!attendanceSelected) {
            this.showFormError('Por favor, selecciona si asistirás o no');
            isValid = false;
        }

        return isValid;
    }

    showFormError(message) {
        // Remove existing error
        const existingError = this.form.querySelector('.form-general-error');
        if (existingError) {
            existingError.remove();
        }

        // Create new error
        const error = document.createElement('div');
        error.className = 'form-general-error';
        error.textContent = message;
        error.style.color = '#ef4444';
        error.style.backgroundColor = '#fee2e2';
        error.style.padding = '1rem';
        error.style.borderRadius = '0.5rem';
        error.style.marginBottom = '1rem';
        error.style.textAlign = 'center';

        this.form.insertBefore(error, this.form.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            error.remove();
        }, 5000);
    }

    getFormData() {
        const formData = {
            timestamp: new Date().toISOString(),
            name: this.form.querySelector('#guest-name').value.trim(),
            email: this.form.querySelector('#guest-email').value.trim(),
            attendance: this.form.querySelector('input[name="attendance"]:checked').value,
            guests: parseInt(this.form.querySelector('#guests-number').value),
            allergies: [],
            otherAllergy: this.form.querySelector('#other-allergy').value.trim(),
            message: this.form.querySelector('#guest-message').value.trim(),
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        // Get selected allergies
        const allergyCheckboxes = this.form.querySelectorAll('input[name="allergy"]:checked');
        allergyCheckboxes.forEach(checkbox => {
            formData.allergies.push(checkbox.value);
        });

        return formData;
    }

    showLoading() {
        const submitBtn = this.form.querySelector('.btn-submit');
        if (submitBtn) {
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitBtn.disabled = true;
            
            // Store original content to restore later
            submitBtn.dataset.originalContent = originalText;
        }
    }

    hideLoading() {
        const submitBtn = this.form.querySelector('.btn-submit');
        if (submitBtn && submitBtn.dataset.originalContent) {
            submitBtn.innerHTML = submitBtn.dataset.originalContent;
            submitBtn.disabled = false;
        }
    }

    async submitOnline(formData) {
        if (!this.rsvpEndpoint.includes('REEMPLAZA_CON_TU_SCRIPT_ID')) {
            const payload = new URLSearchParams();
            Object.entries(formData).forEach(([key, value]) => {
                const serializedValue = Array.isArray(value) ? value.join(', ') : value;
                payload.append(key, serializedValue);
            });

            const response = await fetch(this.rsvpEndpoint, {
                method: 'POST',
                body: payload
            });

            if (response.ok) {
                this.trackSubmission(formData);
                return true;
            }

            console.warn('RSVP submission failed with status:', response.status);
        } else {
            console.warn('RSVP endpoint not configured. Update rsvpEndpoint with your Google Apps Script URL.');
        }

        return false;
    }

    saveOffline(formData) {
        try {
            // Save to localStorage as backup
            const submissions = JSON.parse(localStorage.getItem('rsvpSubmissions') || '[]');
            submissions.push(formData);
            localStorage.setItem('rsvpSubmissions', JSON.stringify(submissions));
            
            // Register for background sync if available
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                navigator.serviceWorker.ready.then(registration => {
                    return registration.sync.register('sync-rsvp');
                });
            }
            
            return true;
        } catch (error) {
            console.error('Error saving offline:', error);
            return false;
        }
    }

    handleSuccess(formData) {
        // Hide loading
        this.hideLoading();
        
        // Show success message
        this.showSuccessMessage();
        
        // Clear form
        this.clearForm();
        
        // Clear saved form data
        this.clearFormData();
        
        // Track conversion
        this.trackConversion(formData);
        
        // Send confirmation email (simulated)
        this.sendConfirmationEmail(formData);
    }

    showSuccessMessage() {
        if (this.successMessage) {
            this.successMessage.classList.remove('hidden');
            this.form.classList.add('hidden');
            
            // Scroll to success message
            this.successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    hideSuccessMessage() {
        if (this.successMessage) {
            this.successMessage.classList.add('hidden');
            this.form.classList.remove('hidden');
        }
    }

    clearForm() {
        this.form.reset();
        // Reset select to first option
        const guestsSelect = this.form.querySelector('#guests-number');
        if (guestsSelect) {
            guestsSelect.value = '1';
        }
    }

    saveFormData() {
        try {
            const formData = {
                name: this.form.querySelector('#guest-name').value,
                email: this.form.querySelector('#guest-email').value,
                attendance: this.form.querySelector('input[name="attendance"]:checked')?.value || 'yes',
                guests: this.form.querySelector('#guests-number').value,
                allergies: Array.from(this.form.querySelectorAll('input[name="allergy"]:checked'))
                    .map(cb => cb.value),
                otherAllergy: this.form.querySelector('#other-allergy').value,
                message: this.form.querySelector('#guest-message').value
            };
            
            localStorage.setItem('rsvpDraft', JSON.stringify(formData));
        } catch (error) {
            console.error('Error saving form data:', error);
        }
    }

    loadFormData() {
        try {
            const saved = localStorage.getItem('rsvpDraft');
            if (!saved) return;

            const formData = JSON.parse(saved);

            // Restore form values
            if (formData.name) {
                this.form.querySelector('#guest-name').value = formData.name;
            }
            if (formData.email) {
                this.form.querySelector('#guest-email').value = formData.email;
            }
            if (formData.attendance) {
                const radio = this.form.querySelector(`input[name="attendance"][value="${formData.attendance}"]`);
                if (radio) radio.checked = true;
            }
            if (formData.guests) {
                this.form.querySelector('#guests-number').value = formData.guests;
            }
            if (formData.allergies) {
                formData.allergies.forEach(allergy => {
                    const checkbox = this.form.querySelector(`input[name="allergy"][value="${allergy}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            if (formData.otherAllergy) {
                this.form.querySelector('#other-allergy').value = formData.otherAllergy;
            }
            if (formData.message) {
                this.form.querySelector('#guest-message').value = formData.message;
            }
        } catch (error) {
            console.error('Error loading form data:', error);
        }
    }

    clearFormData() {
        localStorage.removeItem('rsvpDraft');
    }

    updateAllergyField() {
        const checkboxes = this.form.querySelectorAll('input[name="allergy"]:checked');
        const otherAllergyInput = this.form.querySelector('#other-allergy');
        
        if (checkboxes.length > 0) {
            otherAllergyInput.placeholder = '¿Alguna otra alergia o restricción?';
        } else {
            otherAllergyInput.placeholder = 'Ej: alergia al huevo, intolerancia a la fructosa...';
        }
    }

    trackSubmission(formData) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'rsvp_submitted', {
                event_category: 'Conversion',
                event_label: 'RSVP Form Submission',
                value: 1,
                guest_count: formData.guests,
                attendance: formData.attendance
            });
        }
    }

    trackConversion(formData) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                send_to: 'AW-XXXXXXXXX/YYYYYYYYYYYY',
                value: 1.0,
                currency: 'EUR',
                transaction_id: `rsvp_${Date.now()}_${formData.name}`
            });
        }
    }

    sendConfirmationEmail(formData) {
        // This is where you would integrate with your email service
        // For example: SendGrid, Mailchimp, or your own backend
        
        console.log('Confirmation email would be sent for:', formData);
        
        // Example fetch to your backend
        /*
        fetch('/api/send-confirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Confirmation email sent:', data);
        })
        .catch(error => {
            console.error('Error sending confirmation email:', error);
        });
        */
    }
}

// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const rsvpForm = new RSVPForm();
});

// Export for Service Worker if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RSVPForm };
}