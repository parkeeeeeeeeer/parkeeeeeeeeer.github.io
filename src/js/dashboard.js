// Dashboard functionality - simplified with arrow navigation

document.addEventListener('DOMContentLoaded', function() {
  // Initialize dashboard components
  initArrowNavigation();
  initCharts();
  setupEventListeners();
  
  // Try to fetch data if user is authenticated
  document.addEventListener('user-authenticated', fetchDashboardData);
});

// ===== ARROW NAVIGATION FUNCTIONALITY =====

let currentCardIndex = 0;
let trendCards = [];

function initArrowNavigation() {
  trendCards = document.querySelectorAll('.trend-card');
  if (trendCards.length === 0) return;
  
  // Add navigation arrows
  const navArrows = document.createElement('div');
  navArrows.className = 'nav-arrows';
  navArrows.innerHTML = `
    <div class="arrow prev">←</div>
    <div class="arrow next">→</div>
  `;
  
  // Add navigation indicator dots
  const navIndicator = document.createElement('div');
  navIndicator.className = 'nav-indicator';
  
  const trendsContainer = document.querySelector('.overall-trends-dashboard');
  trendsContainer.appendChild(navArrows);
  trendsContainer.appendChild(navIndicator);
  
  // Create indicator dots
  trendCards.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = 'indicator-dot';
    if (index === 0) dot.classList.add('active');
    dot.setAttribute('data-index', index);
    navIndicator.appendChild(dot);
    
    // Add click event to navigate to the corresponding card
    dot.addEventListener('click', () => {
      navigateToCard(index);
    });
  });
  
  // Add click events to arrows
  const prevArrow = navArrows.querySelector('.prev');
  const nextArrow = navArrows.querySelector('.next');
  
  prevArrow.addEventListener('click', () => {
    navigateToCard(currentCardIndex - 1);
  });
  
  nextArrow.addEventListener('click', () => {
    navigateToCard(currentCardIndex + 1);
  });
  
  // Initialize first card as active
  trendCards[0].classList.add('active');
  
  // Add keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      navigateToCard(currentCardIndex + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      navigateToCard(currentCardIndex - 1);
    }
  });
}

function navigateToCard(index) {
  // Ensure index is within bounds
  if (index < 0) index = 0;
  if (index >= trendCards.length) index = trendCards.length - 1;
  
  // If already on this card, do nothing
  if (index === currentCardIndex) return;
  
  // Remove active class from current card
  trendCards[currentCardIndex].classList.remove('active');
  
  // Add active class to new card
  trendCards[index].classList.add('active');
  
  // Update current index
  currentCardIndex = index;
  
  // Update indicator dots
  const dots = document.querySelectorAll('.indicator-dot');
  dots.forEach((dot, i) => {
    if (i === index) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
  
  // Resize the active chart to ensure it renders properly
  const chartId = trendCards[index].querySelector('canvas').id;
  if (chartInstances[chartId]) {
    setTimeout(() => {
      chartInstances[chartId].resize();
    }, 10);
  }
}

// ===== CHART INITIALIZATION =====

let chartInstances = {};

function initCharts() {
  // Initialize charts with placeholder data
  initPFAChart();
  initSOBChart();
  initAttendanceChart();
  initForm2Chart();
  initCompetencyChart();
  
  // Make sure all charts are properly visible
  setTimeout(() => {
    Object.values(chartInstances).forEach(chart => {
      chart.resize();
    });
  }, 100);
}

function initPFAChart() {
  const ctx = document.getElementById('pfa-trend-chart').getContext('2d');
  chartInstances['pfa-trend-chart'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June'],
      datasets: [{
        label: 'Average PFA Score',
        data: generateRandomData(6, 100),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { 
          beginAtZero: true, 
          max: 100,
          title: {
            display: true,
            text: 'Score'
          }
        }
      }
    }
  });
}

function initSOBChart() {
  const ctx = document.getElementById('sob-trend-chart').getContext('2d');
  chartInstances['sob-trend-chart'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Leadership', 'Teamwork', 'Communication', 'Problem-Solving', 'Technical'],
      datasets: [{
        label: 'SOB Performance by Area',
        data: generateRandomData(5, 100),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { 
          beginAtZero: true, 
          max: 100,
          title: {
            display: true,
            text: 'Performance Score'
          }
        }
      }
    }
  });
}

function initAttendanceChart() {
  const ctx = document.getElementById('attendance-trend-chart').getContext('2d');
  chartInstances['attendance-trend-chart'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June'],
      datasets: [{
        label: 'Attendance Percentage',
        data: generateRandomData(6, 100),
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { 
          beginAtZero: true, 
          max: 100,
          title: {
            display: true,
            text: 'Attendance (%)'
          }
        }
      }
    }
  });
}

