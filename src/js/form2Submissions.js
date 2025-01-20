import { db } from "./auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/9.x/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.x/firebase-storage.js";

// Initialize Firebase Storage
const storage = getStorage();

// DOM Elements
const searchInput = document.getElementById("searchInput");
const uploadButton = document.getElementById("uploadButton");
const container = document.querySelector(".container");

let selectedUserId = null;

// Function to search Firestore by name
async function searchByName(name) {
  if (name.trim() === "") {
    displayResults([]); // Clear results if input is empty
    return;
  }

  try {
    const q = query(
      collection(db, "cadets"), // Collection name
      where("name", ">=", name),
      where("name", "<=", name + "\uf8ff") // Range query for partial match
    );

    const querySnapshot = await getDocs(q);
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    displayResults(results);
  } catch (error) {
    console.error("Error searching Firestore:", error);
  }
}

// Function to display search results
function displayResults(results) {
  const resultList = document.getElementById("searchResultsContainer");
  resultList.innerHTML = ""; // Clear previous results

  if (results.length === 0) {
    resultList.innerHTML = "<p>No results found</p>";
    return;
  }

  const ul = document.createElement("ul");

  results.forEach((result) => {
    const li = document.createElement("li");
    li.textContent = `${result.name} (ID: ${result.id})`;
    li.addEventListener("click", () => {
      selectedUserId = result.id;
      alert(`Selected User: ${result.name}`);
    });
    ul.appendChild(li);
  });

  resultList.appendChild(ul);
}

// Attach event listener to search input
searchInput.addEventListener("input", (e) => {
  searchByName(e.target.value);
});

// Upload PDF file and link it to the selected user's document
uploadButton.addEventListener("click", async () => {
  const fileInput = document.getElementById("pdf");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file to upload.");
    return;
  }

  if (!selectedUserId) {
    alert("Please select a user first.");
    return;
  }

  try {
    // Upload file to Firebase Storage
    const storageRef = ref(storage, `form2Uploads/${selectedUserId}/${file.name}`);
    await uploadBytes(storageRef, file);

    // Get the file URL
    const fileUrl = await getDownloadURL(storageRef);

    // Update Firestore document with the file URL
    const userDocRef = doc(db, "cadets", selectedUserId);
    await updateDoc(userDocRef, {
      form2Uploads: arrayUnion(fileUrl), // Add file URL to form2Uploads array
    });

    alert("File uploaded and linked successfully!");
  } catch (error) {
    console.error("Error uploading file:", error);
    alert("Error uploading file. Please try again.");
  }
});
