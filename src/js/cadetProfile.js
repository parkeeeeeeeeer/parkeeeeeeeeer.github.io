import {
    doc,
    getDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import { auth, db } from './auth.js';
import { objectives } from "./SOB.js";

// Global variable to store user data
let currentUserData = null;

/**
 * Load user data from Firestore for the currently authenticated user.
 */
async function loadUserData() {
    const user = auth.currentUser;
    console.log("Current User:", user);

    if (user) {
        try {
            const userDoc = doc(db, "users", user.uid);
            console.log("Fetching document for UID:", user.uid);
            const userSnap = await getDoc(userDoc);

            if (userSnap.exists()) {
                console.log("User data fetched successfully:", userSnap.data());
                currentUserData = userSnap.data();
                populateCadetInfo(currentUserData);
                
                // Now render charts with actual user data
                renderPFAChart(currentUserData);
                renderSOBChart(currentUserData);
                renderAttendanceChart(currentUserData);
                renderForm2Chart(currentUserData);
                renderSnapshotsChart(currentUserData);
                
                // Update overview cards
                updateOverviewCards(currentUserData);
            } else {
                console.error('No user data found in Firestore for this UID!');
            }
        } catch (error) {
            console.error('Error fetching user data from Firestore:', error);
        }
    } else {
        console.error('No authenticated user found!');
        // Redirect to login page
        window.location.href = 'login.html';
    }
}

function formatPhoneNumber(phone) {
    // Handle empty or undefined phone numbers
    if (!phone) return 'N/A';
    
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
    if (!userData) return;
    
    const firstName = userData.firstName || "FirstName";
    const lastName = userData.lastName || "LastName";
    const formattedName = `${lastName}, ${firstName}`;

    const formattedPhone = formatPhoneNumber(userData.phoneNumber);

    // Set cadet name and basic info
    document.getElementById('cadet-name').textContent = formattedName;
    document.getElementById('cadet-as-year').textContent = `AS Year: ${userData.asYear || 'N/A'}`;
    document.getElementById('cadet-school').textContent = `University: ${userData.university || 'N/A'}`;
    document.getElementById('cadet-email').textContent = `Email: ${userData.email || 'N/A'}`;
    document.getElementById('cadet-phone').textContent = `Phone: ${formattedPhone}`;
    document.getElementById('cadet-schoolID').textContent = `School ID: ${userData.studentID || 'N/A'}`;
    
    // Set cadet initials for the avatar placeholder
    const initialsElement = document.getElementById('cadet-initials');
    if (initialsElement) {
        const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
        initialsElement.textContent = initials.toUpperCase();
    }
}

/**
 * Update overview cards with actual data
 */
function updateOverviewCards(userData) {
    if (!userData) return;
    
    // These would ideally come from the user data, but using placeholder values for now
    // Replace with actual calculations based on your data structure
    const pfaAverage = userData.pfaAverage || 90;
    const sobAverage = userData.sobAverage || 85;
    const attendanceAverage = userData.attendanceAverage || 92;
    
    document.getElementById('pfa-score').textContent = `${pfaAverage}%`;
    document.getElementById('sob-score').textContent = `${sobAverage}%`;
    document.getElementById('attendance-score').textContent = `${attendanceAverage}%`;
    
    // Update the recent updates section
    updateRecentActivities(userData);
}

/**
 * Populate recent activities/updates in the overview section
 */
function updateRecentActivities(userData) {
    const updatesContainer = document.getElementById('recent-updates-list');
    if (!updatesContainer) {
        console.error("Recent updates container not found!");
        return;
    }
    
    // Clear previous content
    updatesContainer.innerHTML = "";
    
    // Get updates from userData or use placeholders
    const updates = userData?.recentUpdates || [
        { type: 'pfa', message: 'PFA score updated', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
        { type: 'attendance', message: 'Attended LLAB session', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
        { type: 'form2', message: 'Form 2 submitted', timestamp: new Date(Date.now() - 86400000 * 10).toISOString() }
    ];
    
    if (updates.length === 0) {
        updatesContainer.innerHTML = "<p>No recent updates available.</p>";
        return;
    }
    
    // Sort updates by timestamp (newest first)
    const sortedUpdates = [...updates].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // Create and append update items
    sortedUpdates.forEach(update => {
        const updateItem = document.createElement('div');
        updateItem.className = 'update-item';
        
        // Format the timestamp to a readable date
        const timestamp = new Date(update.timestamp);
        const formattedDate = timestamp.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        // Set icon based on update type
        let icon = '📝'; // Default icon
        if (update.type === 'pfa') icon = '💪';
        else if (update.type === 'attendance') icon = '📅';
        else if (update.type === 'form2') icon = '📋';
        else if (update.type === 'sob') icon = '📊';
        
        updateItem.innerHTML = `
            <div>
                <span>${icon} ${update.message}</span>
                <div class="update-timestamp">${formattedDate}</div>
            </div>
        `;
        
        updatesContainer.appendChild(updateItem);
    });
}

/**
 * PFA Chart
 */
function renderPFAChart(userData) {
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

    // Use userData if available, otherwise fallback to placeholder data
    const situps = userData?.pfaScores?.situps || 50;
    const pushups = userData?.pfaScores?.pushups || 40;
    const run = userData?.pfaScores?.run || 90;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Situps', 'Pushups', 'Run'],
            datasets: [{
                label: 'PFA Metrics',
                data: [situps, pushups, run], 
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
                title: {
                    display: true,
                    text: 'Physical Fitness Assessment Scores'
                }
            }
        }
    });
    console.log('PFA Chart rendered successfully!');
}

/**
 * SOB Chart
 */
function renderSOBChart(userData) {
    // Find the SOB section first
    const sobSection = document.getElementById("sob");
    if (!sobSection) {
        console.error("SOB section not found in the DOM!");
        return;
    }
    
    // Find the table within the SOB section
    const sobTable = sobSection.querySelector('.data-table');
    if (!sobTable) {
        console.error("SOB table not found in the DOM!");
        
        // Create the table structure if it doesn't exist
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        
        const table = document.createElement('table');
        table.className = 'data-table';
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Objective #</th>
            <th>Description</th>
            <th>Score</th>
        `;
        thead.appendChild(headerRow);
        
        const tbody = document.createElement('tbody');
        
        table.appendChild(thead);
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        
        sobSection.innerHTML = '';
        sobSection.innerHTML = '<h3>SOB Performance</h3>';
        sobSection.appendChild(tableContainer);
        
        // Call the function again now that the table is created
        renderSOBChart(userData);
        return;
    }

    const tbody = sobTable.querySelector("tbody");
    if (!tbody) {
        console.error("SOB Table <tbody> not found!");
        return;
    }

    // Clear previous content
    tbody.innerHTML = "";

    // Get user SOB scores (if available)
    const userSOBScores = userData?.sobScores || {};

    // Group objectives by category
    const categories = {};
    objectives.forEach(obj => {
        if (!categories[obj.category]) {
            categories[obj.category] = [];
        }
        categories[obj.category].push(obj);
    });

    // Iterate through categories and create sections
    Object.keys(categories).forEach(category => {
        // Create a category header row
        const categoryRow = document.createElement("tr");
        const categoryCell = document.createElement("td");
        categoryCell.textContent = category;
        categoryCell.colSpan = 3; // Span across all columns
        categoryCell.className = 'category-header';
        categoryRow.appendChild(categoryCell);
        tbody.appendChild(categoryRow);

        // Add objectives under the category
        categories[category].forEach(obj => {
            const row = document.createElement("tr");

            const objectiveNumberCell = document.createElement("td");
            objectiveNumberCell.textContent = obj.objective_number;
            row.appendChild(objectiveNumberCell);

            const descriptionCell = document.createElement("td");
            descriptionCell.textContent = obj.description;
            row.appendChild(descriptionCell);

            const scoreCell = document.createElement("td");
            // Use user's score if available, otherwise "Pending"
            const score = userSOBScores[obj.objective_number];
            if (score !== undefined) {
                scoreCell.textContent = score;
                // Add classes based on score
                if (score >= 80) {
                    scoreCell.className = 'status-good';
                } else if (score >= 60) {
                    scoreCell.className = 'status-warning';
                } else {
                    scoreCell.className = 'status-danger';
                }
            } else {
                scoreCell.textContent = "Pending";
                scoreCell.style.color = '#757575'; // Gray for pending
            }
            scoreCell.style.textAlign = "center";
            scoreCell.style.fontWeight = "bold";
            row.appendChild(scoreCell);

            tbody.appendChild(row);
        });
    });

    console.log("SOB table with categorized sections rendered successfully!");
}

/**
 * Attendance Chart
 */
function renderAttendanceChart(userData) {
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

    // Use userData if available, otherwise fallback to placeholder data
    const attendanceData = userData?.attendance || [95, 88, 92, 85, 90];
    const weeks = attendanceData.map((_, index) => `Week ${index + 1}`);

    // Chart data
    const data = {
        labels: weeks,
        datasets: [{
            label: 'Attendance (%)',
            data: attendanceData,
            backgroundColor: '#4CAF50',
            borderColor: '#4CAF50',
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
            title: {
                display: true,
                text: 'Weekly Attendance Record'
            }
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
function renderForm2Chart(userData) {
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

    // Use userData if available, otherwise fallback to placeholder data
    const submitted = userData?.form2?.submitted || 80;
    const notSubmitted = userData?.form2?.notSubmitted || 20;

    // Chart data
    const data = {
        labels: ['Submitted', 'Not Submitted'],
        datasets: [{
            label: 'Form 2 Status',
            data: [submitted, notSubmitted],
            backgroundColor: ['#4CAF50', '#F44336'],
            borderColor: ['#4CAF50', '#F44336'],
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
                    text: 'Count (%)'
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Form 2 Submission Status'
            }
        }
    };

    // Render the chart
    new Chart(ctx, {
        type: 'pie',
        data: data,
        options: options,
    });
    console.log('Form 2 Status Chart rendered successfully!');
}

/**
 * Snapshots Chart
 */
function renderSnapshotsChart(userData) {
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

    // Use userData if available, otherwise fallback to placeholder data
    const snapshots = userData?.snapshots || {
        labels: ['2023-01', '2023-05', '2023-09', '2024-01'],
        pfa: [85, 88, 92, 90],
        attendance: [95, 90, 93, 92]
    };

    // Chart data
    const data = {
        labels: snapshots.labels,
        datasets: [
            {
                label: 'PFA Scores',
                data: snapshots.pfa,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
            },
            {
                label: 'Attendance (%)',
                data: snapshots.attendance,
                borderColor: '#03A9F4',
                backgroundColor: 'rgba(3, 169, 244, 0.2)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
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
                max: 100,
                title: {
                    display: true,
                    text: 'Scores/Percentage'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Time Period'
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Performance Over Time'
            }
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
    // Get the section ID from the clicked button
    const sectionId = event.currentTarget.getAttribute('data-section');
    console.log(`Showing section: ${sectionId}`);
    
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
    event.currentTarget.classList.add('active');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM content loaded, checking authentication...");
    
    // Listen for authentication state changes
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("User authenticated:", user.uid);
            loadUserData();
        } else {
            console.error("No authenticated user found!");
            // Redirect to login page
            window.location.href = 'login.html';
        }
    });

    // Attach event listeners to navigation links
    document.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', showSection);
    });
});

// Attach showSection to global scope for inline onclick attributes
window.showSection = showSection;