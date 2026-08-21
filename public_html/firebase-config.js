import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBawcEeqrT7GhehC_IRMBZII5PacM0iXCk",
  authDomain: "xertica-eirs.firebaseapp.com",
  projectId: "xertica-eirs",
  storageBucket: "xertica-eirs.firebasestorage.app",
  messagingSenderId: "1093919651285",
  appId: "1:1093919651285:web:303543355c5275c67df95c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy };
