document.getElementById('contact-form').addEventListener('submit', function(event) {
  // Prevent the default form submission
  event.preventDefault();
  
  // Get the form inputs
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  // Simple form validation
  if (name === "" || email === "" || message === "") {
    alert("All fields are required.");
    return;
  }

  // Optional: You can handle the form data here before submission, e.g., show a loading spinner, etc.
  
  // Submit the form to Formspree
  this.submit();  // This will submit the form to Formspree after validation
});
