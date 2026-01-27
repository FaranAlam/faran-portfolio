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
      const res = await fetch('https://faranalam-backend-portfolio.onrender.com/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Subscription failed');
      alert(data.message || 'Subscription successful!');
      form.reset();
    } catch (err) {
      alert(err.message || 'Subscription failed.');
    } finally {
      if (btn && originalText) btn.textContent = originalText;
    }
  });
})();
