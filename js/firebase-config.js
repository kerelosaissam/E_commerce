// =============================================
// FIREBASE CONFIG — initialise Firebase app
// =============================================

const firebaseConfig = {
  apiKey: "AIzaSyAHnERaUIt6sZOy_bmFOklBjJkSjS-8qaE",
  authDomain: "e-commerce-2d3e2.firebaseapp.com",
  projectId: "e-commerce-2d3e2",
  storageBucket: "e-commerce-2d3e2.firebasestorage.app",
  messagingSenderId: "494424662292",
  appId: "1:494424662292:web:9d3b3461faa165b3136201",
  measurementId: "G-ZXEEMWC8YG",
};

// Initialise Firebase (using compat SDK loaded via script tags)
firebase.initializeApp(firebaseConfig);

// Handy references used everywhere
const auth = firebase.auth();
const db = firebase.firestore();
