const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Student",
    },
    photo: {
      type: String,
    },
    receiver: {
      type: String,
      required: true,
    },
    isReaded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

const ReportModel = mongoose.model("Report", ReportSchema);
module.exports = ReportModel;
