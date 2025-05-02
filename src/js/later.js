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