import { auth, db } from "./firebase-init.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Utility function to generate a random referral code
function generateReferralCode(name) {
  const prefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'ARB');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name').value;
      const phone = document.getElementById('phone').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Registering...';

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create the user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          name: name,
          email: email,
          phone: phone,
          role: "client", // Role definition
          referralCode: generateReferralCode(name),
          coupons: [],
          createdAt: new Date().toISOString()
        });

        alert("Registration successful!");
        window.location.href = "account.html";
      } catch (error) {
        console.error("Error during registration:", error);
        alert(error.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Register Account';
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Logging In...';

      try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "account.html";
      } catch (error) {
        console.error("Error during login:", error);
        alert("Login failed: " + error.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Log In';
      }
    });
  }
});
