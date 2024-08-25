const express = require("express");
const { sendWhatsAppMessage } = require("../controllers/whatsAppMsgController");

/* ROUTER */
const router = express.Router();

router.post("/sendMessage", sendWhatsAppMessage);

module.exports = router;
