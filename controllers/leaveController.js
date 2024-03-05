const Student = require("../models/studentProfile");
const Leave = require("../models/leaveModel");

const applyPersonalLeave = async (req, res) => {
  try {
    const { rollNumber, startDate, endDate, reason } = req.body;

    // Validate inputs (you might need more thorough validation)
    if (!rollNumber || !startDate || !endDate || !reason) {
      return res
        .status(400)
        .json({ message: "Incomplete information for leave application" });
    }

    console.log(req.body);

    // Check if the student exists
    const student = await Student.findOne({ rollNumber: rollNumber });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Create a leave application
    const leaveApplication = new Leave({
      student: student._id,
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
  applyPersonalLeave,
};
