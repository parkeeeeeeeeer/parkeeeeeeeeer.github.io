import { doc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { auth, db } from './auth.js';

import Chart from "https://cdn.jsdelivr.net/npm/chart.js";

console.log('Auth:', auth);
console.log('Firestore DB:', db);
console.log('Chart.js version:', Chart.version);


async function fetchAndRenderCharts() {
    try {
        // Ensure user is logged in
        const user = auth.currentUser;
        if (!user) {
            console.error("User not logged in");
            return;
        }

        // Fetch and render PFA trends (example static data)
        renderPFATrendChart();

        // Fetch and render SOB trends from Firestore
        await fetchAndRenderSOBTrends(user.uid);
    } catch (error) {
        console.error("Error rendering charts:", error);
    }
}

function renderPFATrendChart() {
    const ctx = document.getElementById('pfa-trend-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Start', 'Midterm', 'End'],
            datasets: [{
                label: 'Average PFA Score',
                data: [85, 90, 93],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

async function fetchAndRenderSOBTrends(uid) {
    try {
        const docRef = doc(db, "SOB", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userSOBData = docSnap.data();
            const labels = userSOBData.performance.map(item => item.time_period);
            const competencyData = userSOBData.performance.map(item => item.competency);

            const ctx = document.getElementById('sob-trend-chart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'SOB Competency',
                        data: competencyData,
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 2,
                        fill: false
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        } else {
            console.error("No SOB data found");
        }
    } catch (error) {
        console.error("Error fetching SOB data:", error);
    }
}

// Real-time listener for SOB data updates
function listenToSOBUpdates(uid) {
    const docRef = doc(db, "SOB", uid);
    onSnapshot(docRef, (doc) => {
        const userSOBData = doc.data();
        if (userSOBData) {
            console.log("Real-time SOB update:", userSOBData);
            // You can re-render the chart here if needed
        }
    });
}

// Start the dashboard
document.addEventListener("DOMContentLoaded", fetchAndRenderCharts);
