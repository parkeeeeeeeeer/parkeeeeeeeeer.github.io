// import { initializeApp } from "firebase/app";

// const firebaseApp = initializeApp({
//     apiKey:"AIzaSyCc-U6HQZNCoRp9vX6mhJw92vyc4lmK_Ys",
//     projectId: "afrotc-evaluation-tracker",
    
// })

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCc-U6HQZNCoRp9vX6mhJw92vyc4lmK_Ys",
  authDomain: "afrotc-evaluation-tracker.firebaseapp.com",
  projectId: "afrotc-evaluation-tracker",
  storageBucket: "afrotc-evaluation-tracker.firebasestorage.app",
  messagingSenderId: "512597921417",
  appId: "1:512597921417:web:13bc1d371fb68590b6c058",
  measurementId: "G-91ZQ1E7FKK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);