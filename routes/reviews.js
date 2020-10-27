const express = require("express");
const router = express.Router({ mergeParams: true });

const rootDir = require("../utils/path");

const reviewsController = require("../controller/reviews");
const authController = require("../controller/auth");

router
  .route("/")
  .get(reviewsController.getAllReviews)
  .post(
    authController.isAuthenticated,
    authController.isAuthorized("user"),
    reviewsController.setTourAndUserID,
    reviewsController.createNewReview
  );
router
  .route("/:id")
  .delete(reviewsController.deleteReview)
  .get(reviewsController.getReview)
  .patch(reviewsController.updateReview);

module.exports = router;
