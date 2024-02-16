const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  Street: {
    type: String,
    require: true,
  },
  village: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    require: true,
  },
  taluka: {
    type: String,
    require: true,
  },
  postalCode: {
    type: String,
    require: true,
  },
});

const StudentProfileSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: Number,
      unique: true,
      required: true,
    },
    firstName: {
      type: String,
      require: true,
    },
    lastName: {
      type: String,
      require: true,
    },
    address: {
      type: addressSchema,
      require: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    cast: {
      type: String,
      require: true,
    },
    bloodGroup: {
      type: String,
      require: true,
    },
    permenantDisease: {
      type: String,
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
    },
    university: {
      type: String,
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      // required: true,
    },
    lastSchoolName: {
      type: String,
      required: true,
    },
    lastExam: {
      type: String,
      required: true,
    },
    lastExamPercentage: {
      type: String,
      required: true,
    },
    blockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Block",
      default: null,
    },
    roomNumber: {
      type: String,
      default: null,
    },
    fatherFirstName: {
      type: String,
      required: true,
    },
    fatherMiddlename: {
      type: String,
      required: true,
    },
    fatherPhoneNo: {
      type: String,
      required: true,
    },
    fatherWhatsappNo: {
      type: String,
      required: true,
    },
    fatherEmail: {
      type: String,
      require: true,
    },
    work: {
      type: String,
      required: true,
    },
    admissionDate: { type: Date, default: Date.now },
    fees: [{ type: mongoose.Schema.Types.ObjectId, ref: "Fee" }],
  },
  { timestamps: true, versionKey: false }
);

const StudentModel = mongoose.model("Student", StudentProfileSchema);
module.exports = StudentModel;
