// Sample data for cadets based on flight and university
const cadetsData = {
    pocFlight: ['POC Cadet A', 'POC Cadet B'],
    flight1: ['Flight 1 Cadet A', 'Flight 1 Cadet B'],
    flight2: ['Flight 2 Cadet A', 'Flight 2 Cadet B'],
    flight3: ['Flight 3 Cadet A', 'Flight 3 Cadet B'],
    upt: {
        HU1: ['HU1 UPT Cadet A', 'HU1 UPT Cadet B'],
        HU2: ['HU2 UPT Cadet A', 'HU2 UPT Cadet B'],
        AU: ['AU UPT Cadet A', 'AU UPT Cadet B'],
        GW: ['GW UPT Cadet A', 'GW UPT Cadet B'],
        GU: ['GU UPT Cadet A', 'GU UPT Cadet B'],
        CUA: ['CUA UPT Cadet A', 'CUA UPT Cadet B'],
        MU: ['MU UPT Cadet A', 'MU UPT Cadet B'],
    }
};

// Manage display based on event selection
document.getElementById('event').addEventListener('change', function() {
    const eventType = this.value;
    const flightContainer = document.getElementById('flight-container');
    const universityContainer = document.getElementById('university-container');
    
    // Hide both containers initially
    flightContainer.style.display = 'none';
    universityContainer.style.display = 'none';
    document.getElementById('cadets-container').style.display = 'none'; // Hide cadets initially

    // Show flight or university selection based on event type
    if (eventType === 'upt') {
        universityContainer.style.display = 'block';
    } else {
        flightContainer.style.display = 'block';
    }
});

// Populate cadets based on the selected flight or university
document.getElementById('flight').addEventListener('change', function() {
    const flight = this.value;
    const cadetsContainer = document.getElementById('cadets-container');
    const cadetsList = document.getElementById('cadets-list');

    // Clear existing cadet entries
    cadetsList.innerHTML = '';

    if (flight && cadetsData[flight]) {
        cadetsContainer.style.display = 'block';
        cadetsData[flight].forEach(cadet => {
            const cadetDiv = document.createElement('div');
            cadetDiv.className = 'cadet-entry';
            cadetDiv.innerHTML = `
                <label>${cadet}</label>
                <select name="${cadet}">
                    <option value="onTime">On Time</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                    <option value="absentExcused">Absent Excused</option>
                </select>
            `;
            cadetsList.appendChild(cadetDiv);
        });
    } else {
        cadetsContainer.style.display = 'none'; // Hide if no flight selected
    }
});

// Populate cadets based on university selection for UPT
document.getElementById('university').addEventListener('change', function() {
    const university = this.value;
    const cadetsContainer = document.getElementById('cadets-container');
    const cadetsList = document.getElementById('cadets-list');

    // Clear existing cadet entries
    cadetsList.innerHTML = '';

    if (university && cadetsData.upt[university]) {
        cadetsContainer.style.display = 'block';
        cadetsData.upt[university].forEach(cadet => {
            const cadetDiv = document.createElement('div');
            cadetDiv.className = 'cadet-entry';
            cadetDiv.innerHTML = `
                <label>${cadet}</label>
                <select name="${cadet}">
                    <option value="onTime">On Time</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                    <option value="absentExcused">Absent Excused</option>
                </select>
            `;
            cadetsList.appendChild(cadetDiv);
        });
    } else {
        cadetsContainer.style.display = 'none'; // Hide if no university selected
    }
});

// Handle form submission
document.getElementById('attendanceEntryForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const date = document.getElementById('date').value;
    const eventType = document.getElementById('event').value;
    const flight = document.getElementById('flight').value;
    const university = document.getElementById('university').value;

    const attendanceRecords = [];
    const cadetEntries = document.querySelectorAll('.cadet-entry');

    cadetEntries.forEach(entry => {
        const cadetName = entry.querySelector('label').innerText;
        const status = entry.querySelector('select').value;
        attendanceRecords.push({ cadet: cadetName, status: status });
    });

    // Log the data or send it to your backend
    console.log(`Date: ${date}, Event: ${eventType}, Flight: ${flight}, University: ${university}, Attendance Records:`, attendanceRecords);

    // Here you can add functionality to save this data to your backend or display it in your report section
});
