const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const puppeteer = require("puppeteer");

let client;

const initializeWhatsAppClient = () => {
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      executablePath: process.env.CHROME_BIN || puppeteer.executablePath(),
    },
  });

  // Generate and display the QR code in the terminal
  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  // Once authenticated, log the client is ready
  client.on("ready", () => {
    console.log("WhatsApp client is ready!");
  });

  // Handle authentication failures
  client.on("auth_failure", (msg) => {
    console.error("Authentication failed:", msg);
  });

  // Start the client
  client.initialize();
};

// Call this function when your application starts
// initializeWhatsAppClient();

// API Route Handler
const sendWhatsAppMessage = async (req, res) => {
  let { WhatAppNumber, message } = req.body;

  // Ensure the number starts with '91'
  WhatAppNumber = `91${WhatAppNumber}`;

  console.log(WhatAppNumber);
  // Ensure the number starts with '91'
  if (!WhatAppNumber.startsWith("91") || !WhatAppNumber.length === 12) {
    return res.status(400).json({ message: "Whatsapp number is not coorect" });
  }

  // Ensure the client is ready
  if (!client || !client.info) {
    return res.status(500).json({ message: "WhatsApp client is not ready." });
  }

  try {
    const chatId = `${WhatAppNumber}@c.us`; // Use the number from the request body

    await client.sendMessage(chatId, message);

    return res.status(200).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("Failed to send message:", err);
    return res
      .status(500)
      .json({ message: "Failed to send message", error: err.message });
  }
};

module.exports = { sendWhatsAppMessage, initializeWhatsAppClient };
