const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

/* ROUTER */
const router = express.Router();

/* ALL FUNCTIONS */
const {
  allocateBlock,
  getAllBlocks,

  allocateStudent,
  getBlock,
  deleteBlock,
} = require("../controllers/managerController");
const { protectUser } = require("../middlewares/userProtect");

/* MULTER CONFIGURATIONS */

/* APIs */

module.exports = router;
