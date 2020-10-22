const express = require("express");
const router = express.Router();

const rootDir = require("../utils/path");

const toursController = require(`${rootDir}/controller/tours`);
const authController = require("../controller/auth");

//posts routes📰
router
  .route("/top-5-cheap")
  .get(toursController.aliasTopTours, toursController.getAllTours);
router.route("/tour-stats").get(toursController.getTourStats);
router.route("/monthly-plans/:year").get(toursController.getMonthlyPlans);
router
  .route("/")
  .get(authController.isAuthenticated, toursController.getAllTours)
  .post(toursController.createNewTour);
router
  .route("/:id")
  .get(toursController.getTour)
  .patch(toursController.updateTour)
  .delete(
    authController.isAuthenticated,
    authController.isAuthorized("admin", "lead"),
    toursController.deleteTour
  );

module.exports = router;
