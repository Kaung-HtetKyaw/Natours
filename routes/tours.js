const express = require("express");
const router = express.Router();

const rootDir = require("../utils/path");

const toursController = require(`${rootDir}/controller/tours`);

//posts routes📰
router
  .route("/")
  .get(toursController.getAllTours)
  .post(toursController.createNewTour);
router
  .route("/:id")
  .get(toursController.getTour)
  .patch(toursController.updateTour)
  .delete(toursController.deleteTour);

module.exports = router;
