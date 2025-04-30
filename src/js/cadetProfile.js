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

                // const pfaData = await loadUserPFAData();
                
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
    const pfaScore = userData.latestPFA.totalScore ||90;
    const sobAverage = userData.sobAverage || 85;
    const attendanceAverage = userData.attendanceAverage || 92;
    
    document.getElementById('pfa-score').textContent = `${pfaScore}%`;
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
// Function that provides both stacked bar and pie chart options
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
    
    // Extract data properly with error checking
    const situpScore = userData?.latestPFA?.situps?.points || 20;
    const situpCount = userData?.latestPFA?.situps?.count || 35;
    const pushupScore = userData?.latestPFA?.pushups?.points || 20;
    const pushupCount = userData?.latestPFA?.pushups?.count || 35;
    const runScore = userData?.latestPFA?.run?.points || 60;
    const runTime = userData?.latestPFA?.run?.time || "15:00";
    
    // Calculate total score
    const totalScore = situpScore + pushupScore + runScore;
    
    // Create horizontal bar chart with total
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Situps', 'Pushups', 'Run', 'TOTAL'],
            datasets: [
                {
                    label: 'Situps',
                    data: [situpScore, 0, 0, situpScore],
                    backgroundColor: 'rgba(76, 175, 80, 0.7)',  // Green for Situps
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 1,
                    stack: 'Stack 0'
                },
                {
                    label: 'Pushups',
                    data: [0, pushupScore, 0, pushupScore],
                    backgroundColor: 'rgba(255, 193, 7, 0.7)',  // Amber for Pushups
                    borderColor: 'rgba(255, 193, 7, 1)',
                    borderWidth: 1,
                    stack: 'Stack 0'
                },
                {
                    label: 'Run',
                    data: [0, 0, runScore, runScore],
                    backgroundColor: 'rgba(3, 169, 244, 0.7)',  // Blue for Run
                    borderColor: 'rgba(3, 169, 244, 1)',
                    borderWidth: 1,
                    stack: 'Stack 0'
                }
            ]
        },
        options: {
            indexAxis: 'y',  // This makes the bars horizontal
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    stacked: true,
                    beginAtZero: true,
                    max: 100,  // Ensure scale accommodates total
                    title: {
                        display: true,
                        text: 'Points'
                    }
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Exercise Type'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw || 0;
                            if (value === 0) return null; // Don't show tooltip for empty stacks
                            
                            const datasetLabel = context.dataset.label || '';
                            const percent = Math.round((value / totalScore) * 100);
                            
                            if (context.dataIndex === 3) { // Total row
                                return `${datasetLabel}: ${value} points (${percent}% of total)`;
                            }
                            
                            if (datasetLabel === 'Situps') {
                                return [`${datasetLabel}: ${value} points (${percent}% of total)`, `Count: ${situpCount} situps`];
                            } else if (datasetLabel === 'Pushups') {
                                return [`${datasetLabel}: ${value} points (${percent}% of total)`, `Count: ${pushupCount} pushups`];
                            } else if (datasetLabel === 'Run') {
                                return [`${datasetLabel}: ${value} points (${percent}% of total)`, `Time: ${runTime}`];
                            }
                        }
                    }
                },
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Physical Fitness Assessment Breakdown',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                datalabels: {
                    formatter: function(value, context) {
                        if (value === 0) return null; // Don't show labels for empty stacks
                        
                        const datasetLabel = context.dataset.label;
                        
                        if (context.dataIndex === 3) { // Total row
                            return `${value} pts`;
                        }
                        
                        if (datasetLabel === 'Situps') {
                            return `${value} pts (${situpCount} reps)`;
                        } else if (datasetLabel === 'Pushups') {
                            return `${value} pts (${pushupCount} reps)`;
                        } else if (datasetLabel === 'Run') {
                            return `${value} pts (${runTime})`;
                        }
                    },
                    color: '#000',
                    font: {
                        weight: 'bold'
                    },
                    anchor: 'end',
                    align: 'end'
                }
            }
        }
    });
    
    console.log('Horizontal PFA Chart with total rendered successfully!');
}

/**
 * Update the score cell with proper color-coding based on standard status
 */
/**
 * Update the score cell with proper color-coding based on standard status
 * This version ensures that standard status takes precedence over the raw score coloring
 */
