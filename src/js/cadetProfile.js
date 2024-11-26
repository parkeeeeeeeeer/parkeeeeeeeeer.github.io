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
 * PFA Chart
 */
function renderPFAChart() {
    const pfaChart = document.getElementById('pfa-chart');
    if (!pfaChart) {
        console.error('PFA Chart element not found in the DOM!');
        return;
    }

    const ctx = pfaChart.getContext('2d');
    if (!ctx) {
        console.error('Failed to get 2D context for PFA Chart!');
        return;
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Situps', 'Pushups', 'Run'],
            datasets: [{
                label: 'PFA Metrics',
                data: [50, 40, 90], 
                backgroundColor: ['#4CAF50', '#FFC107', '#03A9F4'],
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true, 
            maintainAspectRatio: true, 
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    position: 'top', 
                },
            }
        }
    });
    console.log('PFA Chart rendered successfully!');
}

/**
 * SOB Chart
 */
function renderSOBChart() {
    const sobChart = document.getElementById('sob-chart');
    if (!sobChart) {
        console.error('SOB Chart element not found in the DOM!');
        return;
    }

    const ctx = sobChart.getContext('2d');
    if (!ctx) {
        console.error('Failed to get 2D context for SOB Chart!');
        return;
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Start', 'Midterm', 'End'], 
            datasets: [{
                label: 'Standards of Behavior', 
                data: [50, 40, 90], 
                borderColor: '#4CAF50', 
                backgroundColor: 'rgba(76, 175, 80, 0.2)', 
                borderWidth: 2, 
                tension: 0.4, 
                fill: true 
            }]
        }, 
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100, 
                    title: {
                        display: true,
                        text: 'SOB Score (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Semester Timeline'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top', 
                },
            }
        }
    });
    console.log('SOB Chart rendered successfully!');
} 
/**
 * Attendance Chart
 */
function renderAttendanceChart() {
    const attendanceChart = document.getElementById('attendance-chart');
    if (!attendanceChart) {
        console.error('Attendance Chart element not found in the DOM!');
        return;
    }

    const ctx = attendanceChart.getContext('2d');
    if (!ctx) {
        console.error('Failed to get 2D context for Attendance Chart!');
        return;
    }

    // Placeholder data
    const data = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'], // X-axis labels
        datasets: [{
            label: 'Attendance (%)',
            data: [95, 88, 92, 85, 90], // Placeholder values for attendance
            backgroundColor: ['#4CAF50', '#FFC107', '#03A9F4', '#FF5733', '#33FFBD'],
            borderColor: ['#4CAF50', '#FFC107', '#03A9F4', '#FF5733', '#33FFBD'],
            borderWidth: 1,
        }]
    };

    // Chart options
    const options = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: 'Attendance (%)'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Weeks'
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
            },
        }
    };

    // Render the chart
    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: options,
    });
    console.log('Attendance Chart rendered successfully!');
}
/**
 * Form2 Chart
 */
function renderForm2Chart() {
    const form2Chart = document.getElementById('form2-chart');
    if (!form2Chart) {
        console.error('Form 2 Chart element not found in the DOM!');
        return;
    }

    const ctx = form2Chart.getContext('2d');
    if (!ctx) {
        console.error('Failed to get 2D context for Form 2 Chart!');
        return;
    }

    // Placeholder data for submitted and not submitted
    const data = {
        labels: ['Submitted', 'Not Submitted'], // X-axis labels
        datasets: [{
            label: 'Form 2 Status',
            data: [80, 20], // Example: 80 submitted, 20 not submitted
            backgroundColor: ['#4CAF50', '#FF5733'], // Colors for the bars
            borderColor: ['#4CAF50', '#FF5733'], // Border colors
            borderWidth: 1,
        }]
    };

    // Chart options
    const options = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            y: {
                beginAtZero: true,
                max: 100, // Range from 0 to 100
                title: {
                    display: true,
                    text: 'Count (%)'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Status'
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
            },
        }
    };

    // Render the chart
    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: options,
    });
    console.log('Form 2 Status Chart rendered successfully!');
}

/**
 * Snapshots Chart
 */
function renderSnapshotsChart() {
    const snapshotsChart = document.getElementById('snapshots-chart');
    if (!snapshotsChart) {
        console.error('Snapshots Chart element not found in the DOM!');
        return;
    }

    const ctx = snapshotsChart.getContext('2d');
    if (!ctx) {
        console.error('Failed to get 2D context for Snapshots Chart!');
        return;
    }

    // Placeholder data
    const data = {
        labels: ['2023-01', '2023-05', '2023-09', '2024-01'], // Timestamps
        datasets: [
            {
                label: 'PFA Scores',
                data: [85, 88, 92, 90], // Example PFA scores
                borderColor: '#4CAF50', // Line color for PFA
                backgroundColor: 'rgba(76, 175, 80, 0.2)', // Fill color for PFA
                borderWidth: 2,
                tension: 0.4, // Smooth curves
                fill: true, // Fill the area under the line
            },
            {
                label: 'Attendance (%)',
                data: [95, 90, 93, 92], // Example attendance percentages
                borderColor: '#03A9F4', // Line color for Attendance
                backgroundColor: 'rgba(3, 169, 244, 0.2)', // Fill color for Attendance
                borderWidth: 2,
                tension: 0.4, // Smooth curves
                fill: true, // Fill the area under the line
            }
        ]
    };

    // Chart options
    const options = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            y: {
                beginAtZero: true,
                max: 100, // Range from 0 to 100
                title: {
                    display: true,
                    text: 'Scores/Percentage'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Timestamps'
                }
            }
        },
        plugins: {
            legend: {
                position: 'top', // Positions the legend at the top
            },
        }
    };

    // Render the chart
    new Chart(ctx, {
        type: 'line',
        data: data,
        options: options,
    });
    console.log('Data Snapshots Chart rendered successfully!');
}


function showSection(event) {
    const sectionId = event.target.getAttribute('data-section');
    const targetSection = document.getElementById(sectionId);

    if (!targetSection) {
        console.error(`Target section "${sectionId}" not found in the DOM!`);
        return;
    }

    // Hide all sections
    document.querySelectorAll('.content-section').forEach((section) => {
        section.classList.remove('active');
    });

    // Remove 'active' class from all nav links
    document.querySelectorAll('.nav-link').forEach((link) => {
        link.classList.remove('active');
    });

    // Show the selected section and highlight the active link
    targetSection.classList.add('active');
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
        }
    });

    document.querySelectorAll('.nav-link').forEach((link) => {
        console.log(`Attaching event listener to: ${link.textContent}`);
        link.addEventListener('click', showSection);
    });

    // Render placeholder content for charts
    renderPFAChart();
    renderSOBChart(); 
    renderAttendanceChart();
    renderForm2Chart(); 
    renderSnapshotsChart(); 
});

// Attach showSection to global scope
window.showSection = showSection; 
