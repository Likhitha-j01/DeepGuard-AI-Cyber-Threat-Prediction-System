import { auth } from "./firebase.js";

import {
sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const forgotForm = document.getElementById("forgotForm");

forgotForm.addEventListener("submit",(e)=>{

e.preventDefault();

const email=document.getElementById("email").value;

sendPasswordResetEmail(auth,email)

.then(()=>{

alert("Password reset email has been sent.");

window.location.href="login.html";

})

.catch((error)=>{

alert(error.message);

});

});