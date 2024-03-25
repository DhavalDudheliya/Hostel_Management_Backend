const instance = require("../config/server");
const FeeSchema = require("../models/feesModel.js");
const { validatePaymentVerification } = require("../razorpay-utils");
const FeeMaster = require("../models/feeMasterModel");

const checkout = async (req, res) => {
  const payableAmount = req.body.payableAmount;
  // console.log(amount);

  const options = {
    amount: Number(payableAmount * 100), // amount in the smallest currency unit
    currency: "INR",
  };
  const fee = await instance.orders.create(options);

  console.log(fee);

  return res.status(200).json({
    success: true,
    fee,
  });
};

// [Object: null prototype] {
//     razorpay_payment_id: 'pay_NpKulbqOEbatwP',
//     razorpay_order_id: 'order_NpKud4CqMyOb6L',
//     razorpay_signature: 'a1c8c382920108b64c1a83a827fe8384455fa832a912f14eea6e466eb0cc59f5'
//    }

const paymentVerification = async (req, res) => {
  const feeId = req.query.feeId;

  const isAuthenticate = validatePaymentVerification(
    {
      order_id: req.body.razorpay_order_id,
      payment_id: req.body.razorpay_payment_id,
    },
    req.body.razorpay_signature,
    process.env.ROZORPAY_API_SECRET
  );

  if (isAuthenticate) {
    const today = new Date();
    const fee = await FeeSchema.findById(feeId);

    if (!fee) {
      return res.status(404).json({ message: "Fee not found" });
    }

    const feeMaster = await FeeMaster.findById(fee.feeMasterId);

    feeMaster.totalCollection =
      feeMaster.totalCollection + fee.amount - fee.totalAmountPaid;

    fee.paidAmount.push({
      amount: fee.amount - fee.totalAmountPaid,
      date: today,
      method: "Online",
      razorpay_payment_id: req.body.razorpay_payment_id,
      razorpay_order_id: req.body.razorpay_order_id,
      razorpay_signature: req.body.razorpay_signature,
    });
    fee.totalAmountPaid = fee.amount;
    fee.paymentStatus = "Paid";

    await fee.save();
    await feeMaster.save();

    res.redirect(`${process.env.CLIENT_URL}/student/fees`);
  }
};

module.exports = {
  checkout,
  paymentVerification,
};
