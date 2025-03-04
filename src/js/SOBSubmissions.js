import { objectives } from "./SOB.js";

function renderSOBChart() {
    const sobTable = document.getElementById("sob");
    if (!sobTable) {
        console.error("SOB Table element not found in the DOM!");
        return;
    }

    const tbody = sobTable.querySelector("tbody");
    if (!tbody) {
        console.error("SOB Table <tbody> not found!");
        return;
    }

    // Clear previous content
    tbody.innerHTML = "";

    // Group objectives by category
    const categories = {};
    objectives.forEach(obj => {
        if (!categories[obj.category]) {
            categories[obj.category] = [];
        }
        categories[obj.category].push(obj);
    });

    // Iterate through categories and create sections
    Object.keys(categories).forEach(category => {
        // Create a category header row
        const categoryRow = document.createElement("tr");
        const categoryCell = document.createElement("td");
        categoryCell.textContent = category;
        categoryCell.colSpan = 3; // Span across all columns
        categoryCell.style.fontWeight = "bold";
        categoryCell.style.textAlign = "center";
        categoryCell.style.backgroundColor = "#f0f0f0"; // Light gray background
        categoryRow.appendChild(categoryCell);
        tbody.appendChild(categoryRow);

        // Add objectives under the category
        categories[category].forEach(obj => {
            const row = document.createElement("tr");

            const objectiveNumberCell = document.createElement("td");
            objectiveNumberCell.textContent = obj.objective_number;
            row.appendChild(objectiveNumberCell);

            const descriptionCell = document.createElement("td");
            descriptionCell.textContent = obj.description;
            row.appendChild(descriptionCell);

            const scoreCell = document.createElement("td");
            const scoreInput = document.createElement("input");
            scoreInput.type = "number";
            scoreInput.min = "0";
            scoreInput.max = "100";
            scoreInput.placeholder = "Score";
            scoreCell.appendChild(scoreInput);
            row.appendChild(scoreCell);

            tbody.appendChild(row);
        });
    });

    console.log("SOB table with categorized sections and score input fields rendered successfully!");
}
