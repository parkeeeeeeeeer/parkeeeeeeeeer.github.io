// Function to handle the Login button click event
function handleLoginButtonClick() {
    const loginFormContainer = document.getElementById('login-form-container');
    const loginButton = document.querySelector('.login-btn');

    // Remove the 'hidden' class to display the form
    loginFormContainer.classList.remove('hidden');
    
    // Hide the login button
    loginButton.style.display = 'none';

    // Scroll to the login form smoothly
    loginFormContainer.scrollIntoView({ behavior: 'smooth' });
}

// Function to handle the form submission event
function handleSubmit(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    
    // Extract values from the email and password input fields
    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;
    
    // Basic form validation (optional: can expand this with more complex validation)
    if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Simulate login logic (you'll replace this with actual authentication logic)
    loginUser(email, password);
}

// Helper function to validate email format using a regex pattern
function validateEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
}

// Function to simulate a login action (you would replace this with an API call)
function loginUser(email, password) {
    // Example: Simulate successful login
    console.log(`Logging in with Email: ${email} and Password: ${password}`);
    
    // Placeholder for login API logic
    setTimeout(() => {
        alert('Login successful! Redirecting...');
        // Redirect to the dashboard or main page after login
        window.location.href = 'cadetDashboard.html'; // Replace with your actual dashboard route
    }, 1000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('user-login-form');
    const loginButton = document.querySelector('.login-btn');
    
    // Attach event handlers
    loginForm.addEventListener('submit', handleSubmit);
    loginButton.addEventListener('click', handleLoginButtonClick);
});
