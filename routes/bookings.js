const express = require("express");
const router = express.Router();
const bookingsController = require("../controller/bookings");
const authController = require("../controller/auth");

router.get(
  "/checkout-session/:tourId",
  authController.isAuthenticated,
  bookingsController.getCheckoutSession
);
module.exports = router;
