import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDo74o7WATaG9BRUYLy6_uFrC0wVv7K2Ts",
  authDomain: "venta-de-tacos-f2625.firebaseapp.com",
  databaseURL: "https://venta-de-tacos-f2625-default-rtdb.firebaseio.com",
  projectId: "venta-de-tacos-f2625",
  storageBucket: "venta-de-tacos-f2625.firebasestorage.app",
  messagingSenderId: "75394241968",
  appId: "1:75394241968:web:4dafe276742f3e0da7b275",
  measurementId: "G-XXBV77ECHH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database service
export const database = getDatabase(app); 