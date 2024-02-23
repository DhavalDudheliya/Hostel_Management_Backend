const mongoose = require("mongoose");

const paidFeeSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    feeMasterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeMaster",
      required: true,
    },
    amount: { type: Number, required: true },
    penalty: { type: Number, default: 0 },
    dueDate: { type: Date, required: true },
    year: { type: Number, required: true },
    totalAmountPaid: { type: Number, default: 0 },
    semester: {
      type: String,
      enum: ["First Semester", "Second Semester"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Partial", "Paid"],
      default: "Pending",
    },
    paidAmount: [
      {
        type: paidFeeSchema,
        required: false,
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

const Fee = mongoose.model("Fee", feeSchema);

module.exports = Fee;
