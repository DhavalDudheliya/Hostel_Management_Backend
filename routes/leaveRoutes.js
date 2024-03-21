const express = require("express");

const router = express.Router();

const {
  applyPersonalLeave,
  applyBulkLeave,
  findStudentsOnLeave,
  cancelLeave,
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
router.get(
  "/findStudentsOnLeave",
  //   (req, res, next) => protectUser(req, res, next, "Admin"),
  findStudentsOnLeave
);
router.post(
  "/cancelLeave",
  //   (req, res, next) => protectUser(req, res, next, "Admin"),
  cancelLeave
);

module.exports = router;
