import { auth, db, database } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  ref,
  set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullname")?.value?.trim() || "";
    const email = document.getElementById("email")?.value?.trim() || "";
    const phone = document.getElementById("phone")?.value?.trim() || "";
    const role = document.getElementById("role")?.value || "Student";
    const password = document.getElementById("password")?.value || "";
    const confirmPassword = document.getElementById("confirmPassword")?.value || "";

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullName });

      const profileData = {
        uid: user.uid,
        fullName,
        email,
        phone,
        role,
        createdAt: serverTimestamp()
      };

      try {
        await setDoc(doc(db, "users", user.uid), profileData);
      } catch (firestoreError) {
        console.warn("Firestore write failed, trying Realtime Database:", firestoreError);
        await set(ref(database, `users/${user.uid}`), {
          ...profileData,
          createdAt: Date.now()
        });
      }

      alert("Registration Successful");
      window.location.href = "login.html";
    } catch (error) {
      console.error("Registration failed:", error);
      alert(error.message);
    }
  });
}