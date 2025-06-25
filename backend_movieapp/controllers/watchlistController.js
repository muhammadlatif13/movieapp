const db = require("../config/db");

exports.saveMovie = (req, res) => {
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("Content-Type:", req.get("Content-Type"));

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "Request body is empty or invalid",
      receivedBody: req.body,
      contentType: req.get("Content-Type"),
    });
  }

  const { user_id, movie_id, title, poster_path, vote_average, release_date } =
    req.body;

  if (!user_id || !movie_id || !title) {
    return res.status(400).json({
      message: "Missing required fields: user_id, movie_id, title",
      receivedData: {
        user_id,
        movie_id,
        title,
        poster_path,
        vote_average,
        release_date,
      },
    });
  }

  const sql = `
    INSERT INTO watchlist (user_id, movie_id, title, poster_path, vote_average, release_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [user_id, movie_id, title, poster_path, vote_average, release_date],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          message: "Gagal menyimpan movie",
          error: err.message,
        });
      }

      res.json({
        message: "Movie berhasil disimpan ke watchlist",
        id: result.insertId,
      });
    }
  );
};

exports.getWatchlist = (req, res) => {
  const { user_id } = req.params;

  const sql =
    "SELECT * FROM watchlist WHERE user_id = ? ORDER BY created_at DESC";

  db.query(sql, [user_id], (err, result) => {
    if (err)
      return res.status(500).json({
        message: "Gagal mengambil watchlist",
        error: err.message,
      });

    res.json(result);
  });
};

exports.checkMovieSaved = (req, res) => {
  const { user_id, movie_id } = req.query;

  if (!user_id || !movie_id) {
    return res.status(400).json({
      message: "Missing required query parameters: user_id, movie_id",
    });
  }

  const sql = "SELECT 1 FROM watchlist WHERE user_id = ? AND movie_id = ?";

  db.query(sql, [user_id, movie_id], (err, result) => {
    if (err)
      return res.status(500).json({
        message: "Gagal memeriksa status",
        error: err.message,
      });

    res.json({ saved: result.length > 0 });
  });
};

exports.removeMovie = (req, res) => {
  const { user_id, movie_id } = req.body;

  const sql = "DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?";
  db.query(sql, [user_id, movie_id], (err, result) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Gagal menghapus movie", error: err.message });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Movie tidak ditemukan di watchlist" });
    }

    res.json({ message: "Movie berhasil dihapus dari watchlist" });
  });
};
