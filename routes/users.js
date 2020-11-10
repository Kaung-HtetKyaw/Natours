const express = require("express");
const router = express.Router();

const rootDir = require("../utils/path");

const usersController = require(`${rootDir}/controller/users`);
const authController = require("../controller/auth");

const bookingRouter = require("../routes/bookings");

// auth controller 🔐
router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.patch("/verify/:token", authController.verifyAccount);

router.use(authController.isAuthenticated);

router.patch("/updatePassword", authController.updatePassword);
router.patch(
  "/updateMe",
  usersController.uploadUserPhoto,
  usersController.resizeUserPhoto,
  usersController.updateMe
);
router.delete("/deleteMe", usersController.deleteMe);
router.get("/me", usersController.getMe, usersController.getUser);

//users routes🙋
router.use(authController.isAuthorized("admin"));
router.route("/").get(usersController.getAllUsers);
router
  .route("/:id")
  .get(usersController.getUser)
  .patch(usersController.updateUser) //! dont update password with this route
  .delete(usersController.deleteUser);

// nested route for bookings
router.use("/:userId/bookings", bookingRouter);

module.exports = router;
