const express = require("express");
const router = express.Router();
const bookingsController = require("../controller/bookings");
const authController = require("../controller/auth");

router.get(
  "/checkout-session/:tourId",
  authController.isAuthenticated,
  bookingsController.getCheckoutSession
);
router.use(
  authController.isAuthenticated,
  authController.isAuthorized("admin")
);
router.get("/", bookingsController.getAllBookings);
router
  .route("/:id")
  .get(bookingsController.getBooking)
  .patch(bookingsController.updateBooking)
  .delete(bookingsController.deleteBooking);

module.exports = router;
