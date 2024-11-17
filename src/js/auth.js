import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

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

const formContainer = document.getElementById('form-container');

// Inject Login Form
function showLoginForm() {
    formContainer.innerHTML = `
        <div id="login-form-container">
            <h2>Login with your Detachment or School Email</h2>
            <form id="user-login-form">
                <label for="user-email">Email:</label>
                <input type="email" id="user-email" name="user-email" placeholder="Enter your email" required>
                <label for="user-password">Password:</label>
                <input type="password" id="user-password" name="user-password" placeholder="Enter your password" required>
                <button type="submit" class="submit-login-btn">Login</button>
            </form>
        </div>
    `;
    const loginForm = document.getElementById('user-login-form');
    loginForm.addEventListener('submit', handleLogin);
}

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;

    try {
        // Log in the user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("User logged in:", user.uid);

        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User data:", userData);

            const role = userData.role; // Get role from Firestore
            redirectUserBasedOnRole(role); // Redirect user based on role
        } else {
            console.error("No user data found in Firestore");
            alert('User data not found. Please contact support.');
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert('Error logging in: ' + error.message);
    }
}

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

// Inject Signup Form
function showSignupForm() {
    formContainer.innerHTML = `
        <div id="signup-form-container">
            <h2>Create an Account</h2>
            <form id="user-signup-form">
                <label for="school-email">School Email:</label>
                <input type="email" id="school-email" name="school-email" placeholder="Enter your school email" required>

                <label for="password">Create Password:</label>
                <input type="password" id="password" name="password" placeholder="Create a password" required>

                <label for="first-name">First Name:</label>
                <input type="text" id="first-name" name="first-name" placeholder="Enter your first name" required>

                <label for="last-name">Last Name:</label>
                <input type="text" id="last-name" name="last-name" placeholder="Enter your last name" required>

                <label for="student-id">Student ID:</label>
                <input type="text" id="student-id" name="student-id" placeholder="Enter your student ID" required>

                <label for="phone-number">Phone Number:</label>
                <input type="tel" id="phone-number" name="phone-number" placeholder="Enter your phone number" required>

                <label for="age">Age:</label>
                <input type="number" id="age" name="age" placeholder="Enter your age" min="18" required>

                <label for="gender">Gender:</label>
                <select id="gender" name="gender" required>
                    <option value="" selected disabled>Select Gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                </select>

                <label for="university">University:</label>
                <select id="university" name="university" required>
                    <option value="" selected disabled>Select University</option>
                    <option value="HU">Howard University</option>
                    <option value="AU">American University</option>
                    <option value="CUA">Catholic University</option>
                    <option value="GU">Georgetown University</option>
                    <option value="GWU">George Washington University</option>
                    <option value="MU">Marymount University</option>
                    <option value="TWU">Trinity Washington University</option>
                    <option value="UDC">University of the District of Columbia</option>
                    <option value="N/A">N/A</option>
                </select>

                <label for="as-year">AS Year:</label>
                <select id="as-year" name="as-year" required>
                    <option value="" selected disabled>Select AS Year</option>
                    <option value="AS 100/150">AS 100/150</option>
                    <option value="AS 200/250/500">AS 200/250/500</option>
                    <option value="AS 300">AS 300</option>
                    <option value="AS 400">AS 400</option>
                    <option value="N/A">N/A</option>
                </select>

                <label for="flight">Flight:</label>
                <select id="flight" name="flight" required>
                    <option value="" selected disabled>Select Flight</option>
                    <option value="POC">POC</option>
                    <option value="Alpha">Alpha</option>
                    <option value="Bravo">Bravo</option>
                    <option value="Charlie">Charlie</option>
                    <option value="Delta">Delta</option>
                    <option value="Echo">Echo</option>
                    <option value="Foxtrot">Foxtrot</option>
                    <option value="Golf">Golf</option>
                    <option value="Hotel">Hotel</option>
                    <option value="India">India</option>
                    <option value="N/A">N/A</option>
                </select>

                <label for="role">Role:</label>
                <select id="role" name="role" required>
                    <option value="" selected disabled>Select Role</option>
                    <option value="Cadre">Cadre</option>
                    <option value="Wing/CC">Wing/CC</option>
                    <option value="A3">A3</option>
                    <option value="A9">A9</option>
                    <option value="IO">IO</option>
                    <option value="Flt/CC">Flt/CC</option>
                    <option value="POC">POC</option>
                    <option value="GMC">GMC</option>
                </select>

                <button type="submit" class="submit-signup-btn">Sign Up</button>
            </form>
        </div>
    `;

    const signupForm = document.getElementById('user-signup-form');
    signupForm.addEventListener('submit', handleSignUp);
}

// Handle Signup Submission
async function handleSignUp(event) {
    event.preventDefault();

    const email = document.getElementById('school-email').value;
    const password = document.getElementById('password').value;
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const studentID = document.getElementById('student-id').value;
    const phoneNumber = document.getElementById('phone-number').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const university = document.getElementById('university').value;
    const asYear = document.getElementById('as-year').value;
    const flight = document.getElementById('flight').value;
    const role = document.getElementById('role').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save additional user details in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            email,
            firstName,
            lastName,
            studentID,
            phoneNumber,
            age,
            gender,
            university,
            asYear,
            flight,
            role
        });

        alert('Account created successfully!');

         // Reset the form container to the original state
         formContainer.innerHTML = `<p>Thank you for signing up! Redirecting...</p>`;
        
         // Optional: Add a small delay before redirecting
         setTimeout(() => {
             window.location.href = 'index.html'; // Redirect to the original state/page
         }, 2000); // 2 seconds delay
         
    } catch (error) {
        alert('Error creating account: ' + error.message);
    }
}

// Button Handlers
window.handleLoginButtonClick = showLoginForm;
window.handleSignUpClick = showSignupForm;

