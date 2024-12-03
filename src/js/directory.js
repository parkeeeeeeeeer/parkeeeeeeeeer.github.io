import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { db } from "./auth.js";

const searchInput = document.getElementById("searchInput");
const roleFilter = document.getElementById("roleFilter");
const directoryTable = document.getElementById("directoryTable");

let directoryData = [];
let selectedPerson = null; // To store the selected person

// Fetch directory data from Firestore
const fetchDirectory = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    directoryData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    displayDirectory(directoryData); // Display all users initially
  } catch (error) {
    console.error("Error fetching directory:", error);
  }
};

// Display the directory data in the table
const displayDirectory = (data = []) => {
  directoryTable.innerHTML = ""; // Clear the table

  data.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.lastName || "N/A"}</td>
      <td>${entry.firstName || "N/A"}</td>
      <td>${entry.email || "N/A"}</td>
      <td>${entry.asYear || "N/A"}</td>
      <td>${entry.university || "N/A"}</td>
    `;
    directoryTable.appendChild(row);

    // Add click event to manually select a person
    row.addEventListener("click", () => setSelectedPerson(entry, row));
  });
};

// Set the selected person and highlight the row
const setSelectedPerson = (person, row) => {
  selectedPerson = person;

  // Remove highlight from all rows
  document.querySelectorAll("#directoryTable tr").forEach((tr) => tr.classList.remove("highlight"));

  // Highlight the selected row
  row.classList.add("highlight");

  console.log("Selected Person:", selectedPerson);
};

// Filter the directory based on search input and role filter
const filterDirectory = () => {
  const searchText = searchInput.value.toLowerCase();
  const selectedRole = roleFilter.value;

  const filteredData = directoryData.filter((entry) => {
    const fullName = `${entry.firstName} ${entry.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchText);
    const matchesRole = !selectedRole || entry.asYear === selectedRole;
    return matchesSearch && matchesRole;
  });

  displayDirectory(filteredData);

  // Automatically select a person if only one match is found
  if (filteredData.length === 1) {
    setSelectedPerson(filteredData[0], directoryTable.querySelector("tr"));
  }
};

// Fetch data and display the initial directory
fetchDirectory();

// Add event listeners for filters
searchInput.addEventListener("input", filterDirectory);
roleFilter.addEventListener("change", filterDirectory);
