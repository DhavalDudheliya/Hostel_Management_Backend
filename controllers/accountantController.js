const User = require("../models/userModel");
const Student = require("../models/studentProfile");
const feeSchema = require("../models/feesModel.js");

const addNewFee = async (req, res) => {
  try {
    const { amount, semester, dueDate, feesFor } = req.body;
    const currentYear = new Date().getFullYear();

    const students = await Student.find();

    const studentsWithEmptyFees = await Student.find({ fees: [] });

    if (feesFor === "new") {
      for (const student of studentsWithEmptyFees) {
        const feeSchema = await createFeeSchema(
          student._id,
          amount,
          currentYear,
          semester,
          dueDate
        );
        student.fees.push(feeSchema);
        await student.save();
      }
    } else if (feesFor === "all") {
      // Loop through all students and add fee schema
      for (const student of students) {
        const feeSchema = await createFeeSchema(
          student._id,
          amount,
          currentYear,
          semester,
          dueDate
        );

        student.fees.push(feeSchema);
        await student.save();
      }
    }

    console.log("Fee schemas added to all students successfully.");
    res.status(200).json({ message: "Success" });
  } catch (error) {
    res.status(400).json({ message: "fail" });
    console.log(error);
  }
};

async function createFeeSchema(
  studentId,
  amount,
  cuurentYear,
  semester,
  dueDate
) {
  const schema = await feeSchema.create({
    studentId: studentId,
    amount: amount,
    year: cuurentYear,
    semester: semester,
    dueDate: dueDate,
  });

  return schema;
}

const collectFee = async (req, res) => {
  try {
    const { studentId, feeId, amount, date } = req.body;

    const feeObject = await feeSchema.findById(feeId);

    if (!feeObject) {
      return res.status(404).json({ message: "Fee not found" });
    }

    // console.log(feeObject);

    const sum = Number(feeObject.totalAmountPaid) + Number(amount);
    // console.log(sum);
    // console.log(feeObject.amount);

    if (sum == feeObject.amount) {
      feeObject.totalAmountPaid = sum;
      feeObject.paymentStatus = "Paid";
    } else if (sum < feeObject.amount) {
      feeObject.totalAmountPaid = sum;
      feeObject.paymentStatus = "Partial";
    } else {
      res.status(400).json({
        message: "Paid amount have became more than required amount",
      });
      return;
    }

    const finalAmount = Number(amount);

    feeObject.paidAmount.push({
      amount: finalAmount,
      date: date,
    });

    await feeObject.save();

    const updatedStudent = await Student.findById(studentId).populate("fees");

    console.log(feeObject);
    res
      .status(200)
      .json({ message: "Paid Successfully", feeObject, updatedStudent });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Failed" });
  }
};

const addPanelty = async (req, res) => {
  try {
    const { feeId, PanaltyAmount } = req.body;

    const feeObject = await feeSchema.findById(feeId);

    if (!feeObject) {
      return res.status(404).json({ message: "Fee not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed" });
  }
};

const getStudentByRollNumber = async (req, res) => {
  try {
    const query = req.query.q;
    // console.log(query);

    const student = await Student.findOne({ rollNumber: query }).populate(
      "fees"
    );

    if (!student) {
      res.status(404).json({ message: "Student not found" });
    } else {
      // console.log(student);
      res.status(200).json({ message: "Success", student });
    }
  } catch (error) {
    console.log("Error in getting details", error);
    res.status(400).json({ message: "Failed" });
  }
};

module.exports = {
  addNewFee,
  collectFee,
  getStudentByRollNumber,
};
