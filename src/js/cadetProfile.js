import '/auth.js'
// Placeholder for rendering PFA chart
function renderPFAChart() {
    const pfaChart = document.getElementById('pfa-chart');
    // Use a chart library like Chart.js or D3.js to render performance
    pfaChart.innerHTML = '<p>PFA Chart Placeholder</p>';
}

// Placeholder for SOB chart
function renderSOBChart() {
    const sobChart = document.getElementById('sob-chart');
    // Use a chart library for displaying SOB progression
    sobChart.innerHTML = '<p>SOB Chart Placeholder</p>';
}

// // Initialize the charts on page load
// document.addEventListener('DOMContentLoaded', function () {
//     renderPFAChart();
//     renderSOBChart();
// });


// Function to toggle between sections
function showSection(section) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach((section) => section.classList.remove('active'));

    // Remove 'active' class from all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link) => link.classList.remove('active'));

    // Show the selected section
    document.getElementById(section).classList.add('active');

    // Add 'active' class to the clicked nav link
    event.target.classList.add('active');
}

// Initializing charts or other content on page load
document.addEventListener('DOMContentLoaded', function () {
    // For example: Load placeholder content for PFA and SOB charts
    document.getElementById('pfa-chart').innerHTML = 'PFA Chart Placeholder';
    document.getElementById('sob-chart').innerHTML = 'SOB Chart Placeholder';
});
