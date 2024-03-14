const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Student = require("../models/studentProfile");
const FeeSchema = require("../models/feesModel.js");
const FormerStudent = require("../models/formerStudent");
const RollNo = require("../models/rollNoModel");
const Leaves = require("../models/leaveModel");
const Report = require("../models/reportModel");
const Blocks = require("../models/blocksModel");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const moment = require("moment");

const storage = multer.memoryStorage(); // Store files in memory (you can adjust this based on your requirements)
const upload = multer({ storage: storage });

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
    return res.status(400).json({ message: `Error occured ${error}` });
  }
};

const createStudent = async (req, res) => {
  try {
    const {
      rollNumber,
      firstName,
      lastName,
      bloodGroup,
      street,
      village,
      taluka,
      district,
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

    console.log(req.body);

    let profilePhoto;

    if (req.file) {
      profilePhoto = req.file.filename;
    }

    console.log(profilePhoto);

    const userExists = await Student.findOne({ email });

    if (userExists) {
      return res.status(409).json({ message: "User already exists" });
    }

    // const password = () => {
    //   const min = 100000; // Minimum 6-digit number
    //   const max = 999999; // Maximum 6-digit number
    //   return Math.floor(Math.random() * (max - min + 1)) + min;
    // };
    const password = "123456";

    // const plainPassword = password().toString(); // Convert the number to a string
    const hashedPassword = bcrypt.hashSync(password, salt);

    const studentDoc = await Student.create({
      rollNumber,
      firstName,
      lastName,
      bloodGroup,
      address: {
        street,
        village,
        taluka,
        district,
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
      profilePhoto,
    });

    const userDoc = await User.create({
      role: "Student",
      firstName,
      lastName,
      email,
      personalPhoneNo: mobileNumber,
      personalWhatsappNo: whatsappNumber,
      password: hashedPassword,
      profilePhoto,
    });

    console.log(userDoc);
    console.log(studentDoc);

    if (studentDoc) {
      return res.status(200).json(studentDoc);
    } else {
      return res.status(400).json({ message: "Cannot add Student" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occured ${error}` });
  }
};

const updateStudentProfile = async (req, res) => {
  try {
    const {
      rollNumber,
      firstName,
      lastName,
      dateOfBirth,
      cast,
      bloodGroup,
      permenantDisease,
      mobileNumber,
      whatsappNumber,
      email,
      fatherFirstName,
      fatherEmail,
      fatherMiddlename,
      work,
      fatherPhoneNo,
      fatherWhatsappNo,
      street,
      taluka,
      village,
      postalCode,
      university,
      course,
      branch,
      lastExam,
      lastExamPercentage,
      lastSchoolName,
    } = req.body;

    const student = await Student.findOne({ rollNumber: rollNumber });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.set({
      firstName,
      lastName,
      dateOfBirth,
      cast,
      bloodGroup,
      permenantDisease,
      mobileNumber,
      whatsappNumber,
      email,
      fatherFirstName,
      fatherEmail,
      fatherMiddlename,
      work,
      fatherPhoneNo,
      fatherWhatsappNo,
      street,
      taluka,
      village,
      postalCode,
      university,
      course,
      branch,
      lastExam,
      lastExamPercentage,
      lastSchoolName,
    });
    await student.save();

    const UpdatedStudent = await Student.findOne({
      rollNumber: rollNumber,
    }).populate(["leaves", "fees"]);

    if (UpdatedStudent) {
      res.status(200).json({
        message: "Student profile updated successfully",
        UpdatedStudent,
      });
    }
  } catch (error) {
    res.status(400).json({ error: "Internal Server Error" });
  }
};

const getActiveSeries = async (req, res) => {
  try {
    const rollNoDoc = await RollNo.find();
    res.statusjson(rollNoDoc);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occured ${error}` });
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

    // Find all existing roll numbers within the specified range
    const existingNumbers = await Student.find({
      rollNumber: { $gte: start, $lte: end },
    }).distinct("rollNumber");

    // const existingNumbers = [101, 102, 103, 104, 105, 106, 110];

    const existingNumberSet = new Set(existingNumbers);

    // Find the smallest available roll number within the range
    let smallestAvailableNumber = start;
    while (existingNumberSet.has(smallestAvailableNumber)) {
      smallestAvailableNumber++;
      if (smallestAvailableNumber > end) {
        // If no available roll number is found within the range
        return res.status(400).json({
          error: "No available roll numbers within the specified range",
        });
      }
    }

    res.json({ rollNumber: smallestAvailableNumber });
  } catch (error) {
    console.log("Error generating roll number:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getSearchSuggestionStudent = async (req, res) => {
  try {
    const query = req.query.q;

    const isNumeric = !isNaN(query);

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
      students = await Student.find({
        rollNumber: { $in: numericRollNumbers },
      }).populate(["leaves", "fees"]);
    } else {
      students = await Student.find({
        $or: [
          { firstName: { $regex: new RegExp(query), $options: "i" } },
          { lastName: { $regex: new RegExp(query), $options: "i" } },
        ],
      }).populate(["leaves", "fees"]);
    }

    // console.log(students);

    res.status(200).json({ message: "Students ", students });
  } catch (error) {
    console.log("Error in getting Students: ", error);
    res.status(400).json({ error: "Internal Server Error" });
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
    return res.status(400).json({ message: `Error occured ${error}` });
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
    return res.status(400).json({ message: `Error occurred: ${error}` });
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
    return res.status(400).json({ message: `Error occurred ${error}` });
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
    return res.status(400).json({ message: `Error occurred: ${error}` });
  }
};

/* USER PROFILE PHOTO UPDATE*/
const userProfilePhotoUpdate = async (req, res) => {
  try {
    let profilePhoto;
    if (req.file) {
      profilePhoto = req.file.filename;
    }

    const { studentId } = req.body;

    const studentDoc = await Student.findById(studentId);

    // Delete previous profile photo
    if (studentDoc.profilePhoto) {
      const filePath = path.join("uploads", studentDoc.profilePhoto);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log("Error deleting previous profile photo:", err);
        }
      });
    }

    if (studentDoc) {
      studentDoc.set({
        profilePhoto,
      });
      await studentDoc.save();
      const UpdatedStudent = await Student.findById(studentId);
      res
        .status(200)
        .json({ message: "Photo Updated Succesfully", UpdatedStudent });
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occured ${error}` });
  }
};

const applyNOC = async (req, res) => {
  try {
    const { studentId, damagedProperties, propertyFine, remark, date } =
      req.body;

    const student = await Student.findOne({ _id: studentId });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const formerStudentSchema = await FormerStudent.create({
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth,
      mobileNumber: student.mobileNumber,
      whatsappNumber: student.whatsappNumber,
      email: student.email,
      damagedProperties: damagedProperties,
      propertyFine: propertyFine,
      remark: remark,
      date: date,
      startYear: moment(student.admissionDate).format("YYYY"),
      endYear: moment(Date.now()).format("YYYY"),
    });

    if (formerStudentSchema) {
      // delete user
      await User.findOneAndDelete({ email: student.email });

      const fees = await FeeSchema.find({ student: student._id });

      // Check the status of each fee
      const pendingFees = fees.filter((fee) => fee.paymentStatus !== "Paid");
      const paidFees = fees.filter((fee) => fee.paymentStatus === "Paid");

      // Now you can decide whether to proceed with deletion based on the status of fees
      if (pendingFees.length === 0 && paidFees.length === 0) {
        console.log("No fees found for the student.");
      } else if (pendingFees.length > 0) {
        res.status(409).json({ message: "There are pending fees of student" });
      } else {
        // Perform deletion here
        await FeeSchema.deleteMany({ student: studentId });
        console.log(
          "Fees associated with student ID",
          studentId,
          "deleted successfully."
        );
      }

      // remove student from room
      // Find the block by ID
      const block = await Blocks.findById(student.blockId);

      if (block) {
        // Find the index of the room with the specified room number
        const roomIndex = block.rooms.findIndex(
          (room) => room.number === student.roomNumber
        );

        if (roomIndex !== -1) {
          // Remove the student ID from the allocatedStudents array of the room
          block.rooms[roomIndex].allocatedStudents.pull(student._id);

          // Save the updated block
          await block.save();

          console.log(`Student removed from room ${student.roomNumber}`);
        } else {
          console.log(`Room not found in block `);
        }
      } else {
        console.log(`Block not found.`);
      }

      // Now delete all Leaves entry
      await Leaves.deleteMany({ student: student._id });
      console.log("delete leaves");

      //Delete all reports
      await Report.deleteMany({ author: student._id });
      console.log("delete reports");

      // Finally delete student
      await student.deleteOne({ _id: studentId });

      return res.status(200).json({ message: "NOC applied successfully" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: `Error occured ${error}` });
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
  userProfilePhotoUpdate,
  updateStudentProfile,
  applyNOC,
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
