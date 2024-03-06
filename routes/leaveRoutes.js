const express = require("express");

const router = express.Router();

const {
  applyPersonalLeave,
  applyBulkLeave,
} = require("../controllers/leaveController");
const { protectUser } = require("../middlewares/userProtect");

router.post(
  "/applyPersonalLeave",
  //   (req, res, next) => protectUser(req, res, next, "Admin"),
  applyPersonalLeave
);
router.post(
  "/applyBulklLeave",
  //   (req, res, next) => protectUser(req, res, next, "Admin"),
  applyBulkLeave
);

module.exports = router;