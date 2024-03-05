const express = require("express");

const router = express.Router();

const { applyLeave } = require("../controllers/leaveController");
const { protectUser } = require("../middlewares/userProtect");

router.post(
  "/applyLeave",
  //   (req, res, next) => protectUser(req, res, next, "Admin"),
  applyLeave
);

module.exports = router;
