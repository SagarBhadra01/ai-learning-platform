const express = require("express");
const router = express.Router();
const courseRouter = require("./course.route");
const xpRouter = require("./xp.route");
const chatRouter = require("./chat.route");

router.use("/", courseRouter);
router.use("/", xpRouter);
router.use("/", chatRouter);

module.exports = router;

