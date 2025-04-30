// Dashboard functionality - with SOB standards and PFA scores integration
import { collection, getDocs, doc, updateDoc, setDoc, serverTimestamp, query, where, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { db, auth } from "./auth.js";

let currentUserRole = null;
let selectedCadet = null;

document.addEventListener('DOMContentLoaded', function() {
  // Initialize dashboard components
  initArrowNavigation();
  initCharts();
  setupEventListeners();
  
  // Try to fetch data if user is authenticated
  document.addEventListener('user-authenticated', handleUserAuthenticated);
});

// Handle user authentication and role-based features
async function handleUserAuthenticated(event) {
  if (!event.detail || !event.detail.user) return;
  
  // Get current user's role
  try {
    const userRef = doc(db, "users", event.detail.user.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      currentUserRole = userData.role;
      
      // Show cadet selector for authorized roles
      if (['Cadre', 'Wing/CC', 'A3', 'A9'].includes(currentUserRole)) {
        initCadetSelector();
        document.getElementById('cadet-selector-container').classList.remove('hidden');
      }
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
  }
  
  // Fetch dashboard data
  fetchDashboardData();
}

// Initialize cadet selector for authorized roles
async function initCadetSelector() {
  try {
    // Create selector container if it doesn't exist
    if (!document.getElementById('cadet-selector-container')) {
      const filterContainer = document.querySelector('.filter-container');
      
      const selectorContainer = document.createElement('div');
      selectorContainer.id = 'cadet-selector-container';
      selectorContainer.className = 'cadet-selector-container hidden';
      selectorContainer.innerHTML = `
        <label for="cadet-selector">Select Cadet:</label>
        <select id="cadet-selector">
          <option value="all">All Cadets</option>
        </select>
        <button id="reset-cadet-selection" class="button-secondary">Reset</button>
      `;
      
      filterContainer.insertBefore(selectorContainer, filterContainer.firstChild);
      
      // Add event listeners for the selector
      document.getElementById('cadet-selector').addEventListener('change', handleCadetSelection);
      document.getElementById('reset-cadet-selection').addEventListener('click', resetCadetSelection);
    }
    
    // Fetch cadets for the dropdown
    await populateCadetSelector();
  } catch (error) {
    console.error("Error initializing cadet selector:", error);
    showMessage("Error loading cadet selection feature", "error");
  }
}

// Populate the cadet selector dropdown with cadets
async function populateCadetSelector() {
  try {
    const selector = document.getElementById('cadet-selector');
    if (!selector) return;
    
    // Clear existing options (except "All Cadets")
    while (selector.options.length > 1) {
      selector.remove(1);
    }
    
    // Query all cadets
    const cadetsRef = collection(db, "users");
    const q = query(cadetsRef, where("asYear", ">=", "100"), where("asYear", "<=", "400"));
    const querySnapshot = await getDocs(q);
    
    // Add cadets to the dropdown
    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (data.firstName && data.lastName) {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = `${data.lastName}, ${data.firstName} (AS${data.asYear})`;
        selector.appendChild(option);
      }
    });
    
    // Sort cadets alphabetically
    const options = Array.from(selector.options).slice(1);
    options.sort((a, b) => a.textContent.localeCompare(b.textContent));
    
    // Remove all options except "All Cadets"
    while (selector.options.length > 1) {
      selector.remove(1);
    }
    
    // Add sorted options back
    options.forEach(option => selector.appendChild(option));
    
  } catch (error) {
    console.error("Error populating cadet selector:", error);
  }
}

// Handle cadet selection change
function handleCadetSelection(event) {
  const cadetId = event.target.value;
  
  if (cadetId === 'all') {
    selectedCadet = null;
    document.getElementById('dashboard-title').textContent = 'Wing-Level Performance Metrics';
  } else {
    selectedCadet = cadetId;
    const selectedOption = event.target.options[event.target.selectedIndex];
    document.getElementById('dashboard-title').textContent = `Individual Performance: ${selectedOption.textContent}`;
  }
  
  // Refetch data for the selected cadet
  fetchDashboardData();
}

