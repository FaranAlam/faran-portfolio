document.getElementById('contactForm')?.addEventListener('submit', async function(event) {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const subject = document.getElementById('subject')?.value.trim() || '';
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) {
    alert("All fields are required.");
    return;
  }

  const btn = this.querySelector('[type="submit"]');
  const originalText = btn ? btn.textContent : null;
  if (btn) btn.textContent = 'Sending...';

  try {
    const res = await fetch('http://localhost:5000/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to send message');
    alert(data.message || 'Message sent successfully!');
    this.reset();
  } catch (err) {
    alert(err.message || 'Failed to send message.');
  } finally {
    if (btn && originalText) btn.textContent = originalText;
  }
});
