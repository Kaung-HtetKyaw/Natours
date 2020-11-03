const express = require("express");

const router = express.Router();
const viewsController = require("../controller/views");
const authController = require("../controller/auth");

router.use(authController.isLoggedIn);
router.get("/", viewsController.getOverview);
router.get("/tour/:slug", viewsController.getTour);
router.get("/login", viewsController.getLogin);

module.exports = router;
