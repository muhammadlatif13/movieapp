const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // Sesuain sama pass db
  database: "movieapp", // Sesuain sama nama db
});

db.connect((err) => {
  if (err) throw err;
  console.log("--Connected--");
});

module.exports = db;
