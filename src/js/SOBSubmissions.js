import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { db } from "./auth.js";
import { objectives } from "./SOB.js";

document.addEventListener("DOMContentLoaded", async () => {
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

    let selectedCadet = null;
    let allCadets = []; // Store all valid cadets for filtering
    let filteredObjectives = [...objectives]; // Default to showing all objectives

    async function fetchCadets() {
        try {
            const cadetsRef = collection(db, "users");
            const querySnapshot = await getDocs(cadetsRef);
            allCadets = querySnapshot.docs
                .map(doc => doc.data())
                .filter(cadet => {
                    const asYearNum = parseInt(cadet.asYear);
                    return cadet.asYear && !isNaN(asYearNum) && asYearNum >= 100 && asYearNum <= 400;
                });

            searchCadets(""); // Show all valid cadets initially
        } catch (error) {
            console.error("Error fetching cadets:", error);
        }
    }

    async function searchCadets(queryText) {
        cadetSelectorContainer.innerHTML = ""; // Clear previous results
    
        const filteredCadets = allCadets.filter(cadet =>
            cadet.lastName?.toLowerCase().includes(queryText.toLowerCase()) || 
            cadet.firstName?.toLowerCase().includes(queryText.toLowerCase())
        );

        if (filteredCadets.length === 0) {
            cadetSelectorContainer.innerHTML = "<p>No cadets found</p>";
            return;
        }

        const list = document.createElement("ul");
        list.classList.add("search-results");

        filteredCadets.forEach(cadet => {
            const formattedName = `C/${cadet.lastName || "N/A"}, ${cadet.firstName || "N/A"}`;
            const listItem = document.createElement("li");
            listItem.classList.add("cadet-item");
            listItem.textContent = formattedName;
            listItem.addEventListener("click", () => selectCadet(cadet, formattedName));
            list.appendChild(listItem);
        });

        cadetSelectorContainer.appendChild(list);
    }

    function selectCadet(cadetData, formattedName) {
        // Always select the new cadet
        selectedCadet = cadetData;
        selectedCadetName.textContent = formattedName;
        selectedCadetInfo.style.display = "block";
        deselectButton.style.display = "inline-block"; // Show the deselect button
        sobContainer.classList.remove("disabled"); // Enable evaluation section
        
        cadetSelectorContainer.innerHTML = ""; // Hide dropdown after selection
    } 

    function deselectCadet() {
        selectedCadet = null;
        selectedCadetName.textContent = "None";
        selectedCadetInfo.style.display = "none";
        sobContainer.classList.add("disabled"); // Disable evaluation section
        deselectButton.style.display = "none"; // Hide deselect button
    }    

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
    }

    function renderTable() {
        sobTableBody.innerHTML = "";
        
        if (filteredObjectives.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td colspan="3" style="text-align: center; padding: 20px;">
                    No matching objectives found. Clear filter to see all objectives.
                </td>
            `;
            sobTableBody.appendChild(row);
            return;
        }
        
        filteredObjectives.forEach(obj => {
            const row = document.createElement("tr");
            row.classList.add("objective-row");
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
            `;
            sobTableBody.appendChild(row);
        });
    }

    function resetForm() {
        document.querySelectorAll(".score-input").forEach(input => input.value = "");
        showStatusMessage("Form reset successfully!", "success");
    }

    function showStatusMessage(message, type) {
        statusMessage.textContent = message;
        statusMessage.style.display = "block";
        statusMessage.className = `message ${type}`;
        setTimeout(() => {
            statusMessage.style.display = "none";
        }, 3000);
    }

    function saveEvaluation() {
        if (!selectedCadet) {
            showStatusMessage("Please select a cadet before saving.", "error");
            return;
        }

        const scores = [];
        document.querySelectorAll(".score-input").forEach((input) => {
            if (input.value) { // Only save scores that have been selected
                scores.push({
                    objective: input.getAttribute('data-objective'),
                    score: input.value
                });
            }
        });

        if (scores.length === 0) {
            showStatusMessage("Please enter at least one score before saving.", "warning");
            return;
        }

        console.log("Submitted Scores for", `C/${selectedCadet.lastName}, ${selectedCadet.firstName}`, scores);
        showStatusMessage("Evaluation saved successfully!", "success");
    }

    // Load all valid cadets when the page loads
    await fetchCadets();

    // Show cadet list when search bar is focused
    searchInput.addEventListener("focus", () => searchCadets(""));

    // Filter cadets when typing
    searchInput.addEventListener("input", () => searchCadets(searchInput.value));
    
    // Setup SOB filter event listeners
    applyFilterBtn.addEventListener("click", () => {
        filterObjectives(sobFilterInput.value);
    });
    
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
    
    // Setup other event listeners
    deselectButton.addEventListener("click", deselectCadet);
    saveButton.addEventListener("click", saveEvaluation);
    resetButton.addEventListener("click", resetForm);

    // Initial render of all objectives
    renderTable();
});