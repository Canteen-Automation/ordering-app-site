import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDrdJYf39K2q67Wa23neaC-kFPB4N_2XH4",
  authDomain: "canteen-automation-fbc1b.firebaseapp.com",
  projectId: "canteen-automation-fbc1b",
  storageBucket: "canteen-automation-fbc1b.firebasestorage.app",
  messagingSenderId: "428115846692",
  appId: "1:428115846692:web:ced69918fb331b146a9ab1",
  measurementId: "G-5QERG52CJ2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
