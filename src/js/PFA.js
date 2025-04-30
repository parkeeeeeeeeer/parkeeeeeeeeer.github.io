// Import scoring criteria if needed
import { scoringCriteria } from "./pfaCriteria.js";
import { collection, getDocs, doc, updateDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { db } from "./auth.js";

// Load navbar component
document.addEventListener("DOMContentLoaded", function() {
    // Load navbar
    fetch("src/components/navbar.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("navbar-container").innerHTML = data;
        });
    
    // Initialize the cadet search and selection functionality
    initCadetSearch();
    
    // Fetch all cadets from directory to populate search
    fetchDirectory();
});

const searchInput = document.getElementById("cadet-search-input");
const cadetSelectorContainer = document.getElementById("cadet-selector-container");
const selectedCadetInfo = document.getElementById("selected-cadet-info");
const cadetInfoSection = document.getElementById("cadet-info");
const calculateBtn = document.getElementById("calculate-btn");
const saveResultsBtn = document.getElementById("save-results-btn");
const resetFormBtn = document.getElementById("reset-form-btn");

let selectedCadet = null;
let allCadets = []; // Store all valid cadets for filtering
let filteredCadets = []; // Store filtered cadets for display

// Fetch directory data from Firestore
const fetchDirectory = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    
    // Filter out users who don't have AS years between 100-400
    allCadets = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter(user => {
        // Convert asYear to a number if it's a string
        const asYearNum = parseInt(user.asYear);
        
        // Check if asYear exists and is between 100 and 400
        return user.asYear && 
               !isNaN(asYearNum) && 
               asYearNum >= 100 && 
               asYearNum <= 400;
      });
      
    console.log(`Found ${allCadets.length} valid cadets`);
  } catch (error) {
    console.error("Error fetching directory:", error);
  }
};

// Initialize cadet search functionality
function initCadetSearch() {
    // Set up event listener for search input
    searchInput.addEventListener("input", filterCadets);
    
    // Set up event listener for deselect button
    document.getElementById("deselect-cadet-btn").addEventListener("click", deselectCadet);
    
    // Set up reset form button
    resetFormBtn.addEventListener("click", resetForm);
    
    // Set up save results button
    saveResultsBtn.addEventListener("click", saveResults);
}

// Filter cadets based on search input
function filterCadets() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm.length < 2) {
        cadetSelectorContainer.innerHTML = "";
        cadetSelectorContainer.style.display = "none";
        return;
    }
    
    filteredCadets = allCadets.filter(cadet => {
        const fullName = `${cadet.firstName || ""} ${cadet.lastName || ""}`.toLowerCase();
        return fullName.includes(searchTerm);
    }).slice(0, 10); // Limit to 10 results
    
    displayFilteredCadets();
}

// Display filtered cadets in dropdown
function displayFilteredCadets() {
    cadetSelectorContainer.innerHTML = "";
    
    if (filteredCadets.length === 0) {
        cadetSelectorContainer.innerHTML = "<p class='no-results'>No cadets found</p>";
        cadetSelectorContainer.style.display = "block";
        return;
    }
    
    const resultsList = document.createElement("ul");
    resultsList.className = "cadet-results";
    
    filteredCadets.forEach(cadet => {
        const listItem = document.createElement("li");
        listItem.textContent = `${cadet.firstName || ""} ${cadet.lastName || ""} (${cadet.asYear || "N/A"})`;
        listItem.addEventListener("click", () => selectCadet(cadet));
        resultsList.appendChild(listItem);
    });
    
    cadetSelectorContainer.appendChild(resultsList);
    cadetSelectorContainer.style.display = "block";
}

// Handle cadet selection
function selectCadet(cadet) {
    selectedCadet = cadet;
    
    // Update UI to show selected cadet
    document.getElementById("selected-cadet-name").textContent = `${cadet.firstName || ""} ${cadet.lastName || ""} (${cadet.asYear || "N/A"})`;
    selectedCadetInfo.style.display = "block";
    cadetInfoSection.style.display = "block";
    cadetSelectorContainer.style.display = "none";
    searchInput.value = "";
    
    // Populate cadet info in form
    populateCadetInfo(cadet);
    
    // Enable form inputs
    toggleFormInputs(true);
}

// Populate cadet info fields
function populateCadetInfo(cadet) {
    // Set age based on birthdate or default to 20 if not available
    const ageInput = document.getElementById("age");
    ageInput.value = cadet.age;
    
    // Set gender
    const genderSelect = document.getElementById("cadet-gender");
    if (cadet.gender) {
        genderSelect.value = cadet.gender.toLowerCase();
    } else {
        genderSelect.value = "male"; // Default to male if not specified
    }
}

