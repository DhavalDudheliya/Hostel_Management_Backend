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
  },
  { timestamps: true, versionKey: false }
);

// Virtual property to combine year and semester into the name field with a dash
feeMasterSchema.virtual("name").get(function () {
  return `${this.year} - ${this.semester}`;
});

const FeeMaster = mongoose.model("FeeMaster", feeMasterSchema);

module.exports = FeeMaster;