function initForm2Chart() {
  const ctx = document.getElementById('form2-trend-chart').getContext('2d');
  chartInstances['form2-trend-chart'] = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['On Time', 'Late', 'Not Submitted'],
      datasets: [{
        label: 'Form 2 Submissions',
        data: [65, 20, 15],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function initCompetencyChart() {
  const ctx = document.getElementById('competency-trend-chart').getContext('2d');
  chartInstances['competency-trend-chart'] = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Leadership', 'Teamwork', 'Communication', 'Problem-Solving', 'Technical Skills'],
      datasets: [
        {
          label: 'Initial Assessment',
          data: generateRandomData(5, 70),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(54, 162, 235, 1)'
        },
        {
          label: 'Current Assessment',
          data: generateRandomData(5, 100),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(255, 99, 132, 1)'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

// ===== DATA HANDLING =====

function fetchDashboardData(event) {
  // Show loading indicators
  setLoadingState(true);
  
  // Get the selected time period
  const timePeriod = document.getElementById('time-period').value;
  
  // Normally, we would connect to Firebase to fetch data
  // For now, simulate data fetch with timeout
  setTimeout(() => {
    fetchStatsData(timePeriod);
    fetchChartData(timePeriod);
    setLoadingState(false);
  }, 1000);
}

function fetchStatsData(timePeriod) {
  // Update stats with placeholder data for now
  document.querySelector('#total-cadets p').textContent = '100';
  document.querySelector('#avg-pfa p').textContent = '91.2%';
  document.querySelector('#active-sobs p').textContent = '94';
  document.querySelector('#form2-completion p').textContent = '87%';
}

function fetchChartData(timePeriod) {
  // Update charts with new random data to simulate a refresh
  updateChartsWithRandomData();
}

function updateChartsWithRandomData() {
  // Update PFA chart
  const pfaChart = chartInstances['pfa-trend-chart'];
  pfaChart.data.datasets[0].data = generateRandomData(6, 100);
  pfaChart.update();
  
  // Update SOB chart
  const sobChart = chartInstances['sob-trend-chart'];
  sobChart.data.datasets[0].data = generateRandomData(5, 100);
  sobChart.update();
  
  // Update Attendance chart
  const attendanceChart = chartInstances['attendance-trend-chart'];
  attendanceChart.data.datasets[0].data = generateRandomData(6, 100);
  attendanceChart.update();
  
  // Update Form 2 chart
  const form2Chart = chartInstances['form2-trend-chart'];
  form2Chart.data.datasets[0].data = [
    Math.floor(Math.random() * 70) + 30, // On Time (30-100)
    Math.floor(Math.random() * 30), // Late (0-30)
    Math.floor(Math.random() * 20) // Not Submitted (0-20)
  ];
  form2Chart.update();
  
  // Update Competency chart
  const competencyChart = chartInstances['competency-trend-chart'];
  const initialData = generateRandomData(5, 70);
  const currentData = initialData.map(val => 
    Math.min(100, val + Math.floor(Math.random() * 30))
  );
  
  competencyChart.data.datasets[0].data = initialData;
  competencyChart.data.datasets[1].data = currentData;
  competencyChart.update();
}

// ===== UTILITY FUNCTIONS =====

function setupEventListeners() {
  // Time period filter change
  const timePeriodSelect = document.getElementById('time-period');
  if (timePeriodSelect) {
    timePeriodSelect.addEventListener('change', () => {
      // Fetch new data based on selected time period
      fetchChartData(timePeriodSelect.value);
    });
  }
  
  // Handle window resize
  window.addEventListener('resize', handleResize);
}

function handleResize() {
  // Resize charts when window size changes
  Object.values(chartInstances).forEach(chart => {
    if (chart) chart.resize();
  });
}

function generateRandomData(length, max) {
  return Array.from({ length }, () => Math.floor(Math.random() * max) + 20);
}

function setLoadingState(isLoading) {
  const cards = document.querySelectorAll('.stat-card');
  
  cards.forEach(card => {
    // Check if loading indicator already exists
    let loadingEl = card.querySelector('.loading');
    
    if (isLoading) {
      if (!loadingEl) {
        loadingEl = document.createElement('div');
        loadingEl.className = 'loading';
        card.appendChild(loadingEl);
      }
    } else if (loadingEl) {
      loadingEl.remove();
    }
  });
}

function showMessage(message, type = 'info') {
  // Create toast element if it doesn't exist
  let toastEl = document.getElementById('toast-message');
  
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'toast-message';
    document.body.appendChild(toastEl);
  }
  
  // Set message content and style
  toastEl.textContent = message;
  toastEl.className = `toast ${type}`;
  
  // Show and then hide toast
  toastEl.classList.add('show');
  setTimeout(() => {
    toastEl.classList.remove('show');
  }, 3000);
}

