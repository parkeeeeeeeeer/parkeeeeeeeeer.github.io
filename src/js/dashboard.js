// Dashboard functionality - with SOB standards and PFA scores integration
import { collection, getDocs, doc, updateDoc, setDoc, serverTimestamp, query, where, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { db } from "./auth.js";
import { initCharts, chartInstances, fetchPFAData, fetchSOBData, fetchAttendanceData, fetchForm2Data } from "./dashboardCharts.js";

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
        await initCadetSelector();
        if (document.getElementById('cadet-selector-container')) {
          document.getElementById('cadet-selector-container').classList.remove('hidden');
        }
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
      if (!filterContainer) return;
      
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
    
    // Query all cadets with proper AS year filter
    const cadetsRef = collection(db, "users");
    const q = query(cadetsRef, where("asYear", ">=", "100"), where("asYear", "<=", "400"));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log("No cadets found with valid AS year");
      return;
    }
    
    // Create array to hold options for sorting
    const cadetOptions = [];
    
    // Add cadets to the array
    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (data.firstName && data.lastName && data.asYear) {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = `${data.lastName}, ${data.firstName} (AS${data.asYear})`;
        cadetOptions.push(option);
      }
    });
    
    // Sort cadets alphabetically by the textContent
    cadetOptions.sort((a, b) => a.textContent.localeCompare(b.textContent));
    
    // Add sorted options to the selector
    cadetOptions.forEach(option => selector.appendChild(option));
    
  } catch (error) {
    console.error("Error populating cadet selector:", error);
    showMessage("Error loading cadet list", "error");
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
  if (!trendsContainer) {
    console.error("Trends container not found");
    return;
  }
  
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
  
  if (prevArrow && nextArrow) {
    prevArrow.addEventListener('click', () => {
      navigateToCard(currentCardIndex - 1);
    });
    
    nextArrow.addEventListener('click', () => {
      navigateToCard(currentCardIndex + 1);
    });
  }
  
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
  const chartCanvas = trendCards[index].querySelector('canvas');
  if (chartCanvas) {
    const chartId = chartCanvas.id;
    if (chartInstances[chartId]) {
      setTimeout(() => {
        chartInstances[chartId].resize();
      }, 10);
    }
  }
}

// ===== DATA HANDLING FROM FIRESTORE =====

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
        const totalCadetsCard = document.querySelector('#total-cadets');
        if (totalCadetsCard) {
          totalCadetsCard.querySelector('h3').textContent = 'AS Year';
          totalCadetsCard.querySelector('p').textContent = `AS${cadetData.asYear || 'N/A'}`;
        }
        
        // Update PFA card if data exists
        const avgPFACard = document.querySelector('#avg-pfa');
        if (avgPFACard) {
          if (cadetData.latestPFA && cadetData.latestPFA.totalScore !== undefined) {
            avgPFACard.querySelector('p').textContent = `${cadetData.latestPFA.totalScore}`;
            
            // Set indicator based on pass/fail status
            const pfaIndicator = avgPFACard.querySelector('.standards-indicator');
            if (pfaIndicator) {
              const isPassing = cadetData.latestPFA.totalScore >= 75;
              pfaIndicator.textContent = isPassing ? 'Passing' : 'Not Passing';
              pfaIndicator.className = 'standards-indicator';
              pfaIndicator.classList.add(isPassing ? 'status-good' : 'status-danger');
            }
          } else {
            avgPFACard.querySelector('p').textContent = 'N/A';
            const pfaIndicator = avgPFACard.querySelector('.standards-indicator');
            if (pfaIndicator) {
              pfaIndicator.textContent = 'No Data';
              pfaIndicator.className = 'standards-indicator';
            }
          }
        }
        
        // Update SOB card
        const activeSOBsCard = document.querySelector('#active-sobs');
        if (activeSOBsCard) {
          const sobCount = cadetData.sobScores ? Object.keys(cadetData.sobScores).length : 0;
          activeSOBsCard.querySelector('h3').textContent = 'Active SOBs';
          activeSOBsCard.querySelector('p').textContent = sobCount;
        }
        
        // Update Form 2 completion
        const form2Card = document.querySelector('#form2-completion');
        if (form2Card) {
          form2Card.querySelector('h3').textContent = 'Form 2 Status';
          form2Card.querySelector('p').textContent = cadetData.form2Status || 'Unknown';
          
          // Set indicator based on status
          const form2Indicator = form2Card.querySelector('.standards-indicator');
          if (form2Indicator) {
            const isValid = cadetData.form2Status === 'Valid';
            form2Indicator.textContent = isValid ? 'Current' : (cadetData.form2Status || 'Unknown');
            form2Indicator.className = 'standards-indicator';
            form2Indicator.classList.add(isValid ? 'status-good' : 'status-warning');
          }
        }
        
        return { cadetData: cadetData };
      } else {
        console.error("Cadet document does not exist");
        showMessage("Cadet data not found", "error");
        return { cadetData: null };
      }
    } else {
      // Restore original stat card titles
      const totalCadetsCard = document.querySelector('#total-cadets');
      if (totalCadetsCard) {
        totalCadetsCard.querySelector('h3').textContent = 'Total Cadets';
      }
      
      const avgPFACard = document.querySelector('#avg-pfa');
      if (avgPFACard) {
        avgPFACard.querySelector('h3').textContent = 'Average PFA Score';
      }
      
      const activeSOBsCard = document.querySelector('#active-sobs');
      if (activeSOBsCard) {
        activeSOBsCard.querySelector('h3').textContent = 'Active SOBs';
      }
      
      const form2Card = document.querySelector('#form2-completion');
      if (form2Card) {
        form2Card.querySelector('h3').textContent = 'Form 2 Completion';
      }
      
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
      if (totalCadetsCard) {
        totalCadetsCard.querySelector('p').textContent = totalCadets;
      }
      
      // Count active SOBs
      const activeSOBs = querySnapshot.docs
        .filter(doc => {
          const data = doc.data();
          return data.sobScores && Object.keys(data.sobScores).length > 0;
        }).length;
      
      // Update active SOBs stat card
      if (activeSOBsCard) {
        activeSOBsCard.querySelector('p').textContent = activeSOBs;
      }
      
      // Count Form 2 completion
      const form2Completed = querySnapshot.docs
        .filter(doc => {
          const data = doc.data();
          return data.form2Status === 'Valid';
        }).length;
      
      // Update Form 2 completion stat card
      if (form2Card) {
        const completionRate = totalCadets > 0 ? Math.round((form2Completed / totalCadets) * 100) : 0;
        form2Card.querySelector('p').textContent = `${completionRate}%`;
        
        // Set indicator based on completion rate
        const form2Indicator = form2Card.querySelector('.standards-indicator');
        if (form2Indicator) {
          form2Indicator.textContent = `${form2Completed} of ${totalCadets} Cadets`;
          form2Indicator.className = 'standards-indicator';
          if (completionRate >= 90) {
            form2Indicator.classList.add('status-good');
          } else if (completionRate >= 75) {
            form2Indicator.classList.add('status-warning');
          } else {
            form2Indicator.classList.add('status-danger');
          }
        }
      }
      
      return { totalCadets, activeSOBs, form2Completed };
    }
  } catch (error) {
    console.error("Error fetching cadet stats:", error);
    showMessage("Error loading cadet statistics", "error");
    throw error;
  }
}

function fetchDashboardData() {
  // Show loading indicators
  setLoadingState(true);
  
  // Get the selected time period
  const timePeriodElement = document.getElementById('time-period');
  const timePeriod = timePeriodElement ? timePeriodElement.value : 'month';
  
  // Fetch data from Firestore
  Promise.all([
    fetchCadetStats(),
    fetchPFAData(timePeriod, selectedCadet),
    fetchSOBData(timePeriod, selectedCadet),
    fetchAttendanceData(timePeriod, selectedCadet),
    fetchForm2Data(timePeriod, selectedCadet)
  ])
  .then(() => {
    setLoadingState(false);
    // Update the last update time in the footer
    const lastUpdateElement = document.getElementById('last-update-time');
    if (lastUpdateElement) {
      lastUpdateElement.textContent = new Date().toLocaleString();
    }
  })
  .catch(error => {
    console.error("Error fetching dashboard data:", error);
    showMessage("Error loading dashboard data. Please try again.", "error");
    setLoadingState(false);
  });
}

// ===== UI UTILITY FUNCTIONS =====

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
      if (messageContainer.contains(messageElement)) {
        messageContainer.removeChild(messageElement);
      }
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
      if (chart && chart.data) {
        chartData[chartId] = {
          type: chart.config.type,
          labels: chart.data.labels,
          datasets: chart.data.datasets.map(dataset => ({
            label: dataset.label,
            data: dataset.data
          }))
        };
      }
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