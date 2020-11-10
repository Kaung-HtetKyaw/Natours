const express = require("express");
const router = express.Router();

const rootDir = require("../utils/path");

const toursController = require(`${rootDir}/controller/tours`);
const authController = require("../controller/auth");
const reviewRouter = require("../routes/reviews");
const bookingRouter = require("../routes/bookings");

//posts routes 📰
router.route("/top-5-cheap").get(toursController.getAllTours);
router
  .route("/tour-stats")
  .get(authController.isAuthenticated, toursController.getTourStats);
router
  .route("/monthly-plans/:year")
  .get(
    authController.isAuthenticated,
    authController.isAuthorized("admin", "lead", "guide"),
    toursController.getMonthlyPlans
  );
router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(toursController.getToursWithin);
router
  .route("/tours-distances/:latlng/unit/:unit")
  .get(toursController.getToursDistances);

router
  .route("/")
  .get(toursController.getAllTours)
  .post(
    authController.isAuthenticated,
    authController.isAuthorized("admin", "lead"),
    toursController.createNewTour
  );
router
  .route("/:id")
  .get(toursController.getTour)
  .patch(
    authController.isAuthenticated,
    authController.isAuthorized("admin", "lead"),
    toursController.uploadTourImages,
    toursController.resizeTourImages,
    toursController.updateTour
  )
  .delete(
    authController.isAuthenticated,
    authController.isAuthorized("admin", "lead"),
    toursController.deleteTour
  );
router.use("/:tourId/reviews", reviewRouter);
router.use("/:tourId/bookings", bookingRouter);

module.exports = router;
