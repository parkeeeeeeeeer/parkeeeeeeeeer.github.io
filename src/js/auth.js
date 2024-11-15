import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

// Firebase Configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Handle Login Form Submission
function handleSubmit(event) {
    event.preventDefault(); // Prevent form submission

    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;

    // Validate the email and password
    if (!validateEmail(email)) {
        alert('Invalid email format');
        return;
    }

    if (password.trim() === '') {
        alert('Password cannot be empty');
        return;
    }

    // Sign in with Firebase Authentication
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('Login successful', user);
            const role = getUserRole(user); // Retrieve user role (this should be fetched from Firestore)
            redirectUserBasedOnRole(role);  // Redirect based on user role
        })
        .catch((error) => {
            console.error('Error logging in', error.message);
            alert('Login failed. Please check your credentials.');
        });
}

// Handle Sign-Up Form Submission
function handleSignUp(event) {
    event.preventDefault(); // Prevent form submission

    // Retrieve values from the form fields
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('school-email').value;
    const studentId = document.getElementById('student-id').value;
    const phoneNumber = document.getElementById('phone-number').value;
    const gender = document.getElementById('gender').value;
    const age = document.getElementById('age').value;
    const university = document.getElementById('university').value;
    const asYear = document.getElementById('as-year').value;
    const flight = document.getElementById('flight').value;
    const role = document.getElementById('role').value;

    // Validate email
    if (!validateEmail(email)) {
        alert("Invalid email format");
        return;
    }

    // Create new user with Firebase Authentication
    createUserWithEmailAndPassword(auth, email, 'temporaryPassword123')  // Replace with secure password logic
        .then(async (userCredential) => {
            const user = userCredential.user;

            // Create Firestore document for this user
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                firstName,
                lastName,
                email,
                studentId,
                phoneNumber,
                gender,
                age,
                university,
                asYear,
                flight,
                role
            });

            console.log("User registered and data saved to Firestore");

            // Redirect after successful sign-up
            alert("Signup successful!");
            window.location.href = "detDashboard.html";  // Redirect to the appropriate page
        })
        .catch((error) => {
            console.error("Error signing up: ", error.message);
            alert("Error during sign-up. Please try again.");
        });
}

// Helper function to validate email format using regex
function validateEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
}

// Fetching user role (you should update this with actual logic)
function getUserRole(user) {
    // Assuming role is stored in Firestore; simulate role fetching
    return 'Cadre';  // This should be replaced with actual role fetching logic
}

// Redirect based on user role
function redirectUserBasedOnRole(role) {
    switch (role) {
        case 'Cadre':
        case 'Wing/CC':
        case 'A3':
        case 'A9':
        case 'Flt/CC':
        case 'IO':
            window.location.href = 'detDashboard.html';  // Redirect to common dashboard
            break;
        case 'POC':
        case 'GMC':
            window.location.href = 'cadetProfile.html';  // Redirect to cadet profile page
            break;
        default:
            window.location.href = 'cadetProfile.html';  // Default to cadet dashboard
            break;
    }
}

// Handle login and signup form transitions
function handleLoginButtonClick() {
    const loginFormContainer = document.getElementById('login-form-container');
    const signupFormContainer = document.getElementById('signup-form-container');
    const loginButton = document.querySelector('.login-btn');
    const signupButton = document.querySelector('.signup-btn');

    // Show login form, hide signup form
    loginFormContainer.classList.remove('hidden');
    signupFormContainer.classList.add('hidden');
    
    // Hide login button, show signup button
    loginButton.style.display = 'none';
    signupButton.style.display = 'block';

    // Smooth scroll to login form
    loginFormContainer.scrollIntoView({ behavior: 'smooth' });
}

function handleSignUpClick() {
    const loginFormContainer = document.getElementById('login-form-container');
    const signupFormContainer = document.getElementById('signup-form-container');
    const signupButton = document.querySelector('.signup-btn');
    const loginButton = document.querySelector('.login-btn');

    // Show signup form, hide login form
    signupFormContainer.classList.remove('hidden');
    loginFormContainer.classList.add('hidden');

    // Hide signup button, show login button
    signupButton.style.display = 'none';
    loginButton.style.display = 'block';

    // Smooth scroll to signup form
    signupFormContainer.scrollIntoView({ behavior: 'smooth' });
}

// Event listeners for form toggling
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('user-login-form');
    const signupForm = document.getElementById('signup-form-container');
    const loginButton = document.querySelector('.login-btn');

    // Hide signup form initially
    signupForm.classList.add('hidden');

    // Attach event listeners
    loginForm.addEventListener('submit', handleSubmit);
    loginButton.addEventListener('click', handleLoginButtonClick);
    document.querySelector('.signup-btn').addEventListener('click', handleSignUpClick);
});
