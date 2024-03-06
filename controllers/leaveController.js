const Student = require("../models/studentProfile");
const Leave = require("../models/leaveModel");
const moment = require('moment-timezone');

const applyPersonalLeave = async (req, res) => {
  try {
    const { rollNumber, startDate, endDate, reason } = req.body;

    // Validate inputs (you might need more thorough validation)
    if (!rollNumber || !startDate || !endDate || !reason) {
      return res
        .status(400)
        .json({ message: "Incomplete information for leave application" });
    }

    console.log(startDate);
    console.log(endDate);

    // Check if the student exists
    const student = await Student.findOne({ rollNumber: rollNumber });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
 
     // Create a leave application
     const leaveSchema = new Leave({
       student: student._id,
       startDate: startDate,
       endDate: endDate,
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
    res.status(500).json({ message: "Internal Server Error" });
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
    res.status(500).json({ message: "Internal Server Error" });
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

module.exports = {
  applyPersonalLeave,
  applyBulkLeave,
};
