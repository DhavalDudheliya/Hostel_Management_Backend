const Student = require("../models/studentProfile");
const Leave = require("../models/leaveModel");
const moment = require("moment");

const applyPersonalLeave = async (req, res) => {
  try {
    const { rollNumber, startDate, endDate, reason } = req.body;

    const FormatedstartDate = moment(startDate, "DD-MM-YYYY").toDate();
    const FormatedendDate = moment(endDate, "DD-MM-YYYY").toDate();

    console.log(FormatedstartDate);
    console.log(FormatedendDate);

    // Validate inputs (you might need more thorough validation)
    if (!rollNumber || !startDate || !endDate || !reason) {
      return res
        .status(400)
        .json({ message: "Incomplete information for leave application" });
    }

    // Check if the student exists
    const student = await Student.findOne({ rollNumber: rollNumber });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Create a leave application
    const leaveSchema = new Leave({
      student: student._id,
      startDate: FormatedstartDate,
      endDate: FormatedendDate,
      reason,
      status: "approved",
    });

    // Save the leave application
    await leaveSchema.save();

    student.leaves.push(leaveSchema);
    await student.save();

    res
      .status(200)
      .json({ message: "Leave application submitted successfully" });
  } catch (error) {
    console.error("Error applying for leave:", error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

const applyBulkLeave = async (req, res) => {
  try {
    const { rollNumbers, startDate, endDate, reason } = req.body;

    // Validate inputs (you might need more thorough validation)
    if (!rollNumbers || !startDate || !endDate || !reason) {
      return res
        .status(400)
        .json({ message: "Incomplete information for leave application" });
    }

    // Check if the student exists
    const students = await Student.find({ rollNumber: { $in: rollNumbers } });
    if (!students) {
      return res.status(404).json({ message: "Student not found" });
    }

    for (const student of students) {
      const studentId = student._id;
      const leaveSchema = await createLeaveSchema(
        studentId,
        startDate,
        endDate,
        reason
      );

      student.leaves.push(leaveSchema);
      await student.save();
    }

    res
      .status(200)
      .json({ message: "Leave application submitted successfully" });
  } catch (error) {
    console.error("Error applying for leave:", error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

async function createLeaveSchema(studentId, startDate, endDate, reason) {
  // Create a leave application
  const schema = await Leave.create({
    student: studentId,
    startDate,
    endDate,
    reason,
    status: "approved", // You can set an initial status
  });

  return schema;
}

const findStudentsOnLeave = async (req, res) => {
  try {
    const currentDate = new Date();
    // const formattedCurrentDate = moment(currentDate).format("DDMMYYYY");

    // Find leave applications that overlap with the current date
    const leaveApplications = await Leave.find({
      startDate: { $lte: currentDate }, // Leave starts before or on the current date
      endDate: { $gte: currentDate }, // Leave ends on or after the current date
    }).populate("student");

    if (!leaveApplications) {
      res.status(404).json({ message: "Students not found" });
    }

    return res
      .status(200)
      .json({ message: "Students on leave", leaveApplications });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error finding students on leave:", error });
  }
};

module.exports = {
  applyPersonalLeave,
  applyBulkLeave,
  findStudentsOnLeave,
};
