const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

/* ROUTER */
const router = express.Router();

const { getStudentProfile } = require("../controllers/studentController");
const { protectUser } = require("../middlewares/userProtect");

router.post(
  "/getStudentProfile",
  (req, res, next) => protectUser(req, res, next, "Student"),
  getStudentProfile
);

module.exports = router;
