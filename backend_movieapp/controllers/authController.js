const db = require("../config/db");

exports.login = (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Terjadi kesalahan server" });

    if (result.length === 0) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    res.json({ message: "Login berhasil", user: result[0] });
  });
};

exports.register = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username dan password wajib diisi" });
  }

  const checkSql = "SELECT * FROM users WHERE username = ?";
  db.query(checkSql, [username], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Terjadi kesalahan server" });

    if (result.length > 0) {
      return res.status(409).json({ message: "Username sudah digunakan" });
    }

    const insertSql = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(insertSql, [username, password], (err, result) => {
      if (err) return res.status(500).json({ message: "Gagal mendaftar" });

      res
        .status(201)
        .json({ message: "Registrasi berhasil", userId: result.insertId });
    });
  });
};
