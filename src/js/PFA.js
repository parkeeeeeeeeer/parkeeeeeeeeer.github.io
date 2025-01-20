// Import scoring criteria if needed
import { scoringCriteria } from "./pfaCriteria.js";
import {db} from "./auth.js";


// Define the function to calculate scores
function calculateScores() {
    const ageElement = document.getElementById("age");
    const pushupScoreElement = document.getElementById("pushup-score");
    const situpScoreElement = document.getElementById("situp-score");
    const lapCountElement = document.getElementById("lap-count");

    // Check if elements exist
    if (!ageElement || !pushupScoreElement || !situpScoreElement || !lapCountElement) {
        console.error("One or more input elements not found.");
        return; // Exit if any element is missing
    }

    const pushupScore = parseInt(pushupScoreElement.value) || 0;
    const situpScore = parseInt(situpScoreElement.value) || 0;

    // Get the selected gender from user input and normalize to lowercase
    const genderSelect = document.getElementById('cadet-gender');
    const gender = genderSelect.value;  // Need to change based on the age comming from firebase



    const age = parseInt(ageElement.value); // Need to change based on the age comming from firebase

    // Check if age is above 40 and display an error if so
    if (age > 40) {
        alert("Error: Age cannot be above 40.");
        return; // Stop further processing
    }

    const ageGroup = getAgeGroup(age); // Function to determine the age group

    // Initialize total run time in seconds
    let totalRunTimeInSeconds = 0;
    let lastLapTimeInSeconds = 0; // Variable to hold the last lap time

    // Calculate total run time from lap inputs
    const lapTimeFields = document.getElementById("lap-time-fields").getElementsByTagName("input");
    for (let i = 0; i < lapTimeFields.length; i++) {
        const lapTime = lapTimeFields[i].value.trim();
        if (lapTime) {
            const [minutes, seconds] = lapTime.split(":").map(Number);
            totalRunTimeInSeconds += (minutes * 60) + seconds; // Total run time accumulative
            lastLapTimeInSeconds = (minutes * 60) + seconds; // Update the last lap time
        }
    }

    console.log(gender + " " + ageGroup);
    // Convert last lap time to a readable format (MM:SS)
    const finalRunTime = formatTime(lastLapTimeInSeconds); // Only display the last lap time

    // Calculate points using scoring criteria based on dynamic gender and age group
    const pushupPoints = getPoints(pushupScore, 'pushup', gender, ageGroup);
    const situpPoints = getPoints(situpScore, 'situp', gender, ageGroup); 
    const runPoints = getPoints(lastLapTimeInSeconds, '1.5_mile_run', gender, ageGroup); // Use last lap time for scoring

    const totalScore = pushupPoints + situpPoints + runPoints; // Include run points in total score

    // Display the results
    document.getElementById("pushup-result").innerText = `Push-ups: ${pushupScore}, Points: ${pushupPoints}`;
    document.getElementById("situp-result").innerText = `Sit-ups: ${situpScore}, Points: ${situpPoints}`;
    document.getElementById("run-result").innerText = `Run Time: ${finalRunTime}, Points: ${runPoints}`; // Show final run time
    document.getElementById("total-result").innerText = `Total Points: ${totalScore}`; 

    // Show the calculated scores section
    document.getElementById("calculated-scores").style.display = 'block';
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


// Add event listener to the calculate button
document.getElementById("calculate-btn").addEventListener("click", calculateScores);

// Optionally, add event listener for lap count change
document.getElementById("lap-count").addEventListener("change", showLapInputs);
