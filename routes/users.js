const express = require("express");
const router = express.Router();

const rootDir = require("../utils/path");

const usersController = require(`${rootDir}/controller/users`);
const authController = require("../controller/auth");

// auth controller 🔐
router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.patch(
  "/updatePassword",
  authController.isAuthenticated,
  authController.updatePassword
);

//users routes🙋
router
  .route("/")
  .get(usersController.getAllUsers)
  .post(usersController.createNewUser);
router
  .route("/:id")
  .get(usersController.getUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;
