const express = require("express");

/* ROUTER */
const router = express.Router();

const {
  addNewFee,
  collectFee,
  getStudentByRollNumber,
  revertFee,
  addPanelty,
  clearPanelty
} = require("../controllers/accountantController");
const { protectUser } = require("../middlewares/userProtect");

router.post("/addNewFee", addNewFee);
router.post("/collectFee", collectFee);
router.get("/getStudentByRollNumber", getStudentByRollNumber);
router.post("/revertFee", revertFee);
router.post("/addPanelty", addPanelty);
router.post("/clearPanelty", clearPanelty);

module.exports = router;