// Reset cadet selection
function resetCadetSelection() {
  const selector = document.getElementById('cadet-selector');
  if (selector) {
    selector.value = 'all';
    selectedCadet = null;
    document.getElementById('dashboard-title').textContent = 'Wing-Level Performance Metrics';
    fetchDashboardData();
  }
}

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
  if (index < 0) index = trendCards.length - 1; // Loop to the end
  if (index >= trendCards.length) index = 0;    // Loop to the beginning
  
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
  initEnhancedPFAChart();
  initPFAPassRateChart();
  initSOBChart();
  initSOBStandardsChart();
  initAttendanceChart();
  initForm2Chart();
  
  // Make sure all charts are properly visible
  setTimeout(() => {
    Object.values(chartInstances).forEach(chart => {
      chart.resize();
    });
  }, 100);
}

function initEnhancedPFAChart() {
  const ctx = document.getElementById('pfa-trend-chart').getContext('2d');
  
  // Create a more comprehensive PFA chart that shows component breakdown
  chartInstances['pfa-trend-chart'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['AS100', 'AS200', 'AS300', 'AS400'],
      datasets: [
        {
          label: 'Push-ups',
          data: generateRandomData(4, 35, 15), // Points range 15-50
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          stack: 'Stack 0'
        },
        {
          label: 'Sit-ups',
          data: generateRandomData(4, 35, 15), // Points range 15-50
          backgroundColor: 'rgba(153, 102, 255, 0.7)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
          stack: 'Stack 0'
        },
        {
          label: '1.5 Mile Run',
          data: generateRandomData(4, 35, 15), // Points range 15-50
          backgroundColor: 'rgba(255, 159, 64, 0.7)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1,
          stack: 'Stack 0'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Cadet Class'
          }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: {
            display: true,
            text: 'Average Points'
          },
          max: 100
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'PFA Component Scores by Class',
          font: {
            size: 16
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y + ' points';
              }
              return label;
            },
            footer: function(tooltipItems) {
              // Calculate total for this cadet class
              const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
              return `Total: ${total} points`;
            }
          }
        }
      }
    }
  });
}

// Add PFA pass/fail breakdown chart
function initPFAPassRateChart() {
  const ctx = document.getElementById('pfa-pass-chart').getContext('2d');
  
  // Get random passing percentages
  const passingRates = generateRandomData(4, 30, 70); // Range 70-100%
  
  chartInstances['pfa-pass-chart'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['AS100', 'AS200', 'AS300', 'AS400'],
      datasets: [
        {
          label: 'Pass Rate',
          data: passingRates,
          backgroundColor: passingRates.map(rate => 
            rate >= 90 ? 'rgba(76, 175, 80, 0.7)' :  // Green for ≥90%
            rate >= 80 ? 'rgba(255, 193, 7, 0.7)' :  // Yellow for ≥80%
            'rgba(255, 87, 34, 0.7)'                 // Orange for <80%
          ),
          borderColor: passingRates.map(rate => 
            rate >= 90 ? 'rgba(76, 175, 80, 1)' :
            rate >= 80 ? 'rgba(255, 193, 7, 1)' :
            'rgba(255, 87, 34, 1)'
          ),
          borderWidth: 1
        }
      ]
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
            text: 'Pass Rate (%)'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'PFA Pass Rate by Class',
          font: {
            size: 14
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
      datasets: [
        {
          label: 'Exceeding Standards',
          data: generateRandomData(5, 50, 30),
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 1,
          stack: 'Stack 0'
        },
        {
          label: 'Meeting Standards',
          data: generateRandomData(5, 40, 20),
          backgroundColor: 'rgba(0, 127, 255, 0.7)',
          borderColor: 'rgba(0, 127, 255, 1)',
          borderWidth: 1,
          stack: 'Stack 0'
        },
        {
          label: 'Below Standards',
          data: generateRandomData(5, 30, 5),
          backgroundColor: 'rgba(244, 67, 54, 0.7)',
          borderColor: 'rgba(244, 67, 54, 1)',
          borderWidth: 1,
          stack: 'Stack 0'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Competency Area'
          }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: {
            display: true,
            text: 'Percentage of Cadets'
          },
          max: 100
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'SOB Standards Achievement by Competency Area',
          font: {
            size: 14
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y + '%';
              }
              return label;
            }
          }
        }
      }
    }
  });
}

