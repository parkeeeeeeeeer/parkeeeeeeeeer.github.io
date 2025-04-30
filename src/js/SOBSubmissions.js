import { collection, getDocs, doc, updateDoc, getDoc, serverTimestamp, arrayUnion } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { db } from "./auth.js";
import { objectives } from "./SOB.js";

// Global variables for DOM elements
const sobTableBody = document.querySelector("#sob-table tbody");
const saveButton = document.querySelector("#save-sob-btn");
const resetButton = document.querySelector("#reset-sob-btn");
const sobContainer = document.querySelector("#sob-container");
const statusMessage = document.querySelector("#status-message");
const searchInput = document.querySelector("#cadet-search-input");
const cadetSelectorContainer = document.querySelector("#cadet-selector-container");
const selectedCadetInfo = document.querySelector("#selected-cadet-info");
const selectedCadetName = document.querySelector("#selected-cadet-name");
const deselectButton = document.querySelector("#deselect-cadet-btn");
const sobFilterInput = document.querySelector("#sob-filter-input");
const applyFilterBtn = document.querySelector("#apply-filter-btn");
const clearFilterBtn = document.querySelector("#clear-filter-btn");
const legendTrigger = document.querySelector(".legend-tooltip-trigger");
const proficiencyLegend = document.querySelector(".proficiency-legend");
const closeLegendBtn = document.querySelector(".close-legend");

// State variables
let selectedCadet = null;
let allCadets = []; // Store all valid cadets for filtering
let filteredCadets = []; // Store filtered cadets for display
let filteredObjectives = [...objectives]; // Default to showing all objectives

// Proficiency level numerical values for scoring and comparison
const proficiencyValues = {
    "P3": 100,
    "P2": 90, 
    "P1": 80,
    "Kb": 70,
    "Ka": 60,
    "": 0 // No score
};

// AS Year to SOB column mapping
const asYearToColumn = {
    "100": "bc",
    "200": "bcl",
    "300": "icl",
    "400": "scl"
};

// Load page components and initialize functionality
document.addEventListener("DOMContentLoaded", async () => {
    // Initialize the page
    await initializeSOBPage();
});

// Initialize the SOB page
async function initializeSOBPage() {
    try {
        // Fetch all cadets for directory
        await fetchDirectory();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initial render of all objectives
        renderTable();
    } catch (error) {
        console.error("Error initializing SOB page:", error);
        showStatusMessage("Error loading page. Please refresh and try again.", "error");
    }
}

// Fetch directory data from Firestore
async function fetchDirectory() {
    try {
        const cadetsRef = collection(db, "users");
        const querySnapshot = await getDocs(cadetsRef);
        
        // Filter users who have AS years between 100-400
        allCadets = querySnapshot.docs
            .map(doc => ({
                id: doc.id, // Include the document ID for Firestore references
                ...doc.data()
            }))
            .filter(cadet => {
                const asYearNum = parseInt(cadet.asYear);
                return cadet.asYear && !isNaN(asYearNum) && asYearNum >= 100 && asYearNum <= 400;
            });

        console.log(`Found ${allCadets.length} valid cadets`);
    } catch (error) {
        console.error("Error fetching directory:", error);
        showStatusMessage("Error loading cadets. Please try again.", "error");
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Set up event listener for search input
    searchInput.addEventListener("input", filterCadets);
    
    // Setup SOB filter event listeners
    applyFilterBtn.addEventListener("click", () => filterObjectives(sobFilterInput.value));
    
    clearFilterBtn.addEventListener("click", () => {
        sobFilterInput.value = "";
        filterObjectives("");
    });
    
    // Allow filter to be applied when pressing Enter in the filter input
    sobFilterInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            filterObjectives(sobFilterInput.value);
        }
    });
    
    // Setup proficiency legend tooltip listeners
    legendTrigger.addEventListener("click", toggleProficiencyLegend);
    closeLegendBtn.addEventListener("click", closeProficiencyLegend);
    
    // Close legend when clicking outside
    document.addEventListener("click", (e) => {
        if (proficiencyLegend.classList.contains("active") && 
            !proficiencyLegend.contains(e.target) && 
            !legendTrigger.contains(e.target)) {
            closeProficiencyLegend();
        }
    });
    
    // Setup other event listeners
    deselectButton.addEventListener("click", deselectCadet);
    saveButton.addEventListener("click", saveEvaluation);
    resetButton.addEventListener("click", resetForm);
}

