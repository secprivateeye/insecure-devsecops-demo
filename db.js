// db.js
// Intentionally insecure DB helper

const mysql = require("mysql");

// Hardcoded credentials (secret scanning / MSDO / GHAS should flag this)
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "SuperSecretPassword123!", // hardcoded secret
  database: "devsecopsdemo"
});

connection.connect(err => {
  if (err) {
    console.error("Error connecting to DB:", err);
  } else {
    console.log("Connected to DB (insecure demo)...");
  }
});

module.exports = connection;
