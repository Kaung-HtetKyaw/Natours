const express = require("express");
const router = express.Router();

const rootDir = require("../utils/path");

const toursController = require(`${rootDir}/controller/tours`);
const authController = require("../controller/auth");
const reviewRouter = require("../routes/reviews");

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
    toursController.updateTour
  )
  .delete(
    authController.isAuthenticated,
    authController.isAuthorized("admin", "lead"),
    toursController.deleteTour
  );
router.use("/:tourId/reviews", reviewRouter);

module.exports = router;
