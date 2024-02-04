const Razorpay = require("razorpay");

const instance = new Razorpay({
  key_id: process.env.ROZORPAY_API_KEY,
  key_secret: process.env.ROZORPAY_API_SECRET,
});

module.exports = instance;
