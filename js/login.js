import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Email Login
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email")?.value || "";
        const password = document.getElementById("password")?.value || "";

        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Login Successful");
            window.location.href = "dashboard.html";
        } catch (error) {
            alert(error.message);
        }
    });
}

// Google Login
const googleBtn = document.getElementById("googleLogin");

if (googleBtn) {
    googleBtn.addEventListener("click", () => {
        const provider = new GoogleAuthProvider();

        signInWithPopup(auth, provider)
            .then(() => {
                window.location.href = "dashboard.html";
            })
            .catch((error) => {
                alert(error.message);
            });
    });
}