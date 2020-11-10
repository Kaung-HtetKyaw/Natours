const express = require("express");
const router = express.Router({ mergeParams: true });

const reviewsController = require("../controller/reviews");
const authController = require("../controller/auth");

router.use(authController.isAuthenticated);
router
  .route("/")
  .get(reviewsController.getAllReviews)
  .post(
    authController.isAuthorized("user"),
    reviewsController.setTourAndUserID,
    reviewsController.bookedTourBefore,
    reviewsController.createNewReview
  );
router
  .route("/:id")
  .get(reviewsController.getReview)
  .patch(
    authController.isAuthorized("user", "admin"),
    reviewsController.updateReview
  )
  .delete(
    authController.isAuthorized("user", "admin"),
    reviewsController.deleteReview
  );

module.exports = router;