// Deselect current cadet
function deselectCadet() {
    selectedCadet = null;
    
    // Update UI to hide selected cadet info
    selectedCadetInfo.style.display = "none";
    cadetInfoSection.style.display = "none";
    
    // Disable form inputs
    toggleFormInputs(false);
    
    // Reset form
    resetForm();
}

// Toggle form input fields enabled/disabled state
function toggleFormInputs(enabled) {
    // Select all inputs and selects within the form regardless of their current disabled state
    const inputs = document.querySelectorAll("#fitness-form input, #fitness-form select");
    inputs.forEach(input => {
        // Don't enable the age and gender fields which should remain read-only
        if (input.id === "age" || input.id === "cadet-gender") {
            // These fields should be visible but read-only
            input.disabled = true;
        } else {
            input.disabled = !enabled;
        }
    });
    
    calculateBtn.disabled = !enabled;
    saveResultsBtn.disabled = !enabled;
    
    // Log the state for debugging
    console.log(`Form inputs ${enabled ? 'enabled' : 'disabled'}`);
}

// Reset form to initial state
function resetForm() {
    document.getElementById("fitness-form").reset();
    document.getElementById("calculated-scores").style.display = "none";
    document.getElementById("lap-inputs").style.display = "none";
    document.getElementById("status-message").style.display = "none";
    
    // Clear lap time fields
    document.getElementById("lap-time-fields").innerHTML = "";
    
    // If a cadet is selected, keep the form enabled
    if (selectedCadet) {
        populateCadetInfo(selectedCadet);
        toggleFormInputs(true);
    } else {
        toggleFormInputs(false);
    }
    
    // Disable save results button until new calculation
    saveResultsBtn.disabled = true;
}

// Define the function to calculate scores
function calculateScores() {
    // Check if a cadet is selected
    if (!selectedCadet) {
        showStatusMessage("Please select a cadet first", "error");
        return;
    }
    
    const ageElement = document.getElementById("age");
    const pushupScoreElement = document.getElementById("pushup-score");
    const situpScoreElement = document.getElementById("situp-score");
    const lapCountElement = document.getElementById("lap-count");

    // Check if elements exist and have values
    if (!ageElement.value || !pushupScoreElement.value || !situpScoreElement.value || !lapCountElement.value) {
        showStatusMessage("Please fill in all required fields", "error");
        return;
    }

    const pushupScore = parseInt(pushupScoreElement.value) || 0;
    const situpScore = parseInt(situpScoreElement.value) || 0;

    // Get the selected gender from the form
    const genderSelect = document.getElementById('cadet-gender');
    const gender = genderSelect.value;

    const age = parseInt(ageElement.value);

    // Check if age is above 40 and display an error if so
    if (age > 40) {
        showStatusMessage("Error: Age cannot be above 40", "error");
        return;
    }

    const ageGroup = getAgeGroup(age);

    // Initialize total run time in seconds
    let totalRunTimeInSeconds = 0;
    let lastLapTimeInSeconds = 0;

    // Calculate total run time from lap inputs
    const lapTimeFields = document.getElementById("lap-time-fields").getElementsByTagName("input");
    
    // Check if all lap times are filled
    for (let i = 0; i < lapTimeFields.length; i++) {
        if (!lapTimeFields[i].value.trim()) {
            showStatusMessage("Please fill in all lap times", "error");
            return;
        }
    }
    
    // If validation passes, calculate lap times
    // const lapTimeFields = document.getElementById("lap-time-fields").getElementsByTagName("input");
    for (let i = 0; i < lapTimeFields.length; i++) {
        const lapTime = lapTimeFields[i].value.trim();
        if (lapTime) {
            const [minutes, seconds] = lapTime.split(":").map(Number);
            totalRunTimeInSeconds += (minutes * 60) + seconds; // Total run time accumulative
            lastLapTimeInSeconds = (minutes * 60) + seconds; // Update the last lap time
        }
    }
    // Convert last lap time to a readable format (MM:SS)
    const finalRunTime = formatTime(lastLapTimeInSeconds);

    // Calculate points using scoring criteria based on dynamic gender and age group
    const pushupPoints = getPoints(pushupScore, 'pushup', gender, ageGroup);
    const situpPoints = getPoints(situpScore, 'situp', gender, ageGroup); 
    const runPoints = getPoints(lastLapTimeInSeconds, '1.5_mile_run', gender, ageGroup);

    const totalScore = pushupPoints + situpPoints + runPoints;

    // Display the results
    document.getElementById("pushup-result").innerText = `Push-ups: ${pushupScore}, Points: ${pushupPoints}`;
    document.getElementById("situp-result").innerText = `Sit-ups: ${situpScore}, Points: ${situpPoints}`;
    document.getElementById("run-result").innerText = `Run Time: ${finalRunTime}, Points: ${runPoints}`;
    document.getElementById("total-result").innerText = `Total Points: ${totalScore}`;

    // Show the calculated scores section
    document.getElementById("calculated-scores").style.display = 'block';
    
    // Enable save results button
    saveResultsBtn.disabled = false;
    
    // Store the results for saving
    selectedCadet.pfaResults = {
        date: new Date(),
        age: age,
        gender: gender,
        pushups: {
            count: pushupScore,
            points: pushupPoints
        },
        situps: {
            count: situpScore,
            points: situpPoints
        },
        run: {
            time: finalRunTime,
            timeInSeconds: lastLapTimeInSeconds,
            points: runPoints
        },
        totalScore: totalScore
    };
    
    showStatusMessage("Scores calculated successfully", "success");
}

