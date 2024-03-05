const express = require("express");

const router = express.Router();

const { applyPersonalLeave } = require("../controllers/leaveController");
const { protectUser } = require("../middlewares/userProtect");

router.post(
  "/applyPersonalLeave",
  //   (req, res, next) => protectUser(req, res, next, "Admin"),
  applyPersonalLeave
);

module.exports = router;
