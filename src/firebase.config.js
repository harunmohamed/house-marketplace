// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'


const firebaseConfig = {
  apiKey: "AIzaSyDHg13x6npLAgOgRyglyxQXbxQFhvfeIlI",
  authDomain: "house-marketplace-e4e9d.firebaseapp.com",
  projectId: "house-marketplace-e4e9d",
  storageBucket: "house-marketplace-e4e9d.appspot.com",
  messagingSenderId: "220107560878",
  appId: "1:220107560878:web:01cd06b27adbafd38e9a3f"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();