// Helper function to format total run time from seconds to MM:SS
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Function to format lap time inputs to MM:SS format automatically
function formatLapInput(event) {
    const input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remove all non-digit characters

    // Add formatting if there are at least 2 digits (for minutes)
    if (value.length > 2) {
        value = value.slice(0, 2) + ':' + value.slice(2);
    }

    // Ensure it doesn't exceed MM:SS format (e.g., 59:59)
    if (value.length > 5) {
        value = value.slice(0, 5);
    }

    // Update the input field with the formatted value
    input.value = value;
}

// Function to determine the age group based on user input
function getAgeGroup(age) {
    if (age < 25) return '<25';
    else if (age < 30) return '25-29';
    else if (age < 35) return '30-34';
    else if (age < 40) return '35-39';
    return '40+'; // Handle case for ages 40 and above, but this won't be reached due to earlier check
}

// Helper function to get points based on score and criteria
function getPoints(score, exercise, gender, ageGroup) {
    const criteria = scoringCriteria.find(criterion =>
        criterion.exercise === exercise &&
        criterion.gender === gender &&
        criterion.ageGroup === ageGroup &&
        score >= criterion.minPerformanceValue &&
        score <= criterion.maxPerformanceValue
    );

    return criteria ? criteria.points : 0; // Return points or 0 if no criteria met
}

// Add event listeners to newly created input fields
function showLapInputs() {
    const lapCount = parseInt(document.getElementById("lap-count").value);
    const lapInputsContainer = document.getElementById("lap-inputs");
    const lapTimeFields = document.getElementById("lap-time-fields");

    // Clear existing input fields
    lapTimeFields.innerHTML = '';

    if (lapCount > 0) {
        lapInputsContainer.style.display = 'block';

        for (let i = 1; i <= lapCount; i++) {
            const inputField = document.createElement("input");
            inputField.type = "text";
            inputField.placeholder = `Lap ${i} Time (MM:SS)`;
            inputField.addEventListener('input', formatLapInput); // Add formatting listener
            lapTimeFields.appendChild(inputField);
        }
    } else {
        lapInputsContainer.style.display = 'none';
    }
}

// Function to save results to Firestore
async function saveResults() {
    if (!selectedCadet || !selectedCadet.pfaResults) {
        showStatusMessage("No results to save. Please calculate scores first.", "error");
        return;
    }
    
    try {
        // Create a reference to the cadet's document
        const cadetRef = doc(db, "users", selectedCadet.id);
        
        // Create a reference to the PFA submissions collection for this cadet
        const pfaSubmissionRef = doc(collection(db, "users"), Date.now().toString());
        
        // Prepare the PFA data to save
        const pfaData = {
            cadetId: selectedCadet.id,
            cadetName: `${selectedCadet.firstName || ""} ${selectedCadet.lastName || ""}`,
            asYear: selectedCadet.asYear,
            ...selectedCadet.pfaResults,
            submittedAt: serverTimestamp()
        };
        
        // Save to the PFA submissions collection
        await setDoc(pfaSubmissionRef, pfaData);
        
        // Update the cadet's document with their latest PFA results
        await updateDoc(cadetRef, {
            latestPFA: pfaData
        });
        
        showStatusMessage("PFA results saved successfully", "success");
        
        // Reset the form after successful save
        resetForm();
        
        // Keep the cadet selected
        selectedCadetInfo.style.display = "block";
        cadetInfoSection.style.display = "block";
        toggleFormInputs(true);
        
    } catch (error) {
        console.error("Error saving PFA results:", error);
        showStatusMessage("Error saving results. Please try again.", "error");
    }
}

// Function to show status message
function showStatusMessage(message, type = "info") {
    const statusElement = document.getElementById("status-message");
    statusElement.textContent = message;
    statusElement.className = `message ${type}`;
    statusElement.style.display = "block";
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        statusElement.style.display = "none";
    }, 5000);
}

document.getElementById("calculate-btn").addEventListener("click", calculateScores);

// Add event listener for lap count change
document.getElementById("lap-count").addEventListener("change", showLapInputs);