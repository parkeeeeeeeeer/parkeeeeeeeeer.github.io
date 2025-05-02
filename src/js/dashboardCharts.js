// Charts functionality for ROTC Detachment Dashboard
import { doc, getDoc, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { db } from "./auth.js";

// Global chart instances
export let chartInstances = {};

// Initialize all charts with placeholder data
export function initCharts() {
  // Initialize charts with placeholder data
  initEnhancedPFAChart();
  initPFAPassRateChart();
  initSOBChart();
  initSOBStandardsChart();
  // initAttendanceChart();
  // initForm2Chart();
  
  // Make sure all charts are properly visible
  setTimeout(() => {
    Object.values(chartInstances).forEach(chart => {
      chart.resize();
    });
  }, 100);
}

export function initEnhancedPFAChart() {
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
export function initPFAPassRateChart() {
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

export function initSOBChart() {
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

export function initSOBStandardsChart() {
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

// Data-related functions for charts

// Fetch PFA data from Firestore
export async function fetchPFAData(timePeriod, selectedCadet = null) {
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

// Add the SOB data fetching function
export async function fetchSOBData(timePeriod, selectedCadet = null) {
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

// Placeholder functions for other charts (to be implemented later)
export function fetchAttendanceData(timePeriod, selectedCadet = null) {
  // Placeholder for attendance data fetching
  return Promise.resolve({});
}

export function fetchForm2Data(timePeriod, selectedCadet = null) {
  // Placeholder for Form 2 data fetching
  return Promise.resolve({});
}

// Helper function to generate random data for charts
export function generateRandomData(length, maxVariance, base) {
  return Array.from({ length }, () => Math.floor(Math.random() * maxVariance) + base);
}

// Helper function to convert time period to start date
export function getStartDateFromTimePeriod(period) {
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