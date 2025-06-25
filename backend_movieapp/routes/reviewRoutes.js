const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

router.post("/", reviewController.upsertReview);
router.get("/movie/:movie_id", reviewController.getReviewsByMovie);
router.get("/movie/:movie_id/user/:user_id", reviewController.getReviewByUser);

module.exports = router;
