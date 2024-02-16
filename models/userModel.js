const mongoose = require("mongoose");

// Define the enum for roles
const roles = ["Student", "Manager", "Accountant", "Admin"];

const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: roles,
      default: "Student",
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    personalPhoneNo: {
      type: String,
      required: true,
    },
    personalWhatsappNo: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePhoto: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