function updateScoreCell(scoreCell, score, standardStatus) {
    if (score) {
        scoreCell.textContent = score;
        scoreCell.style.fontWeight = "bold";
        
        // First remove any existing status classes
        scoreCell.classList.remove('status-good', 'status-warning', 'status-danger', 
                                  'score-exceeding', 'score-meeting', 'score-below');
        
        // Add class based on standard status - this takes precedence
        if (standardStatus === "exceeding") {
            scoreCell.className = 'obj-score score-exceeding';
            // Also force the color directly with inline style to ensure it overrides
            scoreCell.style.color = 'var(--success-color)';
        } else if (standardStatus === "meeting") {
            scoreCell.className = 'obj-score score-meeting';
            scoreCell.style.color = 'var(--primary-light)';
        } else if (standardStatus === "below") {
            scoreCell.className = 'obj-score score-below';
            scoreCell.style.color = 'var(--danger-color)';
        } else {
            // If no standard status, use the old coloring based on score value
            scoreCell.className = 'obj-score';
            if (score === "P3" || score === "P2") {
                scoreCell.classList.add('status-good');
            } else if (score === "P1" || score === "Kb") {
                scoreCell.classList.add('status-warning');
            } else if (score === "Ka") {
                scoreCell.classList.add('status-danger');
            }
        }
    } else {
        scoreCell.textContent = "Pending";
        scoreCell.className = 'obj-score';
        scoreCell.style.color = '#757575'; // Gray for pending
    }
}

/**
 * SOB Chart - Enhanced with standards assessment and color-coded scores
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
            <th>Standard</th>
            <th>Comments</th>
        `;
        thead.appendChild(headerRow);
        
        const tbody = document.createElement('tbody');
        
        table.appendChild(thead);
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        
        // Add a summary section above the table
        const summaryContainer = document.createElement('div');
        summaryContainer.className = 'standards-summary';
        summaryContainer.id = 'sob-standards-summary';
        summaryContainer.innerHTML = `
            <h4>Standards Achievement Summary</h4>
            <div class="standards-progress">
                <div class="standards-progress-segment segment-exceeding" id="sob-exceeding" style="width: 0%;">0%</div>
                <div class="standards-progress-segment segment-meeting" id="sob-meeting" style="width: 0%;">0%</div>
                <div class="standards-progress-segment segment-below" id="sob-below" style="width: 0%;">0%</div>
            </div>
            <div class="standards-stats">
                <div class="stat-item stat-exceeding" id="stat-exceeding">
                    Exceeding Standards: 0 (0%)
                </div>
                <div class="stat-item stat-meeting" id="stat-meeting">
                    Meeting Standards: 0 (0%)
                </div>
                <div class="stat-item stat-below" id="stat-below">
                    Below Standards: 0 (0%)
                </div>
                <div class="stat-item stat-not-evaluated" id="stat-not-evaluated">
                    Not Evaluated: 0
                </div>
            </div>
        `;
        
        sobSection.innerHTML = '';
        sobSection.innerHTML = '<h3>SOB Performance</h3>';
        sobSection.appendChild(summaryContainer);
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

    // Get user SOB scores, comments, and standards assessment (if available)
    const userSOBScores = userData?.sobScores || {};
    const userSOBComments = userData?.sobComments || {};
    const userSOBStandards = userData?.sobStandards || {};
    const standardsAchievement = userData?.sobStandardsAchievement || null;

    // Update the standards summary if we have data
    updateStandardsSummary(standardsAchievement);

    // Group objectives by category
    const categories = {};
    objectives.forEach(obj => {
        if (!categories[obj.category]) {
            categories[obj.category] = [];
        }
        categories[obj.category].push(obj);
    });

    // Get the expected standard column based on cadet's AS year
    const asYear = userData?.asYear || "";
    const columnMapping = {
        "100": "bc",
        "200": "bcl",
        "300": "icl",
        "400": "scl"
    };
    const standardColumn = columnMapping[asYear] || "";

    // Iterate through categories and create sections
    Object.keys(categories).forEach(category => {
        // Create a category header row
        const categoryRow = document.createElement("tr");
        const categoryCell = document.createElement("td");
        categoryCell.textContent = category;
        categoryCell.colSpan = 5; // Span across all columns
        categoryCell.className = 'category-header';
        categoryRow.appendChild(categoryCell);
        tbody.appendChild(categoryRow);

        // Add objectives under the category
        categories[category].forEach(obj => {
            const row = document.createElement("tr");

            // Get standard assessment data
            const objectiveNum = obj.objective_number;
            const standardData = userSOBStandards[objectiveNum] || {};
            const standardStatus = standardData.status || "";
            
            // Add class to row based on standard status
            if (standardStatus === "exceeding") {
                row.classList.add("exceeds-standard");
            } else if (standardStatus === "meeting") {
                row.classList.add("meets-standard");
            } else if (standardStatus === "below") {
                row.classList.add("below-standard");
            }

            const objectiveNumberCell = document.createElement("td");
            objectiveNumberCell.textContent = objectiveNum;
            row.appendChild(objectiveNumberCell);

            const descriptionCell = document.createElement("td");
            descriptionCell.textContent = obj.description;
            row.appendChild(descriptionCell);

            const scoreCell = document.createElement("td");
            scoreCell.className = "obj-score";
            
            // Use user's score if available, otherwise "Pending"
            const score = userSOBScores[objectiveNum];
            updateScoreCell(scoreCell, score, standardStatus);
            
            row.appendChild(scoreCell);

            // Add standard cell
            const standardCell = document.createElement("td");
            standardCell.style.textAlign = "center";
            
            // Get the expected standard for this objective at the cadet's level
            const expectedStandard = obj[standardColumn];
            
            if (expectedStandard) {
                standardCell.textContent = expectedStandard;
                standardCell.style.fontWeight = "bold";
                
                // Add a badge to show the standard status
                if (standardStatus) {
                    const badge = document.createElement("span");
                    badge.className = "standard-badge";
                    
                    if (standardStatus === "exceeding") {
                        badge.textContent = "Exceeds";
                        badge.classList.add("exceeding");
                    } else if (standardStatus === "meeting") {
                        badge.textContent = "Meets";
                        badge.classList.add("meeting");
                    } else if (standardStatus === "below") {
                        badge.textContent = "Below";
                        badge.classList.add("below");
                    }
                    
                    standardCell.appendChild(badge);
                }
            } else {
                standardCell.textContent = "N/A";
                standardCell.style.color = '#757575';
            }
            row.appendChild(standardCell);

            // Add comments cell
            const commentCell = document.createElement("td");
            const comment = userSOBComments[objectiveNum];
            if (comment) {
                commentCell.textContent = comment;
            } else {
                commentCell.textContent = "No comments";
                commentCell.style.color = '#757575';
                commentCell.style.fontStyle = 'italic';
            }
            row.appendChild(commentCell);

            tbody.appendChild(row);
        });
    });

    console.log("Enhanced SOB table with color-coded scores rendered successfully!");
}

/**
 * Update the standards summary section with achievement data
 */
