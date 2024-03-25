const Student = require("../models/studentProfile");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const getStudentProfile = async (req, res) => {
  try {
    const { email } = req.body;

    const student = await Student.findOne({ email }).populate("fees");
    // console.log(student);

    return res.status(200).json({ student });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occured ${error}` });
  }
};

module.exports = { getStudentProfile };
