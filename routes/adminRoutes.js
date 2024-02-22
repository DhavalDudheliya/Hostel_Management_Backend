const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

/* ROUTER */
const router = express.Router();

/* ALL FUNCTIONS */
const {
  getAllStudents,
  getActiveSeries,
  createStudent,
  generateRollNumber,
  getSearchSuggestionStudent,
  allocateBlock,
  getAllBlocks,
  allocateStudent,
  getBlock,
  deleteBlock,
} = require("../controllers/adminControllers");
const { protectUser } = require("../middlewares/userProtect");

/* MULTER CONFIGURATIONS */

/* APIs */
router.post(
  "/all-students",
  (req, res, next) => protectUser(req, res, next, "Admin"),
  getAllStudents
);

// router.get(
//   "/getrollno",
//   (req, res, next) => protectUser(req, res, next, "Admin"),
//   getCurrentRollNo
// );

// router.get(
//   "/allocaterollno",
//   (req, res, next) => protectUser(req, res, next, "Admin"),
//   allocateRollNo
// );

router.get(
  "/activeseries",
  (req, res, next) => protectUser(req, res, next, "Admin"),
  getActiveSeries
);

router.post(
  "/createstudent",
  (req, res, next) => protectUser(req, res, next, "Admin"),
  createStudent
);

router.post(
  "/generateRollNumber",
  (req, res, next) => protectUser(req, res, next, "Admin"),
  generateRollNumber
);

router.get("/getSearchSuggestionStudents", getSearchSuggestionStudent);

router.post(
  "/allocate-block",
  (req, res, next) => protectUser(req, res, next, "Admin"),
  allocateBlock
);

router.get(
  "/get-blocks",
  (req, res, next) => protectUser(req, res, next, "Admin"),
  getAllBlocks
);

router.post(
  "/allocate-student/:id",
  (req, res, next) => protectUser(req, res, next, "Admin"),
  allocateStudent
);

router.get(
  "/get-block/:id",
  (req, res, next) => protectUser(req, res, next, "Admin"),
  getBlock
);

router.delete(
  "/delete-block/:id",
  (req, res, next) => protectUser(req, res, next, "Admin"),
  deleteBlock
);

module.exports = router;
