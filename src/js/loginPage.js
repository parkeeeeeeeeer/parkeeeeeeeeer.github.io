import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
      // Your web app's Firebase configuration
      // For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCc-U6HQZNCoRp9vX6mhJw92vyc4lmK_Ys",
    authDomain: "afrotc-evaluation-tracker.firebaseapp.com",
    databaseURL: "https://afrotc-evaluation-tracker-default-rtdb.firebaseio.com",
    projectId: "afrotc-evaluation-tracker",
    storageBucket: "afrotc-evaluation-tracker.firebasestorage.app",
    messagingSenderId: "512597921417",
    appId: "1:512597921417:web:06fbe2e897ffe700b6c058",
    measurementId: "G-T54VQWMHPG"
};
    
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


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
export function handleSubmit(event) {
    event.preventDefault(); // Prevent form submission

    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;

    // Validate the email and password before proceeding
    if (!validateEmail(email)) {
        alert('Invalid email format');
        return;
    }

    if (password.trim() === '') {
        alert('Password cannot be empty');
        return;
    }

    // Sign in with Firebase Auth
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in successfully
            const user = userCredential.user;
            console.log('Login successful', user);
            const role = getUserRole(user); // Assume you have a way to get the user's role
            redirectUserBasedOnRole(role);
        })
        .catch((error) => {
            const errorMessage = error.message;
            console.error('Error logging in', errorMessage);
            alert('Login failed. Please check your credentials.');
        });
}

// Helper function to validate email format using a regex pattern
function validateEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
}

// Function to simulate fetching user role (you'll replace this with actual logic)
function getUserRole(user) {
    // For now, return a simulated user role. You may need to fetch it from Firestore or another service.
    return 'Cadre'; // Example role, replace with actual role fetching logic
}

// Function to redirect users based on their access level (role)
function redirectUserBasedOnRole(role) {
    switch (role) {
        case 'Cadre':
        case 'Wing/CC':
        case 'A3':
        case 'A9':
        case 'Flt/CC':
        case 'IO':
            window.location.href = 'detDashboard.html'; // Redirect to the common dashboard
            break;
        case 'POC':
        case 'GMC':
            window.location.href = 'cadetProfile.html'; // Redirect to cadet profile page
            break;
        default:
            window.location.href = 'cadetProfile.html'; // Default redirect to Cadet Dashboard
            break;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('user-login-form');
    const loginButton = document.querySelector('.login-btn');
    
    // Attach event handlers
    loginForm.addEventListener('submit', handleSubmit);
    loginButton.addEventListener('click', handleLoginButtonClick);
});