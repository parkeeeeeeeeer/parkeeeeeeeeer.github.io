import {
    doc,
    getDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import { auth, db } from './auth.js';

/**
 * Load user data from Firestore for the currently authenticated user.
 */
async function loadUserData() {
    const user = auth.currentUser;
    console.log("Current User:", user); // Debug current user

    if (user) {
        try {
            const userDoc = doc(db, "users", user.uid);
            console.log("Fetching document for UID:", user.uid); // Debug Firestore doc reference
            const userSnap = await getDoc(userDoc);

            if (userSnap.exists()) {
                console.log("User data fetched successfully:", userSnap.data()); // Debug fetched data
                const userData = userSnap.data();
                populateCadetInfo(userData);
            } else {
                console.error('No user data found in Firestore for this UID!');
            }
        } catch (error) {
            console.error('Error fetching user data from Firestore:', error);
        }
    } else {
        console.error('No authenticated user found!');
    }
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

function populateCadetInfo(userData) {
    const firstName = userData.firstName || "FirstName";
    const lastName = userData.lastName || "LastName";
    const formattedName = `${lastName}, ${firstName}`;

    const formattedPhone = formatPhoneNumber(userData.phoneNumber || '');

    document.getElementById('cadet-name').textContent = formattedName;
    document.getElementById('cadet-as-year').textContent = `AS Year: ${userData.asYear}`;
    document.getElementById('cadet-school').textContent = `University: ${userData.university || 'N/A'}`;
    document.getElementById('cadet-email').textContent = `Email: ${userData.email || 'N/A'}`;
    document.getElementById('cadet-phone').textContent = `Phone: ${formattedPhone || 'N/A'}`;
    document.getElementById('cadet-schoolID').textContent = `School ID: ${userData.studentID || 'N/A'}`;

}

/**
 * Placeholder for rendering PFA chart.
 */
function renderPFAChart() {
    const pfaChart = document.getElementById('pfa-chart');
    pfaChart.innerHTML = '<p>PFA Chart Placeholder</p>';
    // Example: Replace with Chart.js or D3.js logic.
}

/**
 * Placeholder for rendering SOB chart.
 */
function renderSOBChart() {
    const sobChart = document.getElementById('sob-chart');
    sobChart.innerHTML = '<p>SOB Chart Placeholder</p>';
    // Example: Replace with Chart.js or D3.js logic.
}

function showSection(event) {
    const sectionId = event.target.getAttribute('data-section');

    // Hide all sections
    document.querySelectorAll('.content-section').forEach((section) => {
        section.classList.remove('active');
    });

    // Remove 'active' class from all nav links
    document.querySelectorAll('.nav-link').forEach((link) => {
        link.classList.remove('active');
    });

    // Show the selected section and highlight the active link
    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("User authenticated:", user.uid);
            loadUserData();
        } else {
            console.error("No authenticated user found!");
            // Redirect to login or show an error
        }
    });
    // Attach navigation event listeners
    document.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', showSection);
    });

    // Render placeholder content for charts
    renderPFAChart();
    renderSOBChart();
});