function initSOBStandardsChart() {
  const ctx = document.getElementById('sob-standards-chart').getContext('2d');
  
  // Create a stacked bar chart showing standards assessment breakdown
  chartInstances['sob-standards-chart'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['AS100', 'AS200', 'AS300', 'AS400'],
      datasets: [
        {
          label: 'Exceeding Standards',
          data: generateRandomData(4, 50, 30),
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 1,
          stack: 'Stack 0'
        },
        {
          label: 'Meeting Standards',
          data: generateRandomData(4, 40, 20),
          backgroundColor: 'rgba(0, 127, 255, 0.7)',
          borderColor: 'rgba(0, 127, 255, 1)',
          borderWidth: 1,
          stack: 'Stack 0'
        },
        {
          label: 'Below Standards',
          data: generateRandomData(4, 30, 5),
          backgroundColor: 'rgba(244, 67, 54, 0.7)',
          borderColor: 'rgba(244, 67, 54, 1)',
          borderWidth: 1,
          stack: 'Stack 0'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Cadet Class'
          }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: {
            display: true,
            text: 'Percentage of Cadets'
          },
          max: 100
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Standards of Behavior - Standards Achievement by Class',
          font: {
            size: 16
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y + '%';
              }
              return label;
            }
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
        data: generateRandomData(6, 80, 20),
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

// ===== DATA HANDLING FROM FIRESTORE =====

// Add the missing SOB, attendance, and Form 2 data fetching functions
async function fetchSOBData(timePeriod) {
  try {
    // Convert time period to a date
    const startDate = getStartDateFromTimePeriod(timePeriod);
    
    if (selectedCadet) {
      // Fetch individual cadet SOB data
      const cadetRef = doc(db, "users", selectedCadet);
      const cadetSnap = await getDoc(cadetRef);
      
      if (cadetSnap.exists()) {
        const cadetData = cadetSnap.data();
        const sobScores = cadetData.sobScores || {};
        
        // Group SOB scores by competency area
        const competencyScores = {
          'Leadership': [],
          'Teamwork': [],
          'Communication': [],
          'Problem-Solving': [],
          'Technical': []
        };
        
        // Process SOB scores
        Object.values(sobScores).forEach(sob => {
          if (sob.area && sob.rating && sob.submittedAt && 
              new Date(sob.submittedAt.toDate()) >= startDate) {
            if (competencyScores[sob.area]) {
              competencyScores[sob.area].push(sob.rating);
            }
          }
        });
        
        // Calculate ratings distribution for each area
        const competencyData = {
          exceeding: [],
          meeting: [],
          below: []
        };
        
        Object.keys(competencyScores).forEach((area, index) => {
          const scores = competencyScores[area];
          const total = scores.length;
          
          if (total > 0) {
            const exceeding = scores.filter(score => score === 'Exceeding').length;
            const meeting = scores.filter(score => score === 'Meeting').length;
            const below = scores.filter(score => score === 'Below').length;
            
            competencyData.exceeding[index] = Math.round((exceeding / total) * 100);
            competencyData.meeting[index] = Math.round((meeting / total) * 100);
            competencyData.below[index] = Math.round((below / total) * 100);
          } else {
            competencyData.exceeding[index] = 0;
            competencyData.meeting[index] = 0;
            competencyData.below[index] = 0;
          }
        });
        
        // Update SOB chart
        const sobChart = chartInstances['sob-trend-chart'];
        sobChart.data.datasets[0].data = competencyData.exceeding;
        sobChart.data.datasets[1].data = competencyData.meeting;
        sobChart.data.datasets[2].data = competencyData.below;
        sobChart.options.plugins.title.text = 'SOB Ratings by Competency Area';
        sobChart.update();
        
        return { cadetSOBData: competencyData };
      }
    } else {
      // Fetch aggregate SOB data for wing-level view
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);
      
      // Group cadets by AS year
      const cadetsByYear = {
        "AS100": [],
        "AS200": [],
        "AS300": [],
        "AS400": []
      };
      
      // Process the query results
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.asYear && data.sobScores) {
          const yearKey = `AS${data.asYear}`;
          if (cadetsByYear[yearKey]) {
            cadetsByYear[yearKey].push(data);
          }
        }
      });
      
      // Calculate SOB standards breakdown by class
      const sobStandards = {
        exceeding: [],
        meeting: [],
        below: []
      };
      
      Object.keys(cadetsByYear).forEach((yearKey, index) => {
        const cadets = cadetsByYear[yearKey];
        
        if (cadets.length > 0) {
          let exceedingCount = 0;
          let meetingCount = 0;
          let belowCount = 0;
          let totalRatings = 0;
          
          cadets.forEach(cadet => {
            const sobScores = cadet.sobScores || {};
            
            Object.values(sobScores).forEach(sob => {
              if (sob.rating && sob.submittedAt && 
                  new Date(sob.submittedAt.toDate()) >= startDate) {
                totalRatings++;
                
                if (sob.rating === 'Exceeding') {
                  exceedingCount++;
                } else if (sob.rating === 'Meeting') {
                  meetingCount++;
                } else if (sob.rating === 'Below') {
                  belowCount++;
                }
              }
            });
          });
          
          if (totalRatings > 0) {
            sobStandards.exceeding[index] = Math.round((exceedingCount / totalRatings) * 100);
            sobStandards.meeting[index] = Math.round((meetingCount / totalRatings) * 100);
            sobStandards.below[index] = Math.round((belowCount / totalRatings) * 100);
          } else {
            sobStandards.exceeding[index] = 0;
            sobStandards.meeting[index] = 0;
            sobStandards.below[index] = 0;
          }
        } else {
          sobStandards.exceeding[index] = 0;
          sobStandards.meeting[index] = 0;
          sobStandards.below[index] = 0;
        }
      });
      
      // Update SOB standards chart
      const sobStandardsChart = chartInstances['sob-standards-chart'];
      sobStandardsChart.data.datasets[0].data = sobStandards.exceeding;
      sobStandardsChart.data.datasets[1].data = sobStandards.meeting;
      sobStandardsChart.data.datasets[2].data = sobStandards.below;
      sobStandardsChart.update();
      
      return { sobStandards };
    }
  } catch (error) {
    console.error("Error fetching SOB data:", error);
    throw error;
  }
}

