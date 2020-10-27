const express = require("express");
const router = express.Router({ mergeParams: true });

const rootDir = require("../utils/path");

const reviewsController = require("../controller/reviews");
const authController = require("../controller/auth");

router.route("/").get(reviewsController.getAllReviews);
router
  .route("/")
  .get(reviewsController.getTourReviews)
  .post(
    authController.isAuthenticated,
    authController.isAuthorized("user"),
    reviewsController.createNewReview
  );

module.exports = router;
