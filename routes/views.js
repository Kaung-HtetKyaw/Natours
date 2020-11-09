const express = require("express");

const router = express.Router();
const viewsController = require("../controller/views");
const authController = require("../controller/auth");
const bookingController = require("../controller/bookings");

router.get(
  "/",
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get("/tour/:slug", authController.isLoggedIn, viewsController.getTour);
router.get("/login", authController.isLoggedIn, viewsController.getLogin);
router.get("/signup", authController.isLoggedIn, viewsController.getSignUp);
router.get("/me", authController.isAuthenticated, viewsController.getAccount);
router.get(
  "/my-tours",
  authController.isAuthenticated,
  viewsController.getMyTours
);
router.get(
  "/resetPassword/:token",
  authController.isAuthenticated,
  viewsController.getPasswordReset
);
router.get("/verify/:token", viewsController.getVerify);

module.exports = router;
