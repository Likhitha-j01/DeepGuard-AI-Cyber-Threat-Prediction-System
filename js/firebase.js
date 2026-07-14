import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

let app;
export let auth;
export let db;
export let database;

const fallbackConfig = {
    apiKey: "AIzaSyC8ZK07NnAh3KxA-ckIkilha7oWmUL4Vcc",
    authDomain: "deepguard-58d0d.firebaseapp.com",
    databaseURL: "https://deepguard-58d0d-default-rtdb.firebaseio.com",
    projectId: "deepguard-58d0d",
    storageBucket: "deepguard-58d0d.firebasestorage.app",
    messagingSenderId: "658614949163",
    appId: "1:658614949163:web:4c50770a8dab930cac216e"
};

try {
    let firebaseConfig = fallbackConfig;

    try {
        const response = await fetch("/firebase-config");
        if (response.ok) {
            firebaseConfig = await response.json();
        }
    } catch (error) {
        console.warn("Using fallback Firebase config because the config endpoint was unavailable:", error);
    }

    app = initializeApp({
        apiKey: firebaseConfig.apiKey?.trim?.() || firebaseConfig.apiKey,
        authDomain: firebaseConfig.authDomain?.trim?.() || firebaseConfig.authDomain,
        databaseURL: firebaseConfig.databaseURL?.trim?.() || firebaseConfig.databaseURL,
        projectId: firebaseConfig.projectId?.trim?.() || firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket?.trim?.() || firebaseConfig.storageBucket,
        messagingSenderId: firebaseConfig.messagingSenderId?.trim?.() || firebaseConfig.messagingSenderId,
        appId: firebaseConfig.appId?.trim?.() || firebaseConfig.appId
    });

    auth = getAuth(app);
    db = getFirestore(app);
    database = getDatabase(app);
} catch (error) {
    console.error("Firebase initialization failed:", error);
    throw error;
}