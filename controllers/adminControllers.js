const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Student = require("../models/studentProfile");
const RollNo = require("../models/rollNoModel");
const Blocks = require("../models/blocksModel");
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

const allocateBlock = async (req, res) => {
  try {
    const { name, start, end, capacity } = req.body;
    const isAllocated = await Blocks.findOne({ name: name });
    if (isAllocated) {
      await isAllocated.save();
      return res.status(409).json(isAllocated);
    } else {
      const blockDoc = await Blocks.create({ name: name });
      blockDoc.rooms = [];
      for (let i = start; i <= end; i++) {
        const room = {
          number: i,
          capacity: capacity,
        };
        blockDoc.rooms.push(room);
      }
      await blockDoc.save();
      return res.status(200).json(blockDoc);
    }
  } catch (error) {
    console.log(error);
    return res.json({ message: `Error occured ${error}` });
  }
};

const getAllBlocks = async (req, res) => {
  try {
    const isAllocated = await Blocks.find({});
    return res.status(200).json(isAllocated);
  } catch (error) {
    console.log(error);
    return res.json({ message: `Error occured ${error}` });
  }
};

const allocateStudent = async (req, res) => {
  try {
    const { id } = req.params; // Block ID where we want to allocate the student
    const { roomNumber, rollNo } = req.body; // Room number and student ID

    const studentDoc = await Student.findOne({ rollNumber: rollNo });
    // console.log(studentDoc);
    const studentId = studentDoc._id;
    // console.log(studentId);

    // Find the block with the given ID
    const block = await Blocks.findById(id);
    // console.log(block);

    if (!block) {
      return res.status(404).json({ message: "Block not found" });
    }

    // Check if the student is already allocated to another block
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.blockId) {
      // Student is already allocated to a block, deallocate from the current block
      const currentBlock = await Blocks.findById(student.blockId);

      if (currentBlock) {
        // Remove the student from the current block's allocatedStudents array
        currentBlock.rooms.forEach((room) => {
          room.allocatedStudents.pull(studentId);
        });
        await currentBlock.save();
      }
    }

    // Find the room in the block with the given roomNumber
    const room = block.rooms.find((room) => room.number === roomNumber);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Allocate the student to the room
    room.allocatedStudents.push(studentId);

    // Update the student's blockId and roomNumber
    student.blockId = block._id;
    student.roomNumber = roomNumber;

    // Save the changes
    await block.save();
    await student.save();

    const blockDoc = await Blocks.findById(id).populate({
      path: "rooms.allocatedStudents",
      select:
        "-password -role -resetPasswordToken -resetPasswordExpires -createdAt -updatedAt",
    });

    const roomInfo = blockDoc.rooms.find((room) => room.number === roomNumber);

    return res.status(200).json({ roomInfo });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Error occurred: ${error}` });
  }
};

const getBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const blockDoc = await Blocks.findById(id).populate({
      path: "rooms.allocatedStudents",
      model: "Student",
    });

    if (!blockDoc) {
      return res.status(404).json({ message: "Block does not exist" });
    }

    return res.status(200).json(blockDoc);
  } catch (error) {
    console.log(error);
    return res.json({ message: `Error occurred ${error}` });
  }
};

// Delete Block API
const deleteBlock = async (req, res) => {
  try {
    const { id } = req.params; // Block ID

    // Find the block with the given ID
    const block = await Blocks.findById(id);

    if (!block) {
      return res.status(404).json({ message: "Block not found" });
    }

    // Retrieve the list of allocated students in the block
    const allocatedStudents = block.rooms.reduce(
      (students, room) => students.concat(room.allocatedStudents),
      []
    );

    // Reset the blockId and roomNumber for all allocated students
    await User.updateMany(
      { _id: { $in: allocatedStudents } },
      { blockId: null, roomNumber: null }
    );

    // Delete the block
    await Blocks.findByIdAndDelete(id);

    return res.json({ message: "Block deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Error occurred: ${error}` });
  }
};

module.exports = {
  getAllStudents,
  getActiveSeries,
  createStudent,
  generateRollNumber,
  getSearchSuggestionStudent,
  allocateBlock,
  getAllBlocks,
  allocateStudent,
  getBlock,
  deleteBlock,
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
