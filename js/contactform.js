// Contact Form Handler
console.log('Contact form script loaded');

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    console.log('Contact form element:', contactForm);

    if (!contactForm) {
        console.error('Contact form not found!');
        return;
    }

    contactForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        console.log('Form submitted!');

        // Get form values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject')?.value.trim() || '';
        const message = document.getElementById('message').value.trim();

        console.log('Form values:', { name, email, subject, message });

        // Clear previous errors
        clearErrors();

        // Validate inputs
        let hasError = false;

        if (!name) {
            showError('name-error', 'Name is required');
            hasError = true;
        } else if (name.length < 2) {
            showError('name-error', 'Name must be at least 2 characters');
            hasError = true;
        }

        if (!email) {
            showError('email-error', 'Email is required');
            hasError = true;
        } else if (!isValidEmail(email)) {
            showError('email-error', 'Please enter a valid email address');
            hasError = true;
        }

        if (!subject) {
            showError('subject-error', 'Subject is required');
            hasError = true;
        }

        if (!message) {
            showError('message-error', 'Message is required');
            hasError = true;
        } else if (message.length < 10) {
            showError('message-error', 'Message must be at least 10 characters');
            hasError = true;
        }

        if (hasError) return;

        console.log('Validation passed, sending data:', { name, email, subject, message });

        // Get button elements
        const btn = document.getElementById('contact-submit-btn');
        const btnText = btn ? .querySelector('.btn-text');
        const btnLoading = btn ? .querySelector('.btn-loading');

        // Show loading state
        if (btn) btn.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline-block';

        try {
            console.log('Sending fetch request to backend...');
            const res = await fetch('https://faranalam-backend-portfolio.onrender.com/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject, message })
            });
            console.log('Fetch response received:', res.status, res.statusText);

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data ? .message || 'Failed to send message');
            }

            // Show success message
            showNotification(data.message || 'Message sent successfully!', 'success');

            // Reset form
            this.reset();

            // Scroll to notification
            document.getElementById('formNotification') ? .scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        } catch (err) {
            showNotification(err.message || 'Failed to send message. Please try again.', 'error');
        } finally {
            // Reset button state
            if (btn) btn.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    });

    // Helper function to validate email
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Helper function to show field error
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';

            // Add error class to input
            const inputId = elementId.replace('-error', '');
            const input = document.getElementById(inputId);
            if (input) {
                input.classList.add('is-invalid');
            }
        }
    }

    // Helper function to clear all errors
    function clearErrors() {
        const errorElements = document.querySelectorAll('[id$="-error"]');
        errorElements.forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });

        // Remove error classes from inputs
        const inputs = document.querySelectorAll('.is-invalid');
        inputs.forEach(input => input.classList.remove('is-invalid'));
    }

    // Helper function to show notification
    function showNotification(message, type) {
        const notification = document.getElementById('formNotification');
        if (notification) {
            notification.textContent = message;
            notification.className = 'alert mt-3';

            if (type === 'success') {
                notification.classList.add('alert-success');
            } else {
                notification.classList.add('alert-danger');
            }

            notification.style.display = 'block';

            // Auto-hide after 5 seconds for success messages
            if (type === 'success') {
                setTimeout(() => {
                    notification.style.display = 'none';
                }, 5000);
            }
        }
    }
}); // End DOMContentLoaded