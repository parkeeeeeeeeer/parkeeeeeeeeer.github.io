import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { db } from "./auth.js";

const searchInput = document.getElementById("searchInput");
const roleFilter = document.getElementById("roleFilter");
const directoryTable = document.getElementById("directoryTable");

const fetchDirectory = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const directoryData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return directoryData; // Ensure the data is returned
  } catch (error) {
    console.error("Error fetching directory:", error);
    return []; // Return an empty array in case of an error
  }
};

const displayDirectory = (data = []) => { // Default to an empty array
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
  });
};

const filterDirectory = (data) => {
  const searchText = searchInput.value.toLowerCase();
  const selectedRole = roleFilter.value;

  return data.filter((entry) => {
    const matchesSearch = entry.name.toLowerCase().includes(searchText);
    const matchesRole = !selectedRole || entry.role === selectedRole;
    return matchesSearch && matchesRole;
  });
};

// Fetch data and set up filters
let directoryData = [];
fetchDirectory().then((data) => {
  console.log("Fetched Data:", data); // Debugging log
  directoryData = data;
  displayDirectory(data);
});

// Add event listeners for filters
searchInput.addEventListener("input", () => {
  displayDirectory(filterDirectory(directoryData));
});

roleFilter.addEventListener("change", () => {
  displayDirectory(filterDirectory(directoryData));
});
