const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

app.get("/firebase-config", (req, res) => {
    res.json({
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
    });
});

// Serve static files
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/image", express.static(path.join(__dirname, "image")));
app.use("/templates", express.static(path.join(__dirname, "templates")));
app.use(express.static(path.join(__dirname, "templates")));
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    const filePath = path.join(__dirname, "templates", "index.html");
    res.sendFile(filePath);
});

app.get("/login", (req, res) => {
    const filePath = path.join(__dirname, "templates", "login.html");
    res.sendFile(filePath);
});

app.get("/signup", (req, res) => {
    const filePath = path.join(__dirname, "templates", "signup.html");
    res.sendFile(filePath);
});

app.get("/:page", (req, res) => {
    const page = req.params.page;
    if (page === "firebase-config") {
        return res.status(404).send("Page not found");
    }

    const filePath = path.join(__dirname, "templates", `${page}.html`);

    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send("Page not found");
        }
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});