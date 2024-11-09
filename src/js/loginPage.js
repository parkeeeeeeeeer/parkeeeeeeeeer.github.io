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
    
    // Basic form validation
    if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Call the login function (this will be the Firebase or API call for actual login)
    loginUser(email, password);
}

// Helper function to validate email format using a regex pattern
function validateEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
}

function loginUser(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            console.log('User logged in:', user);
            
            // Redirect based on user role (you may need to fetch role from Firestore or another source)
            const simulatedUserRole = 'Cadre'; // Replace this with actual user role from Firebase or Firestore
            redirectUserBasedOnRole(simulatedUserRole);
        })
        .catch(error => {
            console.error('Login failed:', error);
            alert('Login failed. Please check your credentials.');
        });
}

// Function to redirect users based on their access level (role)
function redirectUserBasedOnRole(role) {
    switch (role) {
        case 'Cadre':
            window.location.href = 'detDashboard.html'; // Redirect to Cadre Dashboard
            break;
        case 'Wing/CC':
            window.location.href = 'detDashboard.html'; // Redirect to Wing/CC Dashboard
            break;
        case 'A3':
            window.location.href = 'detDashboard.html'; // Redirect to A3 Dashboard
            break;
        case 'A9':
            window.location.href = 'detDashboard.html'; // Redirect to A9 Dashboard
            break;
        case 'Flt/CC':
            window.location.href = 'detDashboard.html'; // Redirect to Flight Commander Dashboard
            break;
        case 'IO':
            window.location.href = 'detDashboard.html'; // Redirect to IO Dashboard
            break;
        case 'POC':
            window.location.href = 'cadetProfile.html'; // Redirect to POC Dashboard
            break;
        case 'GMC':
            window.location.href = 'cadetProfile.html'; // Redirect to GMC Dashboard
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



// // Function to handle the Login button click event
// function handleLoginButtonClick() {
//     const loginFormContainer = document.getElementById('login-form-container');
//     const loginButton = document.querySelector('.login-btn');

//     // Remove the 'hidden' class to display the form
//     loginFormContainer.classList.remove('hidden');
    
//     // Hide the login button
//     loginButton.style.display = 'none';

//     // Scroll to the login form smoothly
//     loginFormContainer.scrollIntoView({ behavior: 'smooth' });
// }

// // Function to handle the form submission event
// function handleSubmit(event) {
//     event.preventDefault(); // Prevent the default form submission behavior
    
//     // Extract values from the email and password input fields
//     const email = document.getElementById('user-email').value;
//     const password = document.getElementById('user-password').value;
    
//     // Basic form validation (optional: can expand this with more complex validation)
//     if (!validateEmail(email)) {
//         alert('Please enter a valid email address.');
//         return;
//     }

//     // Simulate login logic (you'll replace this with actual authentication logic)
//     loginUser(email, password);
// }

// // Helper function to validate email format using a regex pattern
// function validateEmail(email) {
//     const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
//     return emailPattern.test(email);
// }

// // Function to simulate a login action (you would replace this with an API call)
// function loginUser(email, password) {
//     // Example: Simulate successful login
//     console.log(`Logging in with Email: ${email} and Password: ${password}`);
    
//     // Placeholder for login API logic
//     setTimeout(() => {
//         alert('Login successful! Redirecting...');
//         // Redirect to the dashboard or main page after login
//         window.location.href = 'cadetDashboard.html'; // Replace with your actual dashboard route
//     }, 1000);
// }


// // // // Function to simulate a login action (you would replace this with an API call)
// // function loginUser(email, password) {
// //     fetch('/api/login', {
// //         method: 'POST',
// //         headers: {
// //             'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({ email, password }),
// //     })
// //     .then(response => response.json())
// //     .then(data => {
// //         if (data.message === 'Login successful') {
// //             console.log(`Login successful! Role: ${data.role}`);
// //             // Redirect based on role
// //             redirectUserBasedOnRole(data.role);
// //         } else {
// //             alert(data.message); // Show error message
// //         }
// //     })
// //     .catch(error => {
// //         console.error('Error during login:', error);
// //         alert('An error occurred during login.');
// //     });
// // }

// // // Function to redirect users based on their access level
// // function redirectUserBasedOnRole(role) {
// //     switch (role) {
// //         case 'Cadre':
// //             window.location.href = 'detDashboard.html'; // Redirect to Cadre Dashboard
// //             break;
// //         case 'Wing/CC':
// //             window.location.href = 'detDashboard.html'; // Redirect to Wing/CC Dashboard
// //             break;
// //         case 'A3':
// //             window.location.href = 'detDashboard.html'; // Redirect to A3 Dashboard
// //             break;
// //         case 'A9':
// //             window.location.href = 'detDashboard.html'; // Redirect to A9 Dashboard
// //             break;
// //         case 'Flt/CC':
// //             window.location.href = 'detDashboard.html'; // Redirect to Flight Commander Dashboard
// //             break;
// //         case 'IO':
// //             window.location.href = 'detDashboard.html'; // Redirect to IO Dashboard
// //             break;
// //         case 'POC':
// //             window.location.href = 'cadetProfile.html'; // Redirect to POC Dashboard
// //             break;
// //         case 'GMC':
// //             window.location.href = 'cadetProfile.html'; // Redirect to GMC Dashboard
// //             break;
// //         default:
// //             window.location.href = 'cadetProfile.html'; // Default redirect to a generic Cadet Dashboard
// //             break;
// //     }
// // }

// // Event listeners
// document.addEventListener('DOMContentLoaded', function () {
//     const loginForm = document.getElementById('user-login-form');
//     const loginButton = document.querySelector('.login-btn');
    
//     // Attach event handlers
//     loginForm.addEventListener('submit', handleSubmit);
//     loginButton.addEventListener('click', handleLoginButtonClick);
// });
