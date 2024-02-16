const express = require("express");

/* ROUTER */
const router = express.Router();

const {
  addNewFee,
  collectFee,
  getStudentByRollNumber,
} = require("../controllers/accountantController");
const { protectUser } = require("../middlewares/userProtect");

router.post("/addNewFee", addNewFee);
router.post("/collectFee", collectFee);
router.get("/getStudentByRollNumber", getStudentByRollNumber);

module.exports = router;
