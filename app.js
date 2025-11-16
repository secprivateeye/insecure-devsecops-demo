// app.js
// Intentionally vulnerable Express app for demo purposes ONLY.

const express = require("express");
const crypto = require("crypto");
const { exec } = require("child_process");
const db = require("./db");
const path = require("path");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Insecure CORS: allow everything
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // overly permissive
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// "API key" hardcoded in code (secrets / config leak)
const API_KEY = "DEMO-API-KEY-1234567890"; // secret in code

// Simple home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// --- 1. SQL Injection example ---
// /user?username=admin' OR '1'='1
app.get("/user", (req, res) => {
  const username = req.query.username || "";
  // Intentionally vulnerable query concatenation
  const query = "SELECT * FROM users WHERE username = '" + username + "'";

  console.log("Executing insecure query:", query); // log sensitive data

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send("Database error");
    }
    res.json(results);
  });
});

// --- 2. Reflected XSS example ---
// /search?q=<script>alert('xss')</script>
app.get("/search", (req, res) => {
  const q = req.query.q || "";
  // Send user input directly back to browser without encoding
  res.send(`<h1>Search results for: ${q}</h1>`);
});

// --- 3. Command Injection example ---
// /ping?host=google.com ; cat /etc/passwd
app.get("/ping", (req, res) => {
  const host = req.query.host || "127.0.0.1";
  // Intentionally unsafe use of exec with user input
  exec("ping -c 1 " + host, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).send("Ping failed");
    }
    res.type("text/plain").send(stdout || stderr);
  });
});

// --- 4. Insecure password hashing (MD5) ---
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Intentionally weak hash (no salt, MD5)
  const hash = crypto.createHash("md5").update(password).digest("hex");

  const query =
    "INSERT INTO users (username, password_hash) VALUES ('" +
    username +
    "', '" +
    hash +
    "')";

  db.query(query, err => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error registering user");
    }
    res.send(`User ${username} registered with weak hash (demo only).`);
  });
});

// --- 5. Open admin endpoint (no auth) ---
app.get("/admin", (req, res) => {
  // No authentication / authorization check at all
  res.send("Welcome to the admin panel (no auth, demo vulnerability)!");
});

// --- 6. Unvalidated redirect ---
// /redirect?url=https://evil.com
app.get("/redirect", (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.send("Provide ?url=http://example.com");
  }
  // No validation of target URL
  res.redirect(url);
});

// --- 7. Endpoint leaking secrets ---
app.get("/debug-config", (req, res) => {
  // Return API key and DB info in response (config / secret exposure)
  res.json({
    apiKey: API_KEY,
    dbHost: "localhost",
    note: "This is intentionally insecure for training."
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Insecure DevSecOps demo app listening on http://localhost:${port}`);
});
