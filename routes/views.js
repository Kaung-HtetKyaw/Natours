const express = require("express");

const router = express.Router();
const viewsController = require("../controller/views");
const authController = require("../controller/auth");

router.get("/", authController.isLoggedIn, viewsController.getOverview);
router.get("/tour/:slug", authController.isLoggedIn, viewsController.getTour);
router.get("/login", authController.isLoggedIn, viewsController.getLogin);
router.get("/signup", authController.isLoggedIn, viewsController.getSignUp);
router.get("/me", authController.isAuthenticated, viewsController.getAccount);
router.get(
  "/resetPassword/:token",
  authController.isAuthenticated,
  viewsController.getPasswordReset
);

module.exports = router;
