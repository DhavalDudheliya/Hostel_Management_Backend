const mongoose = require("mongoose");

const feeMasterSchema = new mongoose.Schema(
  {
    year: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    totalCollection: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

const FeeMaster = mongoose.model("FeeMaster", feeMasterSchema);

module.exports = FeeMaster;
