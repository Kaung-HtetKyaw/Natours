const express = require("express");
const router = express.Router();

const rootDir = require("../utils/path");

const reviewsController = require("../controller/reviews");
const authController = require("../controller/auth");

router.route("/").get(reviewsController.getAllReviews);

module.exports = router;