// Toggle the proficiency legend tooltip
function toggleProficiencyLegend() {
    proficiencyLegend.classList.toggle("active");
}

// Close the proficiency legend tooltip
function closeProficiencyLegend() {
    proficiencyLegend.classList.remove("active");
}

// Filter cadets based on search input - PFA style
function filterCadets() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm.length < 2) {
        cadetSelectorContainer.innerHTML = "";
        cadetSelectorContainer.style.display = "none";
        return;
    }
    
    filteredCadets = allCadets.filter(cadet => {
        const fullName = `${cadet.firstName || ""} ${cadet.lastName || ""}`.toLowerCase();
        const lastNameFirst = `${cadet.lastName || ""} ${cadet.firstName || ""}`.toLowerCase();
        return fullName.includes(searchTerm) || lastNameFirst.includes(searchTerm);
    }).slice(0, 10); // Limit to 10 results
    
    displayFilteredCadets();
}

// Display filtered cadets in dropdown - PFA style
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
async function selectCadet(cadet) {
    selectedCadet = cadet;
    
    // Update UI to show selected cadet
    const formattedName = `${cadet.firstName || ""} ${cadet.lastName || ""} (${cadet.asYear || "N/A"})`;
    selectedCadetName.textContent = formattedName;
    selectedCadetInfo.style.display = "block";
    deselectButton.style.display = "inline-block"; // Show the deselect button
    sobContainer.classList.remove("disabled"); // Enable evaluation section
    
    cadetSelectorContainer.innerHTML = ""; // Hide dropdown after selection
    cadetSelectorContainer.style.display = "none";
    searchInput.value = "";
    
    // Fetch current SOB scores for this cadet if they exist
    await loadExistingScores(selectedCadet.id);
    
    // Highlight expected standards based on cadet AS year
    highlightExpectedStandards(selectedCadet.asYear);
}

// Highlight expected standards for the selected cadet based on AS year
function highlightExpectedStandards(asYear) {
    // Clear any existing highlights first
    document.querySelectorAll(".expected-standard").forEach(element => {
        element.classList.remove("expected-standard");
    });
    
    // Skip if no valid AS year
    if (!asYear || !asYearToColumn[asYear]) return;
    
    // Get the column for the cadet's AS year
    const column = asYearToColumn[asYear];
    
    // Highlight the scores in the table
    document.querySelectorAll("tr.objective-row").forEach(row => {
        const objNum = row.querySelector(".obj-number").textContent;
        const objective = objectives.find(obj => obj.objective_number === objNum);
        
        if (objective && objective[column]) {
            // Mark this row to show it has an expected standard
            row.classList.add("has-standard");
            
            // Get the score input
            const scoreInput = row.querySelector(".score-input");
            if (scoreInput) {
                // Add a data attribute with the expected standard
                scoreInput.setAttribute("data-expected", objective[column]);
                
                // Highlight the expected value in the dropdown
                const option = scoreInput.querySelector(`option[value="${objective[column]}"]`);
                if (option) {
                    option.classList.add("expected-standard");
                }
            }
        }
    });
}

// Deselect the current cadet
function deselectCadet() {
    selectedCadet = null;
    selectedCadetName.textContent = "None";
    selectedCadetInfo.style.display = "none";
    sobContainer.classList.add("disabled"); // Disable evaluation section
    deselectButton.style.display = "none"; // Hide deselect button
    resetForm(); // Clear the form when deselecting
    
    // Clear any standard highlights
    document.querySelectorAll(".expected-standard").forEach(element => {
        element.classList.remove("expected-standard");
    });
    
    document.querySelectorAll(".has-standard").forEach(element => {
        element.classList.remove("has-standard");
    });
}

