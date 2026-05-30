import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB05VNTXapDXeyE36zTkVAXVtOgppQKU2c",
  authDomain: "arb-farms-com.firebaseapp.com",
  projectId: "arb-farms-com",
  storageBucket: "arb-farms-com.firebasestorage.app",
  messagingSenderId: "1065941899166",
  appId: "1:1065941899166:web:37f9ed259622e5eab5688f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