function updateStandardsSummary(standardsAchievement) {
    const summaryContainer = document.getElementById('sob-standards-summary');
    if (!summaryContainer) return;
    
    // If no achievement data, hide the summary
    if (!standardsAchievement) {
        summaryContainer.style.display = 'none';
        return;
    }
    
    summaryContainer.style.display = 'block';
    
    // Extract data
    const { 
        meetingCount = 0,
        exceedingCount = 0, 
        belowCount = 0,
        notEvaluatedCount = 0,
        meetingPercent = 0,
        exceedingPercent = 0,
        belowPercent = 0,
        totalApplicable = 0,
        evaluatedCount = 0
    } = standardsAchievement;
    
    // Update the progress bar segments
    document.getElementById('sob-exceeding').style.width = `${exceedingPercent}%`;
    document.getElementById('sob-exceeding').textContent = `${exceedingPercent}%`;
    
    document.getElementById('sob-meeting').style.width = `${meetingPercent}%`;
    document.getElementById('sob-meeting').textContent = `${meetingPercent}%`;
    
    document.getElementById('sob-below').style.width = `${belowPercent}%`;
    document.getElementById('sob-below').textContent = `${belowPercent}%`;
    
    // Update the statistics text
    document.getElementById('stat-exceeding').textContent = 
        `Exceeding Standards: ${exceedingCount} (${exceedingPercent}%)`;
    
    document.getElementById('stat-meeting').textContent = 
        `Meeting Standards: ${meetingCount} (${meetingPercent}%)`;
    
    document.getElementById('stat-below').textContent = 
        `Below Standards: ${belowCount} (${belowPercent}%)`;
    
    document.getElementById('stat-not-evaluated').textContent = 
        `Not Evaluated: ${notEvaluatedCount} of ${totalApplicable}`;
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