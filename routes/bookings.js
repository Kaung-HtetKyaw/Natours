const express = require("express");
const router = express.Router({ mergeParams: true });
const bookingsController = require("../controller/bookings");
const authController = require("../controller/auth");

router.use(authController.isAuthenticated);

router.get("/checkout-session/:tourId", bookingsController.getCheckoutSession);

router.use(authController.isAuthorized("admin", "lead"));

router.get("/", bookingsController.getAllBookings);
router
  .route("/:id")
  .get(bookingsController.getBooking)
  .patch(bookingsController.updateBooking)
  .delete(bookingsController.deleteBooking);

module.exports = router;
