const mongoose = require("mongoose");

const FormerStudentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      require: true,
    },
    lastName: {
      type: String,
      require: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    mobileNumber: {
      type: String,
      require: true,
    },
    whatsappNumber: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    damagedProperties: [
      {
        type: String,
      },
    ],
    propertyFine: {
      type: String,
    },
    remark: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    startYear: {
      type: String,
      required: true,
    },
    endYear: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const FormerStudentModel = mongoose.model("FormerStudent", FormerStudentSchema);
module.exports = FormerStudentModel;