async function fetchAttendanceData(timePeriod) {
  try {
    // Convert time period to a date
    const startDate = getStartDateFromTimePeriod(timePeriod);
    
    if (selectedCadet) {
      // Fetch individual cadet attendance data
      const attendanceRef = collection(db, "attendance");
      const q = query(
        attendanceRef, 
        where("cadetId", "==", selectedCadet),
        where("date", ">=", startDate)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Process attendance records
      const attendanceByMonth = {};
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.date && data.status) {
          const date = data.date.toDate();
          const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          
          if (!attendanceByMonth[monthKey]) {
            attendanceByMonth[monthKey] = {
              present: 0,
              total: 0
            };
          }
          
          attendanceByMonth[monthKey].total++;
          if (data.status === 'Present') {
            attendanceByMonth[monthKey].present++;
          }
        }
      });
      
      // Calculate attendance percentages
      const labels = [];
      const percentages = [];
      
      Object.keys(attendanceByMonth).sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA - dateB;
      }).forEach(month => {
        const data = attendanceByMonth[month];
        labels.push(month);
        percentages.push(data.total > 0 ? Math.round((data.present / data.total) * 100) : 0);
      });
      
      // Update attendance chart
      const attendanceChart = chartInstances['attendance-trend-chart'];
      attendanceChart.data.labels = labels;
      attendanceChart.data.datasets[0].data = percentages;
      attendanceChart.update();
      
      return { cadetAttendance: attendanceByMonth };
    } else {
      // Fetch aggregate attendance data
      const attendanceRef = collection(db, "attendance");
      const q = query(attendanceRef, where("date", ">=", startDate));
      const querySnapshot = await getDocs(q);
      
      // Group attendance by month
      const attendanceByMonth = {};
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.date && data.status) {
          const date = data.date.toDate();
          const monthKey = date.toLocaleDateString('en-US', { month: 'long' });
          
          if (!attendanceByMonth[monthKey]) {
            attendanceByMonth[monthKey] = {
              present: 0,
              total: 0
            };
          }
          
          attendanceByMonth[monthKey].total++;
          if (data.status === 'Present') {
            attendanceByMonth[monthKey].present++;
          }
        }
      });
      
      // Calculate attendance percentages
      const labels = ['January', 'February', 'March', 'April', 'May', 'June'];
      const percentages = [];
      
      labels.forEach(month => {
        const data = attendanceByMonth[month] || { present: 0, total: 0 };
        percentages.push(data.total > 0 ? Math.round((data.present / data.total) * 100) : 0);
      });
      
      // Update attendance chart
      const attendanceChart = chartInstances['attendance-trend-chart'];
      attendanceChart.data.labels = labels;
      attendanceChart.data.datasets[0].data = percentages;
      attendanceChart.update();
      
      // Update form2 completion card
      const totalLate = percentages.filter(p => p < 80).length;
      const latePercentage = Math.round((totalLate / percentages.length) * 100);
      
      document.querySelector('#form2-completion p').textContent = `${100 - latePercentage}%`;
      
      return { attendanceByMonth };
    }
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    throw error;
  }
}