// Load existing scores for the selected cadet
async function loadExistingScores(cadetId) {
    try {
        const cadetRef = doc(db, "users", cadetId);
        const cadetDoc = await getDoc(cadetRef);
        
        if (cadetDoc.exists()) {
            const userData = cadetDoc.data();
            
            if (userData.sobScores) {
                // Populate the form with existing scores
                document.querySelectorAll(".score-input").forEach(input => {
                    const objective = input.getAttribute('data-objective');
                    if (userData.sobScores[objective]) {
                        input.value = userData.sobScores[objective];
                        
                        // Check against expected standard and add appropriate styling
                        const expected = input.getAttribute('data-expected');
                        if (expected) {
                            const scoreValue = proficiencyValues[input.value] || 0;
                            const expectedValue = proficiencyValues[expected] || 0;
                            
                            const row = input.closest('tr');
                            row.classList.remove("meets-standard", "exceeds-standard", "below-standard");
                            
                            if (scoreValue >= expectedValue + 10) {
                                row.classList.add("exceeds-standard");
                            } else if (scoreValue >= expectedValue) {
                                row.classList.add("meets-standard");
                            } else if (scoreValue > 0) {
                                row.classList.add("below-standard");
                            }
                        }
                    } else {
                        input.value = ""; // Clear the input if no score exists
                    }
                });
                
                // Populate comments if they exist
                document.querySelectorAll(".comment-input").forEach(textarea => {
                    const objective = textarea.getAttribute('data-objective');
                    if (userData.sobComments && userData.sobComments[objective]) {
                        textarea.value = userData.sobComments[objective];
                    } else {
                        textarea.value = ""; // Clear the textarea if no comment exists
                    }
                });
                
                showStatusMessage("Loaded existing SOB scores and comments", "success");
            }
        }
    } catch (error) {
        console.error("Error loading existing scores:", error);
        showStatusMessage("Could not load existing scores", "error");
    }
}

// Filter objectives based on input criteria
function filterObjectives(filterValues) {
    // If no filter values, show all objectives
    if (!filterValues || filterValues.length === 0) {
        filteredObjectives = [...objectives];
        renderTable();
        return;
    }

    // Clean up filter values and trim whitespace
    const cleanedFilters = filterValues
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');

    // If all filters were empty, show all objectives
    if (cleanedFilters.length === 0) {
        filteredObjectives = [...objectives];
        renderTable();
        return;
    }

    // Filter objectives based on filter values
    filteredObjectives = objectives.filter(obj => {
        return cleanedFilters.some(filter => {
            // Case insensitive check if the objective number contains the filter value
            return obj.objective_number.toLowerCase().includes(filter.toLowerCase());
        });
    });

    // Render the filtered table
    renderTable();
    
    // Show a status message about how many objectives are being shown
    const message = filteredObjectives.length > 0 
        ? `Showing ${filteredObjectives.length} of ${objectives.length} objectives.`
        : `No objectives match your filter. Please try different criteria.`;
    
    showStatusMessage(message, filteredObjectives.length > 0 ? "success" : "warning");
    
    // Re-highlight expected standards if a cadet is selected
    if (selectedCadet) {
        highlightExpectedStandards(selectedCadet.asYear);
    }
}

