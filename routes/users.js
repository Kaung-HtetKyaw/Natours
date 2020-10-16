const express = require("express");
const router = express.Router();

const rootDir = require('../utils/path')

const usersController = require(`${rootDir}/controller/users`);

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