async function fetchForm2Data(timePeriod) {
  try {
    // Convert time period to a date
    const startDate = getStartDateFromTimePeriod(timePeriod);
    
    if (selectedCadet) {
      // Fetch individual cadet Form 2 data
      const form2Ref = collection(db, "form2");
      const q = query(
        form2Ref,
        where("cadetId", "==", selectedCadet),
        where("submissionDate", ">=", startDate)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Calculate Form 2 submission status
      let onTime = 0;
      let late = 0;
      let notSubmitted = 0;
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'On Time') {
          onTime++;
        } else if (data.status === 'Late') {
          late++;
        } else if (data.status === 'Not Submitted') {
          notSubmitted++;
        }
      });
      
      // Update Form 2 chart
      const form2Chart = chartInstances['form2-trend-chart'];
      form2Chart.data.datasets[0].data = [onTime, late, notSubmitted];
      form2Chart.update();
      
      // Update Form 2 completion card
      const totalForms = onTime + late + notSubmitted;
      const completionRate = totalForms > 0 ? Math.round(((onTime + late) / totalForms) * 100) : 0;
      
      document.querySelector('#form2-completion p').textContent = `${completionRate}%`;
      
      return { cadetForm2: { onTime, late, notSubmitted } };
    } else {
      // Fetch aggregate Form 2 data
      const form2Ref = collection(db, "form2");
      const q = query(form2Ref, where("submissionDate", ">=", startDate));
      const querySnapshot = await getDocs(q);
      
      // Calculate Form 2 submission status
      let onTime = 0;
      let late = 0;
      let notSubmitted = 0;
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'On Time') {
          onTime++;
        } else if (data.status === 'Late') {
          late++;
        } else if (data.status === 'Not Submitted') {
          notSubmitted++;
        }
      });
      
      // Update Form 2 chart
      const form2Chart = chartInstances['form2-trend-chart'];
      form2Chart.data.datasets[0].data = [onTime, late, notSubmitted];
      form2Chart.update();
      
      // Update Form 2 completion card
      const totalForms = onTime + late + notSubmitted;
      const completionRate = totalForms > 0 ? Math.round(((onTime + late) / totalForms) * 100) : 0;
      
      document.querySelector('#form2-completion p').textContent = `${completionRate}%`;
      
      return { form2Stats: { onTime, late, notSubmitted } };
    }
  } catch (error) {
    console.error("Error fetching Form 2 data:", error);
    throw error;
  }
}

// Add missing helper functions
function generateRandomData(length, maxVariance, base) {
  return Array.from({ length }, () => Math.floor(Math.random() * maxVariance) + base);
}

function getStartDateFromTimePeriod(period) {
  const now = new Date();
  let startDate = new Date();
  
  switch(period) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      // Default to 1 month
      startDate.setMonth(now.getMonth() - 1);
  }
  
  return startDate;
}

function setLoadingState(isLoading) {
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    if (isLoading) {
      loadingOverlay.classList.remove('hidden');
    } else {
      loadingOverlay.classList.add('hidden');
    }
  }
  
  // Also update loading spinners in each chart container
  const chartContainers = document.querySelectorAll('.chart-container');
  chartContainers.forEach(container => {
    const spinner = container.querySelector('.loading-spinner');
    if (spinner) {
      if (isLoading) {
        spinner.classList.remove('hidden');
      } else {
        spinner.classList.add('hidden');
      }
    }
  });
}

function showMessage(message, type = 'info') {
  const messageContainer = document.getElementById('message-container');
  if (!messageContainer) return;
  
  const messageElement = document.createElement('div');
  messageElement.className = `message ${type}`;
  messageElement.textContent = message;
  
  messageContainer.appendChild(messageElement);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    messageElement.classList.add('fade-out');
    setTimeout(() => {
      messageContainer.removeChild(messageElement);
    }, 500);
  }, 5000);
}

function setupEventListeners() {
  // Handle time period change
  const timePeriodSelect = document.getElementById('time-period');
  if (timePeriodSelect) {
    timePeriodSelect.addEventListener('change', () => {
      fetchDashboardData();
    });
  }
  
  // Add export functionality
  const exportButton = document.getElementById('export-dashboard');
  if (exportButton) {
    exportButton.addEventListener('click', exportDashboardData);
  }
}

