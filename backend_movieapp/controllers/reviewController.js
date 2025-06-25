const db = require("../config/db");

exports.upsertReview = (req, res) => {
  const { user_id, movie_id, rating, comment } = req.body;

  const query = `
        INSERT INTO reviews (user_id, movie_id, rating, comment)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment), created_at = CURRENT_TIMESTAMP
    `;

  db.query(query, [user_id, movie_id, rating, comment], (err, result) => {
    if (err)
      return res.status(500).json({ error: "Database error", details: err });
    return res.status(200).json({ message: "Review submitted successfully" });
  });
};

exports.getReviewsByMovie = (req, res) => {
  const { movie_id } = req.params;

  const query = `
        SELECT r.id, r.user_id, u.username, r.rating, r.comment, r.created_at
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.movie_id = ?
        ORDER BY r.created_at DESC
    `;

  db.query(query, [movie_id], (err, results) => {
    if (err)
      return res.status(500).json({ error: "Database error", details: err });
    return res.status(200).json(results);
  });
};

exports.getReviewByUser = (req, res) => {
  const { user_id, movie_id } = req.params;

  const query = `SELECT * FROM reviews WHERE user_id = ? AND movie_id = ?`;

  db.query(query, [user_id, movie_id], (err, results) => {
    if (err)
      return res.status(500).json({ error: "Database error", details: err });
    if (results.length === 0)
      return res.status(404).json({ message: "Review not found" });
    return res.status(200).json(results[0]);
  });
};
