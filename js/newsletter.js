(function(){
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  // Notification helper
  function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('newsletterNotification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'newsletterNotification';
      notification.style.cssText = 'margin: 15px 0; padding: 15px; border-radius: 5px; display: none; position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
      document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.className = 'alert';
    notification.style.display = 'block';
    
    if (type === 'success') {
      notification.className = 'alert alert-success';
      notification.style.backgroundColor = '#d4edda';
      notification.style.color = '#155724';
      notification.style.borderColor = '#c3e6cb';
    } else if (type === 'error') {
      notification.className = 'alert alert-danger';
      notification.style.backgroundColor = '#f8d7da';
      notification.style.color = '#721c24';
      notification.style.borderColor = '#f5c6cb';
    } else {
      notification.className = 'alert alert-info';
      notification.style.backgroundColor = '#d1ecf1';
      notification.style.color = '#0c5460';
      notification.style.borderColor = '#bee5eb';
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      notification.style.display = 'none';
    }, 5000);
  }

  form.addEventListener('submit', async function(event){
    event.preventDefault();
    const emailInput = form.querySelector('input[type="email"], input[name="email"]');
    const email = (emailInput?.value || '').trim().toLowerCase();
    if (!email) { 
      showNotification('Please enter your email.', 'error');
      return;
    }

    const btn = form.querySelector('[type="submit"]');
    const originalText = btn ? btn.textContent : null;
    if (btn) btn.textContent = 'Subscribing...';

    try {
      const res = await fetch('https://faranalam-backend-portfolio.onrender.com/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Subscription failed');
      showNotification(data.message || 'Subscription successful! Check your email.', 'success');
      form.reset();
    } catch (err) {
      showNotification(err.message || 'Subscription failed. Please try again.', 'error');
    } finally {
      if (btn && originalText) btn.textContent = originalText;
    }
  });
})();