// Function to export dashboard data
function exportDashboardData() {
  try {
    // Get all chart data
    const chartData = {};
    
    Object.keys(chartInstances).forEach(chartId => {
      const chart = chartInstances[chartId];
      chartData[chartId] = {
        type: chart.config.type,
        labels: chart.data.labels,
        datasets: chart.data.datasets.map(dataset => ({
          label: dataset.label,
          data: dataset.data
        }))
      };
    });
    
    // Create data blob
    const dataStr = JSON.stringify(chartData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(dataBlob);
    downloadLink.download = `dashboard-export-${new Date().toISOString().slice(0, 10)}.json`;
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    showMessage('Dashboard data exported successfully.', 'success');
  } catch (error) {
    console.error('Error exporting dashboard data:', error);
    showMessage('Failed to export dashboard data.', 'error');
  }
}

function fetchDashboardData() {
  // Show loading indicators
  setLoadingState(true);
  
  // Get the selected time period
  const timePeriod = document.getElementById('time-period').value;
  
  // Fetch data from Firestore
  Promise.all([
    fetchCadetStats(),
    fetchPFAData(timePeriod),
    fetchSOBData(timePeriod),
    fetchAttendanceData(timePeriod),
    fetchForm2Data(timePeriod)
  ])
  .then(() => {
    setLoadingState(false);
  })
  .catch(error => {
    console.error("Error fetching dashboard data:", error);
    showMessage("Error loading dashboard data. Please try again.", "error");
    setLoadingState(false);
  });
}

// Fetch cadet statistics from Firestore
async function fetchCadetStats() {
  try {
    if (selectedCadet) {
      // Fetch individual cadet data
      const cadetRef = doc(db, "users", selectedCadet);
      const cadetSnap = await getDoc(cadetRef);
      
      if (cadetSnap.exists()) {
        const cadetData = cadetSnap.data();
        
        // Update the stat cards for individual view
        document.querySelector('#total-cadets h3').textContent = 'AS Year';
        document.querySelector('#total-cadets p').textContent = `AS${cadetData.asYear || 'N/A'}`;
        
        // Update PFA card if data exists
        if (cadetData.latestPFA && cadetData.latestPFA.totalScore) {
          document.querySelector('#avg-pfa p').textContent = `${cadetData.latestPFA.totalScore}`;
          
          // Set indicator based on pass/fail status
          const pfaIndicator = document.querySelector('#avg-pfa .standards-indicator');
          if (pfaIndicator) {
            const isPassing = cadetData.latestPFA.totalScore >= 75;
            pfaIndicator.textContent = isPassing ? 'Passing' : 'Not Passing';
            pfaIndicator.className = 'standards-indicator';
            pfaIndicator.classList.add(isPassing ? 'status-good' : 'status-danger');
          }
        } else {
          document.querySelector('#avg-pfa p').textContent = 'N/A';
        }
        
        // Update SOB card
        const sobCount = cadetData.sobScores ? Object.keys(cadetData.sobScores).length : 0;
        document.querySelector('#active-sobs h3').textContent = 'Active SOBs';
        document.querySelector('#active-sobs p').textContent = sobCount;
        
        // Update Form 2 completion
        document.querySelector('#form2-completion h3').textContent = 'Form 2 Status';
        document.querySelector('#form2-completion p').textContent = cadetData.form2Status || 'Unknown';
      }
      
      return { cadetData: cadetSnap.data() };
    } else {
      // Restore original stat card titles
      document.querySelector('#total-cadets h3').textContent = 'Total Cadets';
      document.querySelector('#avg-pfa h3').textContent = 'Average PFA Score';
      document.querySelector('#active-sobs h3').textContent = 'Active SOBs';
      document.querySelector('#form2-completion h3').textContent = 'Form 2 Completion';
      
      // Fetch aggregate cadet stats for wing-level view
      const cadetsRef = collection(db, "users");
      const querySnapshot = await getDocs(cadetsRef);
      
      // Get total cadet count
      const totalCadets = querySnapshot.docs
        .filter(doc => {
          const data = doc.data();
          const asYearNum = parseInt(data.asYear);
          return data.asYear && !isNaN(asYearNum) && asYearNum >= 100 && asYearNum <= 400;
        }).length;
      
      // Update the total cadets stat card
      document.querySelector('#total-cadets p').textContent = totalCadets;
      
      // Count active SOBs
      const activeSOBs = querySnapshot.docs
        .filter(doc => {
          const data = doc.data();
          return data.sobScores && Object.keys(data.sobScores).length > 0;
        }).length;
      
      // Update active SOBs stat card
      document.querySelector('#active-sobs p').textContent = activeSOBs;
      
      return { totalCadets, activeSOBs };
    }
  } catch (error) {
    console.error("Error fetching cadet stats:", error);
    throw error;
  }
}

// Fetch PFA data from Firestore
async function fetchPFAData(timePeriod) {
  try {
    // Convert time period to a date
    const startDate = getStartDateFromTimePeriod(timePeriod);
    
    if (selectedCadet) {
      // Fetch individual cadet PFA data
      const cadetRef = doc(db, "users", selectedCadet);
      const cadetSnap = await getDoc(cadetRef);
      
      if (cadetSnap.exists()) {
        const cadetData = cadetSnap.data();
        const pfaData = cadetData.pfaHistory || [];
        
        // Filter PFA records by date
        const filteredPFA = pfaData.filter(pfa => 
          pfa.submittedAt && new Date(pfa.submittedAt.toDate()) >= startDate
        );
        
        // Sort by date
        filteredPFA.sort((a, b) => {
          if (!a.submittedAt || !b.submittedAt) return 0;
          return a.submittedAt.toDate() - b.submittedAt.toDate();
        });
        
        // Get labels for the time series (dates)
        const labels = filteredPFA.map(pfa => {
          if (!pfa.submittedAt) return 'Unknown';
          const date = pfa.submittedAt.toDate();
          return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        });
        
        // Prepare chart data for components
        const pushupData = filteredPFA.map(pfa => pfa.pushups?.points || 0);
        const situpData = filteredPFA.map(pfa => pfa.situps?.points || 0);
        const runData = filteredPFA.map(pfa => pfa.run?.points || 0);
        
        // Update PFA component chart for individual view
        const pfaChart = chartInstances['pfa-trend-chart'];
        pfaChart.data.labels = labels;
        pfaChart.data.datasets[0].data = pushupData;
        pfaChart.data.datasets[1].data = situpData;
        pfaChart.data.datasets[2].data = runData;
        pfaChart.options.plugins.title.text = 'PFA Component Scores Over Time';
        pfaChart.options.scales.x.title.text = 'Test Date';
        pfaChart.update();
        
        // Update PFA pass chart for individual view
        const pfaPassChart = chartInstances['pfa-pass-chart'];
        const totalScores = filteredPFA.map(pfa => pfa.totalScore || 0);
        const passStatus = totalScores.map(score => score >= 75 ? 100 : 0);
        
        pfaPassChart.data.labels = labels;
        pfaPassChart.data.datasets[0].data = totalScores;
        pfaPassChart.data.datasets[0].label = 'Total Score';
        pfaPassChart.options.plugins.title.text = 'PFA Scores Over Time';
        pfaPassChart.update();
        
        // Calculate and display average PFA score
        const avgScore = totalScores.length > 0 
          ? Math.round(totalScores.reduce((sum, score) => sum + score, 0) / totalScores.length) 
          : 0;
        
        document.querySelector('#avg-pfa p').textContent = `${avgScore}`;
        
        return { cadetPfaData: filteredPFA };
      }
    } else {
      // Fetch aggregate PFA data for wing-level view
      const cadetsRef = collection(db, "users");
      const q = query(cadetsRef, where("latestPFA.submittedAt", ">=", startDate));
      const querySnapshot = await getDocs(q);
      
      // Group cadets by AS year
      const cadetsByYear = {
        "AS100": [],
        "AS200": [],
        "AS300": [],
        "AS400": []
      };
      
      // Process the query results
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const asYear = data.asYear;
        
        if (asYear) {
          const yearKey = `AS${asYear}`;
          if (cadetsByYear[yearKey] && data.latestPFA) {
            cadetsByYear[yearKey].push(data.latestPFA);
          }
        }
      });
      
      // Calculate average scores by component and class
      const pfaComponentScores = {
        pushups: [],
        situps: [],
        run: []
      };
      
      // Calculate pass rates by class
      const pfaPassRates = [];
      
      Object.keys(cadetsByYear).forEach((yearKey, index) => {
        const cadets = cadetsByYear[yearKey];
        
        if (cadets.length > 0) {
          // Calculate component averages
          let totalPushupPoints = 0;
          let totalSitupPoints = 0;
          let totalRunPoints = 0;
          let passCount = 0;
          
          cadets.forEach(pfa => {
            totalPushupPoints += pfa.pushups?.points || 0;
            totalSitupPoints += pfa.situps?.points || 0;
            totalRunPoints += pfa.run?.points || 0;
            
            // Count passing scores (75 or higher)
            if (pfa.totalScore >= 75) {
              passCount++;
            }
          });
          
          // Calculate averages
          pfaComponentScores.pushups[index] = Math.round(totalPushupPoints / cadets.length);
          pfaComponentScores.situps[index] = Math.round(totalSitupPoints / cadets.length);
          pfaComponentScores.run[index] = Math.round(totalRunPoints / cadets.length);
          
          // Calculate pass rate
          pfaPassRates[index] = Math.round((passCount / cadets.length) * 100);
        } else {
          // No data for this class
          pfaComponentScores.pushups[index] = 0;
          pfaComponentScores.situps[index] = 0;
          pfaComponentScores.run[index] = 0;
          pfaPassRates[index] = 0;
        }
      });
      
      // Calculate overall average PFA score
      let totalScore = 0;
      let totalCadets = 0;
      
      Object.values(cadetsByYear).forEach(cadets => {
        cadets.forEach(pfa => {
          totalScore += pfa.totalScore || 0;
          totalCadets++;
        });
      });
      
      const avgPFAScore = totalCadets > 0 ? Math.round(totalScore / totalCadets) : 0;
      
      // Calculate overall pass rate
      let totalPasses = 0;
      
      Object.values(cadetsByYear).forEach(cadets => {
        cadets.forEach(pfa => {
          if (pfa.totalScore >= 75) {
            totalPasses++;
          }
        });
      });
      
      const overallPassRate = totalCadets > 0 ? Math.round((totalPasses / totalCadets) * 100) : 0;
      
      // Update PFA stats card
      document.querySelector('#avg-pfa p').textContent = `${avgPFAScore}%`;
      
      // Update PFA pass rate indicator
      const pfaIndicator = document.querySelector('#avg-pfa .standards-indicator');
      if (pfaIndicator) {
        pfaIndicator.textContent = `${overallPassRate}% Pass Rate`;
        
        // Set class based on percentage
        pfaIndicator.className = 'standards-indicator';
        if (overallPassRate >= 90) {
          pfaIndicator.classList.add('status-good');
        } else if (overallPassRate >= 80) {
          pfaIndicator.classList.add('status-warning');
        } else {
          pfaIndicator.classList.add('status-danger');
        }
      }
      
      // Update PFA component chart
      const pfaChart = chartInstances['pfa-trend-chart'];
      pfaChart.data.datasets[0].data = pfaComponentScores.pushups;
      pfaChart.data.datasets[1].data = pfaComponentScores.situps;
      pfaChart.data.datasets[2].data = pfaComponentScores.run;
      pfaChart.options.plugins.title.text = 'PFA Component Scores by Class';
      pfaChart.options.scales.x.title.text = 'Cadet Class';
      pfaChart.update();
      
      // Update PFA pass rate chart
      const pfaPassChart = chartInstances['pfa-pass-chart'];
      pfaPassChart.data.datasets[0].data = pfaPassRates;
      pfaPassChart.data.datasets[0].backgroundColor = pfaPassRates.map(rate => 
        rate >= 90 ? 'rgba(76, 175, 80, 0.7)' :  // Green for ≥90%
        rate >= 80 ? 'rgba(255, 193, 7, 0.7)' :  // Yellow for ≥80%
        'rgba(255, 87, 34, 0.7)'                 // Orange for <80%
      );
      pfaPassChart.data.datasets[0].borderColor = pfaPassRates.map(rate => 
        rate >= 90 ? 'rgba(76, 175, 80, 1)' :
        rate >= 80 ? 'rgba(255, 193, 7, 1)' :
        'rgba(255, 87, 34, 1)'
      );
      pfaPassChart.data.datasets[0].label = 'Pass Rate';
      pfaPassChart.update();
      
      return { pfaComponentScores, pfaPassRates, avgPFAScore, overallPassRate };
    }
  } catch (error) {
    console.error("Error fetching PFA data:", error);
    throw error;
  }
}