// Render the SOB table with filtered objectives
function renderTable() {
    sobTableBody.innerHTML = "";
    
    if (filteredObjectives.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td colspan="4" style="text-align: center; padding: 20px;">
                No matching objectives found. Clear filter to see all objectives.
            </td>
        `;
        sobTableBody.appendChild(row);
        return;
    }
    
    filteredObjectives.forEach(obj => {
        const row = document.createElement("tr");
        row.classList.add("objective-row");
        
        // Add a data attribute to store the category for easier filtering
        row.setAttribute("data-category", obj.category);
        
        row.innerHTML = `
            <td class="obj-number">${obj.objective_number}</td>
            <td class="obj-description">${obj.description}</td>
            <td class="obj-score">
                <select class="score-input" data-objective="${obj.objective_number}">
                    <option value="">Select</option>
                    <option value="Ka">Ka</option>
                    <option value="Kb">Kb</option>
                    <option value="P1">P1</option>
                    <option value="P2">P2</option>
                    <option value="P3">P3</option>
                </select>
            </td>
            <td class="obj-comment">
                <textarea class="comment-input" data-objective="${obj.objective_number}" 
                          placeholder="Add comment..." rows="2"></textarea>
            </td>
        `;
        sobTableBody.appendChild(row);
    });
    
    // Add event listeners to score selects to check against standards
    document.querySelectorAll(".score-input").forEach(input => {
        input.addEventListener("change", function() {
            if (!selectedCadet) return;
            
            const expected = this.getAttribute("data-expected");
            if (!expected) return;
            
            const scoreValue = proficiencyValues[this.value] || 0;
            const expectedValue = proficiencyValues[expected] || 0;
            
            const row = this.closest("tr");
            
            // Remove existing class
            row.classList.remove("meets-standard", "exceeds-standard", "below-standard");
            
            // Add appropriate class based on comparison
            if (scoreValue === 0) {
                // No score selected
            } else if (scoreValue >= expectedValue + 10) {
                row.classList.add("exceeds-standard");
            } else if (scoreValue >= expectedValue) {
                row.classList.add("meets-standard");
            } else {
                row.classList.add("below-standard");
            }
        });
    });
    
    // If a cadet is selected, load their existing scores
    if (selectedCadet) {
        loadExistingScores(selectedCadet.id);
    }
}

// Reset the evaluation form
function resetForm() {
    document.querySelectorAll(".score-input").forEach(input => input.value = "");
    document.querySelectorAll(".comment-input").forEach(textarea => textarea.value = "");
    
    // Clear standard status classes
    document.querySelectorAll("tr.objective-row").forEach(row => {
        row.classList.remove("meets-standard", "exceeds-standard", "below-standard");
    });
    
    showStatusMessage("Form reset successfully!", "success");
}

// Display status messages to the user
function showStatusMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.style.display = "block";
    statusMessage.className = `message ${type}`;
    setTimeout(() => {
        statusMessage.style.display = "none";
    }, 3000);
}

// Calculate the standards achievement for a cadet
function calculateStandardsAchievement() {
    if (!selectedCadet) return null;
    
    const asYear = selectedCadet.asYear;
    const column = asYearToColumn[asYear];
    
    if (!column) return null;
    
    let totalApplicable = 0;
    let meetingCount = 0;
    let exceedingCount = 0;
    let belowCount = 0;
    let notEvaluatedCount = 0;
    
    // Check all scored objectives against the expected standards
    document.querySelectorAll(".score-input").forEach(input => {
        const objective = input.getAttribute("data-objective");
        const objectiveData = objectives.find(obj => obj.objective_number === objective);
        
        // Skip if no expected standard for this objective at cadet's level
        if (!objectiveData || !objectiveData[column]) return;
        
        totalApplicable++;
        
        const score = input.value;
        
        if (!score) {
            notEvaluatedCount++;
            return;
        }
        
        const scoreValue = proficiencyValues[score];
        const expectedValue = proficiencyValues[objectiveData[column]];
        
        if (scoreValue >= expectedValue + 10) {
            exceedingCount++;
        } else if (scoreValue >= expectedValue) {
            meetingCount++;
        } else {
            belowCount++;
        }
    });
    
    // Calculate percentages
    const evaluatedCount = meetingCount + exceedingCount + belowCount;
    const meetingPercent = evaluatedCount > 0 ? Math.round((meetingCount / evaluatedCount) * 100) : 0;
    const exceedingPercent = evaluatedCount > 0 ? Math.round((exceedingCount / evaluatedCount) * 100) : 0;
    const belowPercent = evaluatedCount > 0 ? Math.round((belowCount / evaluatedCount) * 100) : 0;
    
    return {
        totalApplicable,
        evaluatedCount,
        notEvaluatedCount,
        meetingCount,
        exceedingCount,
        belowCount,
        meetingPercent,
        exceedingPercent,
        belowPercent
    };
}

// Save the evaluation to Firestore
async function saveEvaluation() {
    if (!selectedCadet) {
        showStatusMessage("Please select a cadet before saving.", "error");
        return;
    }

    // Create objects to store the scores, comments, and standards assessment
    const sobScores = {};
    const sobComments = {};
    const sobStandards = {};
    let scoresEntered = false;
    
    // Collect all scores, including empty ones
    document.querySelectorAll(".score-input").forEach((input) => {
        const objective = input.getAttribute('data-objective');
        const score = input.value;
        const expected = input.getAttribute('data-expected') || "";
        
        if (score) { // Only save scores that have been selected
            sobScores[objective] = score;
            scoresEntered = true;
            
            // Add standards assessment if there's an expected standard
            if (expected) {
                const scoreValue = proficiencyValues[score];
                const expectedValue = proficiencyValues[expected];
                
                let standardStatus = "not-applicable";
                
                if (scoreValue >= expectedValue + 10) {
                    standardStatus = "exceeding";
                } else if (scoreValue >= expectedValue) {
                    standardStatus = "meeting";
                } else {
                    standardStatus = "below";
                }
                
                sobStandards[objective] = {
                    expected: expected,
                    actual: score,
                    status: standardStatus
                };
            }
        }
    });
    
    // Collect all comments
    document.querySelectorAll(".comment-input").forEach((textarea) => {
        const objective = textarea.getAttribute('data-objective');
        const comment = textarea.value.trim();
        
        if (comment) { // Only save comments that have content
            sobComments[objective] = comment;
        }
    });

    if (!scoresEntered) {
        showStatusMessage("Please enter at least one score before saving.", "warning");
        return;
    }

    try {
        // Calculate average scores based on entered values
        const scoreValues = Object.values(sobScores);
        let numericScores = 0;
        let totalScore = 0;
        
        scoreValues.forEach(score => {
            // Convert letter grades to numeric values for averaging
            const numericValue = proficiencyValues[score] || 0;
            
            if (numericValue > 0) {
                totalScore += numericValue;
                numericScores++;
            }
        });
        
        // Calculate average if there are numeric scores
        const sobAverage = numericScores > 0 ? Math.round(totalScore / numericScores) : 0;
        
        // Calculate standards achievement
        const standardsAchievement = calculateStandardsAchievement();
        
        // Create a reference to the cadet's document in Firestore
        const cadetRef = doc(db, "users", selectedCadet.id);
        
        // Create a recent update entry for the SOB evaluation
        const updateEntry = {
            type: 'sob',
            message: `SOB evaluation updated (${scoreValues.length} objectives)`,
            timestamp: new Date().toISOString()
        };
        
        // Create the data to update in Firestore
        const updateData = {
            sobScores: sobScores,
            sobComments: sobComments,
            sobStandards: sobStandards,
            sobAverage: sobAverage,
            sobStandardsAchievement: standardsAchievement,
            lastUpdated: serverTimestamp()
        };
        
        // Fix for the arrayUnion error - instead of using firebase.firestore.FieldValue.arrayUnion,
        // use the imported arrayUnion from the Firebase module
        await updateDoc(cadetRef, {
            ...updateData,
            recentUpdates: arrayUnion(updateEntry)
        });

        console.log("Saved SOB evaluation for", `${selectedCadet.firstName} ${selectedCadet.lastName}`);
        
        // Create a status message that shows standards achievement
        let statusMsg = `Evaluation saved successfully! Average: ${sobAverage}%`;
        
        if (standardsAchievement && standardsAchievement.evaluatedCount > 0) {
            statusMsg += ` | Standards: ${standardsAchievement.meetingCount + standardsAchievement.exceedingCount}/${standardsAchievement.evaluatedCount} met or exceeded`;
        }
        
        showStatusMessage(statusMsg, "success");
    } catch (error) {
        console.error("Error saving evaluation:", error);
        showStatusMessage("Failed to save evaluation. Please try again.", "error");
    }
}