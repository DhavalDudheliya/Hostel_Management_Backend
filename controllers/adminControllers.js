const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Student = require("../models/studentProfile");
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
    const {
      rollNumber,
      firstName,
      lastName,
      Street,
      village,
      taluka,
      city,
      postalCode,
      dateOfBirth,
      cast,
      permenantDisease,
      mobileNumber,
      whatsappNumber,
      email,
      university,
      course,
      branch,
      lastSchoolName,
      lastExam,
      lastExamPercentage,
      fatherFirstName,
      fatherMiddlename,
      fatherPhoneNo,
      fatherWhatsappNo,
      fatherEmail,
      work,
    } = req.body;

    const userExists = await Student.findOne({ email });

    if (userExists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const password = () => {
      const min = 100000; // Minimum 6-digit number
      const max = 999999; // Maximum 6-digit number
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const plainPassword = password().toString(); // Convert the number to a string
    const hashedPassword = bcrypt.hashSync(plainPassword, salt);

    const studentDoc = await Student.create({
      rollNumber,
      firstName,
      lastName,
      address: {
        Street,
        village,
        taluka,
        city,
        postalCode,
      },
      dateOfBirth,
      cast,
      permenantDisease,
      mobileNumber,
      whatsappNumber,
      email,
      university,
      course,
      branch,
      lastSchoolName,
      lastExam,
      lastExamPercentage,
      fatherFirstName,
      fatherMiddlename,
      fatherPhoneNo,
      fatherWhatsappNo,
      fatherEmail,
      work,
    });

    const userDoc = await User.create({
      role: "Student",
      firstName,
      lastName,
      email,
      personalPhoneNo: mobileNumber,
      personalWhatsappNo: whatsappNumber,
      password: hashedPassword,
    });

    console.log(userDoc);
    console.log(studentDoc);

    return res.status(200).json(studentDoc);
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

const generateRollNumber = async (req, res) => {
  try {
    const { range } = req.body;

    // Check if the 'range' parameter is provided
    if (!range) {
      return res.status(400).json({ error: "Range parameter is missing" });
    }

    const [start, end] = range.split("-").map(Number);
    const existingNumbers = await Student.find({
      rollNumber: { $gte: start, $lte: end },
    }).distinct("rollNumber");

    const existingNumberSet = new Set(existingNumbers);

    let randomNumber;
    do {
      randomNumber = Math.floor(Math.random() * (end - start + 1)) + start;
    } while (existingNumberSet.has(randomNumber));

    res.json({ randomNumber });
  } catch (error) {
    console.log("Error generating roll number:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getSearchSuggestionStudent = async (req, res) => {
  try {
    const query = req.query.q;
    console.log(query);

    const isNumeric = !isNaN(query);
    console.log(isNumeric);

    let students;

    if (isNumeric) {
      const allStudents = await Student.find({}, "rollNumber");
      const rollNumbers = allStudents.map((student) =>
        student.rollNumber.toString()
      );
      const matchingRollNumbers = rollNumbers.filter((rollNumber) =>
        rollNumber.includes(query)
      );
      const numericRollNumbers = matchingRollNumbers.map(Number);
      console.log(matchingRollNumbers);
      students = await Student.find({
        rollNumber: { $in: numericRollNumbers },
      });
    } else {
      students = await Student.find({
        $or: [
          { firstName: { $regex: new RegExp(query), $options: "i" } },
          { lastName: { $regex: new RegExp(query), $options: "i" } },
          { fatherFirstName: { $regex: new RegExp(query), $options: "i" } },
          { roomNumber: { $regex: new RegExp(query), $options: "i" } },
        ],
      });
    }

    // console.log(students);

    if (students.length === 0) {
      res.status(400).json({ message: "No Students" });
    } else {
      res.status(200).json({ message: "Students ", students });
    }
  } catch (error) {
    console.log("Error in getting Students: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getAllStudents,
  getActiveSeries,
  createStudent,
  generateRollNumber,
  getSearchSuggestionStudent,
};

// const allocateRollNo = async (req, res) => {
//   try {
//     const currentYear = new Date().getFullYear();
//     const isYear = await RollNo.findOne({ year: currentYear });
//     if (isYear) {
//       isYear.current = isYear.current + 1;
//       await isYear.save();
//       res.status(200).json({ year: currentYear, current: isYear.current });
//     } else {
//       RollNo.create({
//         year: currentYear,
//         current: `${currentYear}001`,
//       });
//       res.status(200).json({ year: currentYear, current: `${currentYear}001` });
//     }
//   } catch (error) {
//     console.log(error);
//     return res.json({ message: `Error occured ${error}` });
//   }
// };

// const getCurrentRollNo = async (req, res) => {
//   try {
//     const currentYear = new Date().getFullYear();
//     const isYear = await RollNo.findOne({ year: currentYear });

//     if (isYear) {
//       // Find the highest existing roll number for the current year
//       const highestRollNo = await RollNo.findOne({ year: currentYear }).sort({
//         current: -1,
//       }); // Sort in descending order to get the highest roll number

//       const nextRollNo = highestRollNo ? highestRollNo.current + 1 : 1;

//       res.status(200).json({ year: currentYear, current: nextRollNo });
//     } else {
//       RollNo.create({
//         year: currentYear,
//         current: `${currentYear}001`, // Start with 001 for a new year
//       });
//       res
//         .status(200)
//         .json({ year: currentYear, current: Number(`${currentYear}001`) });
//     }
//   } catch (error) {
//     console.log(error);
//     return res.json({ message: `Error occured ${error}` });
//   }
// };
