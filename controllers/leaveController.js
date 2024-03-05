const Student = require("../models/studentProfile");
const Leave = require("../models/leaveModel");

const applyLeave = async (req, res) => {
  try {
    const { studentId, startDate, endDate, reason } = req.body;

    // Validate inputs (you might need more thorough validation)
    if (!studentId || !startDate || !endDate || !reason) {
      return res
        .status(400)
        .json({ message: "Incomplete information for leave application" });
    }

    // Check if the student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Create a leave application
    const leaveApplication = new Leave({
      student: studentId,
      startDate,
      endDate,
      reason,
      status: "approved", // You can set an initial status
    });

    // Save the leave application
    await leaveApplication.save();

    student.leaves.push(leaveApplication);
    await student.save();

    res
      .status(201)
      .json({ message: "Leave application submitted successfully" });
  } catch (error) {
    console.error("Error applying for leave:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const applyBulkLeave = async (req, res) => {
  try {
    const { studentsId, startDate, endDate, reason } = req.body;
  } catch (error) {
    console.error("Error applying for leave:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  applyLeave,
};
