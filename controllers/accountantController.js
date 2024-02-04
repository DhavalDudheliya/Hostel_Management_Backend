const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const RollNo = require("../models/rollNoModel");
const path = require("path");

/* SALT */
const salt = bcrypt.genSaltSync(10);

const getAllStudents = async (req, res) => {
  try {
    const { rollNo } = req.body;
    let query = { role: "Student" };

    if (rollNo) {
      query.rollNo = { $regex: `^${rollNo}`, $options: "i" };
    }

    const students = await User.find(query);
    return res.status(200).json(students);
  } catch (error) {
    console.log(error);
    return res.json({ message: `Error occured ${error}` });
  }
};

const createStudent = async (req, res) => {
  try {
    const { name, email, phone, password, rollNo } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, salt);

    const userDoc = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "Student",
      rollNo,
    });

    return res.status(200).json(userDoc);
  } catch (error) {
    console.log(error);
    return res.json({ message: `Error occured ${error}` });
  }
};

const getCurrentRollNo = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const isYear = await RollNo.findOne({ year: currentYear });

    if (isYear) {
      // Find the highest existing roll number for the current year
      const highestRollNo = await RollNo.findOne({ year: currentYear }).sort({
        current: -1,
      }); // Sort in descending order to get the highest roll number

      const nextRollNo = highestRollNo ? highestRollNo.current + 1 : 1;

      res.status(200).json({ year: currentYear, current: nextRollNo });
    } else {
      RollNo.create({
        year: currentYear,
        current: `${currentYear}001`, // Start with 001 for a new year
      });
      res
        .status(200)
        .json({ year: currentYear, current: Number(`${currentYear}001`) });
    }
  } catch (error) {
    console.log(error);
    return res.json({ message: `Error occured ${error}` });
  }
};

const allocateRollNo = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const isYear = await RollNo.findOne({ year: currentYear });
    if (isYear) {
      isYear.current = isYear.current + 1;
      await isYear.save();
      res.status(200).json({ year: currentYear, current: isYear.current });
    } else {
      RollNo.create({
        year: currentYear,
        current: `${currentYear}001`,
      });
      res.status(200).json({ year: currentYear, current: `${currentYear}001` });
    }
  } catch (error) {
    console.log(error);
    return res.json({ message: `Error occured ${error}` });
  }
};

const getActiveSeries = async (req, res) => {
  try {
    const rollNoDoc = await RollNo.find();
    res.json(rollNoDoc);
  } catch (error) {
    console.log(error);
    return res.json({ message: `Error occured ${error}` });
  }
};

module.exports = {
  getAllStudents,
  getCurrentRollNo,
  allocateRollNo,
  getActiveSeries,
  createStudent,
};
