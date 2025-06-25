const express = require("express");
const router = express.Router();
const watchlistController = require("../controllers/watchlistController");

router.get("/check", watchlistController.checkMovieSaved);
router.get("/:user_id", watchlistController.getWatchlist);
router.post("/save", watchlistController.saveMovie);
router.delete("/remove", watchlistController.removeMovie);

module.exports = router;
