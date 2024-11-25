import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCc-U6HQZNCoRp9vX6mhJw92vyc4lmK_Ys",
    authDomain: "afrotc-evaluation-tracker.firebaseapp.com",
    databaseURL: "https://afrotc-evaluation-tracker-default-rtdb.firebaseio.com",
    projectId: "afrotc-evaluation-tracker",
    storageBucket: "afrotc-evaluation-tracker.appspot.com",
    messagingSenderId: "512597921417",
    appId: "1:512597921417:web:06fbe2e897ffe700b6c058",
    measurementId: "G-T54VQWMHPG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const formContainer = document.getElementById("form-container");
export { app, auth, db };

// Navbar Loader
// Navbar Loader
async function loadNavBar(role) {
    const navBarContainer = document.getElementById("navbar-container");
    if (!navBarContainer) {
        console.error("Navbar container not found!");
        return;
    }

    let navFile = "";

    // Determine the file to load based on the role
    switch (role) {
        case "Cadre":
            navFile = "src/assets/cadreNavBar.html";
            break;
        case "Wing/CC":
            navFile = "src/assets/wcNavBar.html";
            break;
        case "A3":
            navFile = "src/assets/a3NavBar.html";
            break;
        case "A9":
            navFile = "src/assets/a9NavBar.html";
            break;
        case "Flt/CC":
        case "IO":
            navFile = "src/assets/pocNavBar.html";
            break;
        case "POC":
            navFile = "src/assets/pocNavBar.html";
            break;
        case "GMC":
            navFile = "src/assets/gmcNavBar.html";
            break;
        default:
            navFile = "src/assets/gmcNavBar.html";
            break;
    }

    try {
        // Fetch the navbar HTML
        const response = await fetch(navFile);
        if (response.ok) {
            const navbarHTML = await response.text();
            navBarContainer.innerHTML = navbarHTML;

            // Inject the user's name into the navbar
            const user = auth.currentUser;
            if (user) {
                try {
                    // Fetch user data from Firestore
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const firstName = userData.firstName || "F";
                        const lastName = userData.lastName || "Last";

                        // Format name as "LastName, F."
                        const formattedName = `${lastName}, ${firstName.charAt(0)}.`;

                        // Find the dropdown button and update it with the name
                        const dropBtn = navBarContainer.querySelector(".dropbtn");
                        if (dropBtn) {
                            dropBtn.textContent = formattedName;
                        } else {
                            console.error("Dropdown button not found in navbar.");
                        }
                    } else {
                        console.error("User document does not exist in Firestore.");
                    }
                } catch (error) {
                    console.error("Error retrieving user data from Firestore:", error);
                }
            } else {
                console.error("No user is currently logged in.");
            }

            // Add the logout functionality
            const logoutButton = navBarContainer.querySelector("#logout-button");
            if (logoutButton) {
                logoutButton.addEventListener("click", async (event) => {
                    event.preventDefault();
                    try {
                        await signOut(auth);
                        console.log("User successfully logged out.");
                        window.location.href = "/index.html"; // Redirect to login page
                    } catch (error) {
                        console.error("Error logging out:", error);
                    }
                });
            } else {
                console.error("Logout button not found in navbar.");
            }
        } else {
            console.error(`Failed to load navbar: ${response.statusText}`);
            navBarContainer.innerHTML = '<p>Error loading navigation bar.</p>';
        }
    } catch (error) {
        console.error("Error fetching navbar:", error);
        navBarContainer.innerHTML = '<p>Error loading navigation bar.</p>';
    }
}


// Redirect After Login/Signup
function redirectUserBasedOnRole(role) {
    switch (role) {
        case "Cadre":
        case "Wing/CC":
        case "A3":
        case "A9":
        case "Flt/CC":
        case "IO":
            window.location.href = "detDashboard.html";
            break;
        case "POC":
        case "GMC":
            window.location.href = "cadetProfile.html";
            break;
        default:
            window.location.href = "cadetProfile.html";
            break;
    }
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("user-email").value;
    const password = document.getElementById("user-password").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("User logged in:", user.uid);

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role;
            console.log("User role detected:", role);

            await loadNavBar(role); // Load the appropriate navbar
            redirectUserBasedOnRole(role); // Redirect user to the correct page
        } else {
            console.error("No user data found in Firestore");
            alert("User data not found. Please contact support.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("Error logging in: " + error.message);
    }
}

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

    scrollToFormContainer();
    const loginForm = document.getElementById('user-login-form');

    // const loginForm = document.getElementById('user-login-form');
    loginForm.addEventListener('submit', handleLogin);
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
                    <option value="100">AS 100/150</option>
                    <option value="200">AS 200/250/500</option>
                    <option value="300">AS 300</option>
                    <option value="400">AS 400</option>
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
                    <option value="POC">POC</option>
                    <option value="GMC">GMC</option>
                </select>

                <button type="submit" class="submit-signup-btn">Sign Up</button>
            </form>
        </div>
    `;
    // <option value="Flt/CC">Flt/CC</option>
    scrollToFormContainer();
    const signupForm = document.getElementById('user-signup-form');
    signupForm.addEventListener('submit', handleSignUp);
}

function scrollToFormContainer() {
    formContainer.scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatPhoneNumber(phone) {
    // Remove non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Match groups of numbers for formatting
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }

    // Return original input if it doesn't match expected format
    return phone;
}

// Handle Signup Submission
async function handleSignUp(event) {
    event.preventDefault();

    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const studentID = document.getElementById('student-id').value;
    const phoneNumber = formatPhoneNumber(document.getElementById('phone-number').value);
    const age = parseInt(document.getElementById('age').value, 10);
    const gender = document.getElementById('gender').value;
    const university = document.getElementById('university').value;
    const asYear = document.getElementById('as-year').value;
    const flight = document.getElementById('flight').value;
    const role = document.getElementById('role').value;
    const email = document.getElementById('school-email').value;
    const password = document.getElementById('password').value;

    try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("User created:", user.uid);

        // Store user data in Firestore
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
            firstName,
            lastName,
            email,
            studentID,
            phoneNumber,
            age,
            gender,
            university,
            asYear,
            flight,
            role,
            uid: user.uid,
            createdAt: new Date().toISOString(),
        });

        console.log("User data saved in Firestore.");

        // Redirect user based on role
        redirectUserBasedOnRole(role);

    } catch (error) {
        console.error("Error during sign-up:", error);
        alert("Error signing up: " + error.message);
    }

}
// Auth State Listener
// Auth State Listener
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User is logged in:", user.uid);

        try {
            // Fetch the user's document from Firestore
            const userDocRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();

                // Extract user details
                const role = userData.role || "Unknown Role";
                const firstName = userData.firstName || "FirstName";
                const lastName = userData.lastName || "LastName";

                // Format name: LastName, F.I.
                const formattedName = `${lastName}, ${firstName.charAt(0).toUpperCase()}.`;

                console.log("Role detected on page load:", role);

                await loadNavBar(role); // Ensure the navbar matches the role
            } else {
                console.error("No user data found in Firestore");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    } else {
        console.error("No user logged in");
    }
});


// Button Handlers
window.handleLoginButtonClick = () => showLoginForm();
window.handleSignUpClick = () => showSignupForm();