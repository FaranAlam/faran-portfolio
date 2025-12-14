(function(){
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', async function(event){
    event.preventDefault();
    const emailInput = form.querySelector('input[type="email"], input[name="email"]');
    const email = (emailInput?.value || '').trim().toLowerCase();
    if (!email) { alert('Please enter your email.'); return; }

    const btn = form.querySelector('[type="submit"]');
    const originalText = btn ? btn.textContent : null;
    if (btn) btn.textContent = 'Subscribing...';

    try {
      // Try server first
      const res = await fetch('http://localhost:5000/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Subscription failed');
      
      // Also save to localStorage for admin panel
      saveSubscriberLocally(email);
      
      alert(data.message || 'Subscription successful!');
      form.reset();
    } catch (err) {
      // Fallback: save to localStorage
      saveSubscriberLocally(email);
      alert('Thank you for subscribing!');
      form.reset();
    } finally {
      if (btn && originalText) btn.textContent = originalText;
    }

    function saveSubscriberLocally(email) {
      const subscribers = JSON.parse(localStorage.getItem('newsLetterSubscribers') || '[]');
      if (!subscribers.find(s => s.email === email)) {
        subscribers.push({ email, date: new Date().toISOString() });
        localStorage.setItem('newsLetterSubscribers', JSON.stringify(subscribers));
      }
    }
  });
})();
